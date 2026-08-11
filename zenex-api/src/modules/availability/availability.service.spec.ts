import { Test } from '@nestjs/testing';
import { BookingStatus } from '@prisma/client';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../../prisma/prisma.service';

/** Minimal in-memory Prisma stand-in — no database needed. */
function createPrismaMock() {
  return {
    providerProfile: { findUnique: jest.fn() },
    availabilityRule: { findUnique: jest.fn() },
    booking: { findMany: jest.fn().mockResolvedValue([]) },
    timeOff: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };
}

const PROVIDER_ID = 'prov_1';
/** A date far enough ahead that "no slots in the past" never interferes. */
const FUTURE_DATE = '2099-06-10'; // a Wednesday (UTC day 3)

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(AvailabilityService);
    prisma.providerProfile.findUnique.mockResolvedValue({ id: PROVIDER_ID });
    // Works 09:00–17:00 on the test weekday.
    prisma.availabilityRule.findUnique.mockResolvedValue({
      providerId: PROVIDER_ID,
      dayOfWeek: new Date(`${FUTURE_DATE}T00:00:00Z`).getUTCDay(),
      startMinute: 9 * 60,
      endMinute: 17 * 60,
    });
  });

  describe('getSlots', () => {
    it('generates 30-minute slots that fit inside the working window', async () => {
      const slots = await service.getSlots(PROVIDER_ID, FUTURE_DATE, 120);
      // 09:00 → last 2h job can start at 15:00 = 13 slots at 30-min steps.
      expect(slots).toHaveLength(13);
      expect(slots[0].label).toBe('9:00 AM');
      expect(slots[slots.length - 1].label).toBe('3:00 PM');
    });

    it('anchors slot times to UTC so labels match the timestamp', async () => {
      const slots = await service.getSlots(PROVIDER_ID, FUTURE_DATE, 120);
      expect(slots[0].start).toBe(`${FUTURE_DATE}T09:00:00.000Z`);
    });

    it('returns nothing on a day the provider does not work', async () => {
      prisma.availabilityRule.findUnique.mockResolvedValue(null);
      expect(await service.getSlots(PROVIDER_ID, FUTURE_DATE, 120)).toEqual([]);
    });

    it('hides slots that clash with an existing booking', async () => {
      prisma.booking.findMany.mockResolvedValue([
        {
          scheduledFor: new Date(`${FUTURE_DATE}T09:00:00.000Z`),
          durationMins: 120,
        },
      ]);
      const slots = await service.getSlots(PROVIDER_ID, FUTURE_DATE, 120);
      const labels = slots.map((s) => s.label);
      // 9:00–11:00 is taken, so nothing may start between 8:00 and 11:00.
      expect(labels).not.toContain('9:00 AM');
      expect(labels).not.toContain('10:00 AM');
      expect(labels).not.toContain('10:30 AM');
      expect(labels).toContain('11:00 AM');
    });

    it('hides slots covered by time off', async () => {
      prisma.timeOff.findMany.mockResolvedValue([
        {
          startsAt: new Date(`${FUTURE_DATE}T09:00:00.000Z`),
          endsAt: new Date(`${FUTURE_DATE}T12:00:00.000Z`),
        },
      ]);
      const labels = (
        await service.getSlots(PROVIDER_ID, FUTURE_DATE, 60)
      ).map((s) => s.label);
      expect(labels).not.toContain('9:00 AM');
      expect(labels).not.toContain('11:00 AM');
      expect(labels).toContain('12:00 PM');
    });

    it('offers fewer starts for a longer job', async () => {
      const short = await service.getSlots(PROVIDER_ID, FUTURE_DATE, 60);
      const long = await service.getSlots(PROVIDER_ID, FUTURE_DATE, 240);
      expect(long.length).toBeLessThan(short.length);
    });

    it('rejects a malformed date', async () => {
      await expect(service.getSlots(PROVIDER_ID, '10-06-2099')).rejects.toThrow();
    });
  });

  describe('hasConflict', () => {
    const start = new Date(`${FUTURE_DATE}T10:00:00.000Z`);

    it('is false when the provider is free', async () => {
      expect(await service.hasConflict(PROVIDER_ID, start, 120)).toBe(false);
    });

    it('detects an exact overlap', async () => {
      prisma.booking.findMany.mockResolvedValue([
        { scheduledFor: start, durationMins: 120 },
      ]);
      expect(await service.hasConflict(PROVIDER_ID, start, 120)).toBe(true);
    });

    it('detects a partial overlap where the existing job runs over', async () => {
      prisma.booking.findMany.mockResolvedValue([
        {
          scheduledFor: new Date(`${FUTURE_DATE}T09:00:00.000Z`),
          durationMins: 120, // ends 11:00, overlaps a 10:00 start
        },
      ]);
      expect(await service.hasConflict(PROVIDER_ID, start, 60)).toBe(true);
    });

    it('allows a booking that starts exactly when the previous one ends', async () => {
      prisma.booking.findMany.mockResolvedValue([
        {
          scheduledFor: new Date(`${FUTURE_DATE}T08:00:00.000Z`),
          durationMins: 120, // ends 10:00 — touching, not overlapping
        },
      ]);
      expect(await service.hasConflict(PROVIDER_ID, start, 60)).toBe(false);
    });

    it('treats time off as a conflict', async () => {
      prisma.timeOff.count.mockResolvedValue(1);
      expect(await service.hasConflict(PROVIDER_ID, start, 60)).toBe(true);
    });

    it('ignores the booking being rescheduled', async () => {
      prisma.booking.findMany.mockResolvedValue([]);
      expect(
        await service.hasConflict(PROVIDER_ID, start, 60, 'booking_1'),
      ).toBe(false);
      // The exclusion must reach the query.
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: { not: 'booking_1' } }),
        }),
      );
    });

    it('only considers live bookings, not cancelled ones', async () => {
      await service.hasConflict(PROVIDER_ID, start, 60);
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { not: BookingStatus.CANCELLED },
          }),
        }),
      );
    });
  });
});
