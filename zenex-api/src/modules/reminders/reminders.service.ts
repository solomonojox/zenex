import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Sends a one-time reminder ~24h before each upcoming booking.
 * Runs hourly and marks `reminderSentAt` so a booking is never reminded twice.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Compliance sweep: a provider whose insurance has lapsed loses the verified
   * badge until they upload current coverage. Runs daily.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async enforceDocumentExpiry() {
    const now = new Date();

    const expired = await this.prisma.document.findMany({
      where: { type: 'Insurance', expiresAt: { lt: now } },
      select: { request: { select: { providerId: true } } },
    });

    const providerIds = [
      ...new Set(expired.map((d) => d.request.providerId).filter(Boolean)),
    ];
    if (providerIds.length === 0) return;

    // Only touch providers still marked verified.
    const affected = await this.prisma.providerProfile.findMany({
      where: { id: { in: providerIds }, verified: true },
      select: { id: true, userId: true },
    });
    if (affected.length === 0) return;

    await this.prisma.providerProfile.updateMany({
      where: { id: { in: affected.map((p) => p.id) } },
      data: { verified: false },
    });

    this.logger.warn(
      `De-verified ${affected.length} provider(s) with expired insurance`,
    );

    await this.notifications.notifyMany(
      affected.map((p) => ({
        userId: p.userId,
        type: 'verification' as const,
        title: 'Verification paused — insurance expired',
        body: 'Upload current coverage in the Verification tab to restore your badge.',
      })),
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendDueReminders() {
    const now = new Date();
    // Anything starting in the next 25 hours that hasn't been reminded yet;
    // running hourly means each booking is caught exactly once.
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const due = await this.prisma.booking.findMany({
      where: {
        reminderSentAt: null,
        scheduledFor: { gt: now, lte: windowEnd },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      },
      include: {
        service: true,
        client: { include: { user: true } },
        provider: { include: { user: true } },
      },
    });

    if (due.length === 0) return;
    this.logger.log(`Sending ${due.length} booking reminder(s)`);

    for (const b of due) {
      const serviceName = b.service?.name ?? 'Cleaning';
      const clientUser = b.client?.user;
      const providerUser = b.provider?.user;
      const clientName = clientUser?.firstName ?? 'there';
      const providerName = providerUser
        ? `${providerUser.firstName} ${providerUser.lastName}`.trim()
        : 'your pro';

      try {
        if (clientUser?.email) {
          await this.mail.bookingReminder({
            to: clientUser.email,
            name: clientName,
            counterpartName: providerName,
            serviceName,
            reference: b.reference,
            scheduledFor: b.scheduledFor,
          });
        }
        if (providerUser?.email) {
          await this.mail.bookingReminder({
            to: providerUser.email,
            name: providerUser.firstName,
            counterpartName: clientName,
            serviceName,
            reference: b.reference,
            scheduledFor: b.scheduledFor,
          });
        }

        await this.notifications.notifyMany(
          [clientUser?.id, providerUser?.id]
            .filter((id): id is string => !!id)
            .map((userId) => ({
              userId,
              type: 'booking' as const,
              title: `Reminder: ${serviceName} tomorrow`,
              body: `Booking ${b.reference}`,
            })),
        );

        await this.prisma.booking.update({
          where: { id: b.id },
          data: { reminderSentAt: new Date() },
        });
      } catch (e) {
        // Leave reminderSentAt null so the next run retries this booking.
        this.logger.warn(
          `Reminder failed for ${b.reference}: ${(e as Error).message}`,
        );
      }
    }
  }
}
