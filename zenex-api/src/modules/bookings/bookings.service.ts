import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { AvailabilityService } from '../availability/availability.service';
import { calculateTax } from '../../common/tax/canadian-tax';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { PaymentsService } from '../payments/payments.service';
import { ConfigService } from '@nestjs/config';

// Relations returned with a booking so the frontend has everything it needs.
const bookingInclude = {
  extras: true,
  service: true,
  provider: {
    include: { user: { select: { firstName: true, lastName: true } } },
  },
  client: {
    include: { user: { select: { firstName: true, lastName: true } } },
  },
  review: true,
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
    private readonly payments: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  private genReference(): string {
    return 'BK-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  /** Client creates a booking (maps to the 5-step booking flow). */
  async create(user: AuthUser, dto: CreateBookingDto) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { userId: user.id },
    });
    if (!client) {
      throw new ForbiddenException('Only clients can create bookings');
    }

    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: dto.providerId },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Base price: from the chosen service, else hourly rate * hours.
    let basePrice: number;
    let serviceId: string | undefined = dto.serviceId;
    if (dto.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: { id: dto.serviceId, providerId: provider.id },
      });
      if (!service) {
        throw new BadRequestException(
          'Service does not belong to this provider',
        );
      }
      basePrice = service.price;
    } else {
      const hours = dto.hours ?? provider.minBookingHrs;
      basePrice = provider.hourlyRate * hours;
      serviceId = undefined;
    }

    const extras = dto.extras ?? [];
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
    // Sales tax is based on where the service is performed (provider's province).
    const tax = calculateTax(basePrice + extrasTotal, provider.location);
    const totalPrice = tax.total;

    // Reject the booking if the provider is already busy or off at that time.
    const scheduledFor = new Date(dto.scheduledFor);
    const durationMins =
      dto.durationMins ?? (dto.hours ? dto.hours * 60 : undefined) ?? 120;

    if (Number.isNaN(scheduledFor.getTime())) {
      throw new BadRequestException('Invalid scheduledFor date');
    }
    if (scheduledFor <= new Date()) {
      throw new BadRequestException('Bookings must be scheduled in the future');
    }

    const conflict = await this.availability.hasConflict(
      provider.id,
      scheduledFor,
      durationMins,
    );
    if (conflict) {
      throw new BadRequestException(
        'That time slot is no longer available — please pick another.',
      );
    }

    const created = await this.prisma.booking.create({
      data: {
        reference: this.genReference(),
        tenant: { connect: { id: provider.tenantId } },
        client: { connect: { id: client.id } },
        provider: { connect: { id: provider.id } },
        ...(serviceId ? { service: { connect: { id: serviceId } } } : {}),
        scheduledFor,
        durationMins,
        timeSlot: dto.timeSlot,
        // Instant-book providers auto-confirm; others start pending.
        status: provider.instant
          ? BookingStatus.CONFIRMED
          : BookingStatus.PENDING,
        basePrice,
        extrasTotal,
        taxAmount: tax.taxAmount,
        taxRate: tax.taxRate,
        taxLabel: tax.taxLabel,
        province: tax.province,
        totalPrice,
        address: dto.address,
        notes: dto.notes,
        extras: {
          create: extras.map((e) => ({ name: e.name, price: e.price })),
        },
      },
      include: bookingInclude,
    });

    // Tell both sides. Failures here never affect the booking itself.
    const when = created.scheduledFor.toISOString().slice(0, 16).replace('T', ' ');
    const providerUserId = await this.notifications.userIdForProvider(provider.id);

    // Confirmation emails (logged instead of sent when RESEND_API_KEY is unset).
    const serviceName = created.service?.name ?? 'Cleaning';
    const clientName = created.client?.user?.firstName ?? 'there';
    const providerName = created.provider?.user
      ? `${created.provider.user.firstName} ${created.provider.user.lastName}`.trim()
      : provider.title;
    const providerUser = providerUserId
      ? await this.prisma.user.findUnique({ where: { id: providerUserId } })
      : null;

    if (user.email) {
      await this.mail.bookingConfirmed({
        to: user.email,
        clientName,
        providerName,
        serviceName,
        reference: created.reference,
        scheduledFor: created.scheduledFor,
        total: created.totalPrice,
      });
    }
    if (providerUser?.email) {
      await this.mail.newBookingForProvider({
        to: providerUser.email,
        providerName: providerUser.firstName,
        clientName,
        serviceName,
        reference: created.reference,
        scheduledFor: created.scheduledFor,
      });
    }

    await this.notifications.notifyMany([
      {
        userId: user.id,
        type: 'booking',
        title: `Booking ${created.reference} ${created.status === BookingStatus.CONFIRMED ? 'confirmed' : 'requested'}`,
        body: `${created.service?.name ?? 'Cleaning'} · ${when} UTC`,
      },
      ...(providerUserId
        ? [
            {
              userId: providerUserId,
              type: 'booking' as const,
              title: `New booking ${created.reference}`,
              body: `${created.service?.name ?? 'Cleaning'} · ${when} UTC`,
            },
          ]
        : []),
    ]);

    return created;
  }

  /** Price preview (subtotal + tax) without creating a booking. */
  async quote(dto: {
    providerId: string;
    serviceId?: string;
    extras?: { name: string; price: number }[];
  }) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: dto.providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    let basePrice = provider.hourlyRate * provider.minBookingHrs;
    if (dto.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: { id: dto.serviceId, providerId: provider.id },
      });
      if (!service) {
        throw new BadRequestException('Service does not belong to this provider');
      }
      basePrice = service.price;
    }

    const extrasTotal = (dto.extras ?? []).reduce((s, e) => s + e.price, 0);
    const tax = calculateTax(basePrice + extrasTotal, provider.location);

    return { basePrice, extrasTotal, ...tax };
  }

  /** Role-aware list: clients see their bookings, providers see theirs, admins see the tenant's. */
  async findAll(user: AuthUser, query: QueryBookingsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.BookingWhereInput = {};

    if (user.role === Role.CLIENT) {
      const client = await this.prisma.clientProfile.findUnique({
        where: { userId: user.id },
      });
      where.clientId = client?.id ?? '__none__';
    } else if (user.role === Role.PROVIDER) {
      const provider = await this.prisma.providerProfile.findUnique({
        where: { userId: user.id },
      });
      where.providerId = provider?.id ?? '__none__';
    } else {
      where.tenantId = user.tenantId;
    }

    if (query.status) where.status = query.status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        orderBy: { scheduledFor: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: bookingInclude,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(user: AuthUser, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    await this.assertAccess(user, booking);
    return booking;
  }

  /** Cancel — client or provider on the booking, or admin. */
  async cancel(user: AuthUser, id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    await this.assertAccess(user, booking);

    const finalStates: BookingStatus[] = [
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
    ];
    if (finalStates.includes(booking.status)) {
      throw new BadRequestException(
        `Cannot cancel a ${booking.status.toLowerCase()} booking`,
      );
    }

    // Cancellation policy: full refund outside the free window, partial inside.
    const freeHours = this.config.get<number>('booking.freeCancelHours', 24);
    const latePercent = this.config.get<number>(
      'booking.lateCancelRefundPercent',
      50,
    );
    const hoursUntil =
      (booking.scheduledFor.getTime() - Date.now()) / (60 * 60 * 1000);
    const refundPercent = hoursUntil >= freeHours ? 100 : latePercent;

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: bookingInclude,
    });

    // Refund whatever the policy allows (no-ops if the booking was never paid).
    const refund = await this.payments.refundBooking(id, refundPercent);

    // Notify the other party (whoever didn't cancel).
    await this.notifyBothParties(updated, {
      title: `Booking ${updated.reference} cancelled`,
      body: updated.service?.name ?? 'Cleaning',
      type: 'booking',
      exceptUserId: user.id,
    });

    // Email both sides so nobody turns up to a cancelled job. Emails are
    // fetched here rather than included in the API response, to avoid
    // exposing one party's address to the other.
    const svcName = updated.service?.name ?? 'Cleaning';
    const [clientUserId, providerUserId] = await Promise.all([
      this.notifications.userIdForClient(updated.clientId),
      this.notifications.userIdForProvider(updated.providerId),
    ]);
    const recipients = await this.prisma.user.findMany({
      where: {
        id: { in: [clientUserId, providerUserId].filter((id): id is string => !!id) },
      },
      select: { email: true, firstName: true },
    });
    for (const r of recipients) {
      await this.mail.bookingCancelled({
        to: r.email,
        name: r.firstName,
        reference: updated.reference,
        serviceName: svcName,
      });
    }

    // Surface the refund outcome so the UI can confirm it to the client.
    return { ...updated, refund };
  }

  /** Send a notification to the booking's client and provider. */
  private async notifyBothParties(
    booking: { clientId: string; providerId: string },
    opts: {
      title: string;
      body?: string;
      type?: 'booking' | 'payment' | 'review';
      exceptUserId?: string;
    },
  ) {
    const [clientUserId, providerUserId] = await Promise.all([
      this.notifications.userIdForClient(booking.clientId),
      this.notifications.userIdForProvider(booking.providerId),
    ]);
    const targets = [clientUserId, providerUserId].filter(
      (id): id is string => !!id && id !== opts.exceptUserId,
    );
    await this.notifications.notifyMany(
      targets.map((userId) => ({
        userId,
        title: opts.title,
        body: opts.body,
        type: opts.type ?? 'booking',
      })),
    );
  }

  /** Provider (owner) or admin advances the booking status. */
  async updateStatus(user: AuthUser, id: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (user.role !== Role.ADMIN) {
      const provider = await this.prisma.providerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!provider || provider.id !== booking.providerId) {
        throw new ForbiddenException('Not allowed to update this booking');
      }
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: bookingInclude,
    });

    // Keep the client informed as the job progresses.
    const clientUserId = await this.notifications.userIdForClient(
      updated.clientId,
    );
    if (clientUserId) {
      const messages: Partial<Record<BookingStatus, string>> = {
        [BookingStatus.CONFIRMED]: 'was confirmed by your pro',
        [BookingStatus.IN_PROGRESS]: 'has started',
        [BookingStatus.COMPLETED]: 'is complete — leave a review!',
      };
      const suffix = messages[status];
      if (suffix) {
        await this.notifications.notify({
          userId: clientUserId,
          type: 'booking',
          title: `Booking ${updated.reference} ${suffix}`,
          body: updated.service?.name ?? 'Cleaning',
        });
      }
    }

    return updated;
  }

  /** Ensures the caller owns the booking (client or provider) or is admin. */
  private async assertAccess(
    user: AuthUser,
    booking: { clientId: string; providerId: string; tenantId: string },
  ) {
    if (user.role === Role.ADMIN) return;

    if (user.role === Role.CLIENT) {
      const client = await this.prisma.clientProfile.findUnique({
        where: { userId: user.id },
      });
      if (client && client.id === booking.clientId) return;
    }

    if (user.role === Role.PROVIDER) {
      const provider = await this.prisma.providerProfile.findUnique({
        where: { userId: user.id },
      });
      if (provider && provider.id === booking.providerId) return;
    }

    throw new ForbiddenException('Not allowed to access this booking');
  }
}
