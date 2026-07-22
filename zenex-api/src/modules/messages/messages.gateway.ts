import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Real-time messaging over Socket.IO (namespace: /messages).
 * Auth: the client passes its JWT access token in the handshake
 *   (socket = io('/messages', { auth: { token } })).
 * Rooms: one per thread ("thread:<id>"); the REST send endpoint pushes
 *   new messages to the room via emitNewMessage().
 */
@WebSocketGateway({
  namespace: '/messages',
  cors: { origin: true, credentials: true },
})
export class MessagesGateway implements OnGatewayConnection {
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);
      if (!token) throw new Error('Missing token');

      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
      client.data.userId = payload.sub;
      client.data.role = payload.role;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('thread:join')
  async joinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = client.data.userId as string;
    if (!userId || !data?.threadId) return { ok: false };

    const allowed = await this.isParticipant(userId, data.threadId);
    if (!allowed) return { ok: false, error: 'Not a participant' };

    client.join(`thread:${data.threadId}`);
    return { ok: true };
  }

  /** Called by MessagesService after persisting a message. */
  emitNewMessage(threadId: string, message: unknown) {
    this.server?.to(`thread:${threadId}`).emit('message:new', message);
  }

  private async isParticipant(userId: string, threadId: string) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) return false;

    const client = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (client && client.id === thread.clientId) return true;

    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (provider && provider.id === thread.providerId) return true;

    return false;
  }
}
