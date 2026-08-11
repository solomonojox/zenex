import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

/** Notification categories — drive the icon/colour on the client. */
export type NotificationType =
  | 'booking'
  | 'payment'
  | 'message'
  | 'review'
  | 'verification'
  | 'info';

export interface NotifyInput {
  userId: string;
  title: string;
  body?: string;
  type?: NotificationType;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fire-and-forget notification. Never throws — a failed notification must
   * not roll back the business action that triggered it.
   */
  async notify(input: NotifyInput): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: input.userId,
          title: input.title,
          body: input.body,
          type: input.type ?? 'info',
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to create notification: ${(e as Error).message}`);
    }
  }

  /** Notify several users at once (e.g. both sides of a booking). */
  async notifyMany(inputs: NotifyInput[]): Promise<void> {
    await Promise.all(inputs.map((i) => this.notify(i)));
  }

  /** Resolve the user id behind a provider profile, for notifying providers. */
  async userIdForProvider(providerId: string): Promise<string | null> {
    const p = await this.prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { userId: true },
    });
    return p?.userId ?? null;
  }

  /** Resolve the user id behind a client profile. */
  async userIdForClient(clientId: string): Promise<string | null> {
    const c = await this.prisma.clientProfile.findUnique({
      where: { id: clientId },
      select: { userId: true },
    });
    return c?.userId ?? null;
  }

  // ─────────────── Reads ───────────────

  async list(user: AuthUser, limit = 30) {
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async unreadCount(user: AuthUser) {
    const count = await this.prisma.notification.count({
      where: { userId: user.id, read: false },
    });
    return { count };
  }

  async markRead(user: AuthUser, id: string) {
    const existing = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!existing || existing.userId !== user.id) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(user: AuthUser) {
    await this.prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return { ok: true };
  }
}
