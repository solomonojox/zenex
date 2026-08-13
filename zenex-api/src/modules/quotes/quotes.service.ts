import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { calculateTax } from '../../common/tax/canadian-tax';
import { isWithinRadius } from '../../common/geo/canadian-cities';

/**
 * How many providers to pull before filtering by service area. Distance can't
 * be computed in the query, so the pool is fetched ordered (verified first,
 * then rating) and narrowed in memory. Fine at this roster size; a PostGIS
 * geography column with a GiST index is the answer once it isn't.
 */
const CANDIDATE_POOL = 200;

/** Upper bound on providers we run availability checks against — each one
 *  costs two more queries, so this caps the fan-out. */
const MAX_AVAILABILITY_CHECKS = 25;

export interface PricedOption {
  key: string;
  label: string;
  description?: string | null;
  popular: boolean;
  /** Pre-tax price for this property size. */
  subtotal: number;
  taxAmount: number;
  taxLabel: string;
  total: number;
  durationMins: number;
}

export interface MatchedProvider {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  imageUrl?: string | null;
  location: string;
}

function money(n: number) {
  return Math.round(n * 100) / 100;
}

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
  ) {}

  private async tenantId(tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug || 'demo' },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant.id;
  }

  /**
   * Price every active service type for a given property size.
   * Extra rooms beyond the first bedroom/bathroom add cost and time.
   */
  async priceOptions(
    tenantSlug: string,
    opts: { bedrooms: number; bathrooms: number; key?: string; location?: string },
  ): Promise<PricedOption[]> {
    const tenantId = await this.tenantId(tenantSlug);

    const rules = await this.prisma.pricingRule.findMany({
      where: { tenantId, active: true, ...(opts.key ? { key: opts.key } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
    if (rules.length === 0) {
      throw new NotFoundException(
        'No pricing has been configured for this region yet.',
      );
    }

    // The base price already covers one bedroom and one bathroom.
    const extraBedrooms = Math.max(0, opts.bedrooms - 1);
    const extraBathrooms = Math.max(0, opts.bathrooms - 1);

    return rules.map((r) => {
      const subtotal = money(
        r.basePrice +
          extraBedrooms * r.perBedroom +
          extraBathrooms * r.perBathroom,
      );
      const tax = calculateTax(subtotal, opts.location);
      const durationMins =
        r.baseMinutes +
        extraBedrooms * r.minsPerBedroom +
        extraBathrooms * r.minsPerBathroom;

      return {
        key: r.key,
        label: r.label,
        description: r.description,
        popular: r.popular,
        subtotal: tax.subtotal,
        taxAmount: tax.taxAmount,
        taxLabel: tax.taxLabel,
        total: tax.total,
        durationMins,
      };
    });
  }

  private async priceOne(
    tenantSlug: string,
    opts: { key: string; bedrooms: number; bathrooms: number; location?: string },
  ) {
    const [option] = await this.priceOptions(tenantSlug, opts);
    if (!option) throw new NotFoundException('Unknown service type');
    return option;
  }

  /**
   * Providers whose service area covers `location`, verified first.
   *
   * Matching used to be a substring test on the location string, which meant a
   * cleaner in Mississauga was invisible to a client in Toronto — twenty
   * minutes apart — while each provider's own `maxRadiusKm` went unread. This
   * measures actual distance and honours that radius.
   *
   * Where either location isn't in the coordinate table, it falls back to the
   * old substring test: an unrecognised town behaves exactly as it does today
   * rather than dropping the provider entirely.
   */
  private async serviceableProviders(tenantSlug: string, location?: string) {
    const candidates = await this.prisma.providerProfile.findMany({
      where: {
        tenant: { slug: tenantSlug || 'demo' },
        // Must be bookable at all.
        services: { some: {} },
      },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: [{ verified: 'desc' }, { rating: 'desc' }],
      take: CANDIDATE_POOL,
    });

    if (!location) return candidates.slice(0, MAX_AVAILABILITY_CHECKS);

    const city = location.split(',')[0].trim().toLowerCase();
    const nearby = candidates.filter((p) => {
      const within = isWithinRadius(p.location, location, p.maxRadiusKm);
      return within ?? p.location.toLowerCase().includes(city);
    });

    return nearby.slice(0, MAX_AVAILABILITY_CHECKS);
  }

  /**
   * Providers who could take this job: verified first, within range, and
   * genuinely free for the whole slot. Ranked by rating.
   */
  async findMatches(
    tenantSlug: string,
    opts: {
      startsAt: Date;
      durationMins: number;
      location?: string;
      limit?: number;
    },
  ): Promise<MatchedProvider[]> {
    const candidates = await this.serviceableProviders(
      tenantSlug,
      opts.location,
    );

    const free: MatchedProvider[] = [];
    for (const p of candidates) {
      const clash = await this.availability.hasConflict(
        p.id,
        opts.startsAt,
        opts.durationMins,
      );
      if (clash) continue;

      // Also confirm the slot sits inside their published working hours.
      const day = opts.startsAt.toISOString().slice(0, 10);
      const slots = await this.availability.getSlots(
        p.id,
        day,
        opts.durationMins,
      );
      if (!slots.some((s) => s.start === opts.startsAt.toISOString())) continue;

      free.push({
        id: p.id,
        name: `${p.user.firstName} ${p.user.lastName}`.trim() || p.title,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        verified: p.verified,
        imageUrl: p.imageUrl,
        location: p.location,
      });
      if (free.length >= (opts.limit ?? 5)) break;
    }

    return free;
  }

  /**
   * Bookable start times across *all* providers for this property size —
   * the customer picks a time, not a person.
   */
  async instantSlots(
    tenantSlug: string,
    opts: {
      key: string;
      bedrooms: number;
      bathrooms: number;
      date: string;
      location?: string;
    },
  ) {
    const priced = await this.priceOne(tenantSlug, opts);

    // Same service-area rules as findMatches, so the times offered here are
    // the times someone can actually be assigned to.
    const providers = await this.serviceableProviders(
      tenantSlug,
      opts.location,
    );

    // Merge every provider's openings — a time is offered if anyone is free.
    const merged = new Map<string, { start: string; label: string; count: number }>();
    for (const p of providers) {
      const slots = await this.availability.getSlots(
        p.id,
        opts.date,
        priced.durationMins,
      );
      for (const s of slots) {
        const existing = merged.get(s.start);
        if (existing) existing.count += 1;
        else merged.set(s.start, { ...s, count: 1 });
      }
    }

    return {
      quote: priced,
      slots: [...merged.values()].sort((a, b) => a.start.localeCompare(b.start)),
    };
  }

  /** Validate a requested instant booking and pick the provider to assign. */
  async resolveInstantBooking(
    tenantSlug: string,
    dto: {
      key: string;
      bedrooms: number;
      bathrooms: number;
      scheduledFor: string;
      location?: string;
      providerId?: string;
    },
  ) {
    const startsAt = new Date(dto.scheduledFor);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    if (startsAt <= new Date()) {
      throw new BadRequestException('Pick a time in the future');
    }

    const priced = await this.priceOne(tenantSlug, dto);

    const matches = await this.findMatches(tenantSlug, {
      startsAt,
      durationMins: priced.durationMins,
      location: dto.location,
      limit: 5,
    });

    // Honour an explicitly requested provider if they're actually free.
    const chosen = dto.providerId
      ? matches.find((m) => m.id === dto.providerId)
      : matches[0];

    if (!chosen) {
      throw new BadRequestException(
        'No cleaners are available for that time — please pick another slot.',
      );
    }

    return { priced, provider: chosen, startsAt };
  }
}
