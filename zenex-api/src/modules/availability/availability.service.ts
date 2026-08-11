import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';

/** Slot granularity — candidate start times are generated every 30 minutes. */
const SLOT_STEP_MINS = 30;
const DEFAULT_DURATION_MINS = 120;

export interface Slot {
  /** ISO start time. */
  start: string;
  /** Human label, e.g. "9:00 AM". */
  label: string;
}

/** Two intervals overlap if each starts before the other ends. */
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

function minutesToLabel(mins: number) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  private async providerFor(userId: string) {
    const p = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!p) throw new ForbiddenException('Provider profile not found');
    return p;
  }

  /** Parse "YYYY-MM-DD" into a UTC midnight anchor for that calendar day. */
  private dayAnchor(date: string): Date {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) throw new BadRequestException('date must be YYYY-MM-DD');
    return new Date(
      Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0, 0),
    );
  }

  // ─────────────── Provider schedule ───────────────

  async getSchedule(providerId: string) {
    const [rules, timeOff] = await Promise.all([
      this.prisma.availabilityRule.findMany({
        where: { providerId },
        orderBy: { dayOfWeek: 'asc' },
      }),
      this.prisma.timeOff.findMany({
        where: { providerId, endsAt: { gte: new Date() } },
        orderBy: { startsAt: 'asc' },
      }),
    ]);
    return { rules, timeOff };
  }

  async getMySchedule(user: AuthUser) {
    const provider = await this.providerFor(user.id);
    return this.getSchedule(provider.id);
  }

  /** Replace the provider's whole weekly schedule in one call. */
  async setMySchedule(user: AuthUser, dto: SetAvailabilityDto) {
    const provider = await this.providerFor(user.id);

    for (const r of dto.rules) {
      if (r.endMinute <= r.startMinute) {
        throw new BadRequestException(
          `End time must be after start time (day ${r.dayOfWeek})`,
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.availabilityRule.deleteMany({
        where: { providerId: provider.id },
      }),
      this.prisma.availabilityRule.createMany({
        data: dto.rules.map((r) => ({ ...r, providerId: provider.id })),
      }),
    ]);

    return this.getSchedule(provider.id);
  }

  async addTimeOff(user: AuthUser, dto: CreateTimeOffDto) {
    const provider = await this.providerFor(user.id);
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    return this.prisma.timeOff.create({
      data: { providerId: provider.id, startsAt, endsAt, reason: dto.reason },
    });
  }

  async removeTimeOff(user: AuthUser, id: string) {
    const provider = await this.providerFor(user.id);
    const existing = await this.prisma.timeOff.findUnique({ where: { id } });
    if (!existing || existing.providerId !== provider.id) {
      throw new NotFoundException('Time off not found');
    }
    await this.prisma.timeOff.delete({ where: { id } });
    return { removed: true };
  }

  // ─────────────── Slot generation ───────────────

  /**
   * Bookable start times for a provider on a given day: the weekly window
   * minus existing bookings, minus time off, minus times already past.
   */
  async getSlots(
    providerId: string,
    date: string,
    durationMins = DEFAULT_DURATION_MINS,
  ): Promise<Slot[]> {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const anchor = this.dayAnchor(date);
    const dayOfWeek = anchor.getUTCDay();

    const rule = await this.prisma.availabilityRule.findUnique({
      where: { providerId_dayOfWeek: { providerId, dayOfWeek } },
    });
    if (!rule) return []; // provider doesn't work this weekday

    const dayStart = anchor;
    const dayEnd = new Date(anchor.getTime() + 24 * 60 * 60 * 1000);

    const [bookings, timeOff] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          providerId,
          status: { not: BookingStatus.CANCELLED },
          scheduledFor: { gte: dayStart, lt: dayEnd },
        },
        select: { scheduledFor: true, durationMins: true },
      }),
      this.prisma.timeOff.findMany({
        where: { providerId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
        select: { startsAt: true, endsAt: true },
      }),
    ]);

    const busy: { start: Date; end: Date }[] = [
      ...bookings.map((b) => ({
        start: b.scheduledFor,
        end: new Date(
          b.scheduledFor.getTime() +
            (b.durationMins || DEFAULT_DURATION_MINS) * 60000,
        ),
      })),
      ...timeOff.map((t) => ({ start: t.startsAt, end: t.endsAt })),
    ];

    const now = new Date();
    const slots: Slot[] = [];

    for (
      let m = rule.startMinute;
      m + durationMins <= rule.endMinute;
      m += SLOT_STEP_MINS
    ) {
      const start = new Date(anchor.getTime() + m * 60000);
      const end = new Date(start.getTime() + durationMins * 60000);

      if (start <= now) continue; // no booking in the past
      if (busy.some((b) => overlaps(start, end, b.start, b.end))) continue;

      slots.push({ start: start.toISOString(), label: minutesToLabel(m) });
    }

    return slots;
  }

  /**
   * Shared guard used by the bookings module: true when the requested window
   * clashes with an existing booking or time off.
   */
  async hasConflict(
    providerId: string,
    startsAt: Date,
    durationMins = DEFAULT_DURATION_MINS,
    ignoreBookingId?: string,
  ): Promise<boolean> {
    const endsAt = new Date(startsAt.getTime() + durationMins * 60000);
    // Widen the window so we catch bookings that start earlier and run over.
    const windowStart = new Date(startsAt.getTime() - 24 * 60 * 60 * 1000);

    const [bookings, timeOffCount] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          providerId,
          status: { not: BookingStatus.CANCELLED },
          scheduledFor: { gte: windowStart, lt: endsAt },
          ...(ignoreBookingId ? { id: { not: ignoreBookingId } } : {}),
        },
        select: { scheduledFor: true, durationMins: true },
      }),
      this.prisma.timeOff.count({
        where: { providerId, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
      }),
    ]);

    if (timeOffCount > 0) return true;

    return bookings.some((b) =>
      overlaps(
        startsAt,
        endsAt,
        b.scheduledFor,
        new Date(
          b.scheduledFor.getTime() +
            (b.durationMins || DEFAULT_DURATION_MINS) * 60000,
        ),
      ),
    );
  }
}
