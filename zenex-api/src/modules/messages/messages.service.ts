import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { MessagesGateway } from './messages.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: MessagesGateway,
    private readonly notifications: NotificationsService,
  ) {}

  /** Resolve the caller's messaging identity (client or provider profile id). */
  private async parties(user: AuthUser) {
    if (user.role === Role.CLIENT) {
      const c = await this.prisma.clientProfile.findUnique({
        where: { userId: user.id },
      });
      if (!c) throw new ForbiddenException('Client profile not found');
      return {
        role: Role.CLIENT as const,
        clientId: c.id,
        providerId: undefined as string | undefined,
      };
    }
    if (user.role === Role.PROVIDER) {
      const p = await this.prisma.providerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!p) throw new ForbiddenException('Provider profile not found');
      return {
        role: Role.PROVIDER as const,
        clientId: undefined as string | undefined,
        providerId: p.id,
      };
    }
    throw new ForbiddenException(
      'Messaging is available to clients and providers',
    );
  }

  async getOrCreateThread(user: AuthUser, counterpartId: string) {
    const parties = await this.parties(user);
    let clientId: string;
    let providerId: string;

    if (parties.role === Role.CLIENT) {
      clientId = parties.clientId as string;
      providerId = counterpartId;
      const prov = await this.prisma.providerProfile.findUnique({
        where: { id: providerId },
      });
      if (!prov) throw new NotFoundException('Provider not found');
    } else {
      providerId = parties.providerId as string;
      clientId = counterpartId;
      const cli = await this.prisma.clientProfile.findUnique({
        where: { id: clientId },
      });
      if (!cli) throw new NotFoundException('Client not found');
    }

    return this.prisma.messageThread.upsert({
      where: { clientId_providerId: { clientId, providerId } },
      update: {},
      create: { tenantId: user.tenantId, clientId, providerId },
    });
  }

  async listThreads(user: AuthUser) {
    const parties = await this.parties(user);
    const where =
      parties.role === Role.CLIENT
        ? { clientId: parties.clientId }
        : { providerId: parties.providerId };

    const threads = await this.prisma.messageThread.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
    });

    // Enrich each thread with the counterpart's display info.
    if (parties.role === Role.CLIENT) {
      const ids = threads.map((t) => t.providerId);
      const provs = await this.prisma.providerProfile.findMany({
        where: { id: { in: ids } },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
      const map = new Map(provs.map((p) => [p.id, p]));
      return threads.map((t) => {
        const p = map.get(t.providerId);
        return {
          ...t,
          counterpart: p
            ? {
                id: p.id,
                name: `${p.user.firstName} ${p.user.lastName}`,
                image: p.imageUrl,
              }
            : null,
        };
      });
    }

    const ids = threads.map((t) => t.clientId);
    const clients = await this.prisma.clientProfile.findMany({
      where: { id: { in: ids } },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    const map = new Map(clients.map((c) => [c.id, c]));
    return threads.map((t) => {
      const c = map.get(t.clientId);
      return {
        ...t,
        counterpart: c
          ? {
              id: c.id,
              name: `${c.user.firstName} ${c.user.lastName}`,
              image: c.avatarUrl,
            }
          : null,
      };
    });
  }

  async getMessages(user: AuthUser, threadId: string) {
    await this.assertParticipant(user, threadId);
    // Mark the other party's unread messages as read.
    await this.prisma.message.updateMany({
      where: { threadId, senderId: { not: user.id }, readAt: null },
      data: { readAt: new Date() },
    });
    return this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(user: AuthUser, threadId: string, body: string) {
    await this.assertParticipant(user, threadId);

    const message = await this.prisma.message.create({
      data: { threadId, senderId: user.id, body },
    });
    await this.prisma.messageThread.update({
      where: { id: threadId },
      data: { lastPreview: body.slice(0, 140), lastMessageAt: new Date() },
    });

    // Push in real time to anyone in the thread room.
    this.gateway.emitNewMessage(threadId, message);

    // Notify the recipient (the participant who isn't the sender).
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
    });
    if (thread) {
      const [clientUserId, providerUserId] = await Promise.all([
        this.notifications.userIdForClient(thread.clientId),
        this.notifications.userIdForProvider(thread.providerId),
      ]);
      const recipient = [clientUserId, providerUserId].find(
        (id) => id && id !== user.id,
      );
      if (recipient) {
        await this.notifications.notify({
          userId: recipient,
          type: 'message',
          title: 'New message',
          body: body.slice(0, 120),
        });
      }
    }

    return message;
  }

  private async assertParticipant(user: AuthUser, threadId: string) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    const parties = await this.parties(user);
    const ok =
      (parties.role === Role.CLIENT && thread.clientId === parties.clientId) ||
      (parties.role === Role.PROVIDER &&
        thread.providerId === parties.providerId);
    if (!ok) throw new ForbiddenException('Not a participant of this thread');
  }
}
