import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface PublicTestimonial {
  name: string;
  initials: string;
  location: string;
  service: string;
  rating: number;
  comment: string;
}

export interface PublicStats {
  providers: number;
  verifiedProviders: number;
  completedBookings: number;
  averageRating: number | null;
  reviewsCount: number;
  cities: { name: string; providers: number }[];
  testimonials: PublicTestimonial[];
}

/**
 * Real numbers for the marketing pages.
 *
 * The landing page previously hard-coded "10,000+ bookings done", "4,200+
 * active pros" and "4.9 ★ avg rating". Those are checkable claims, and with a
 * roster in single figures they were not true. Everything here is counted from
 * the database and scoped to the tenant, so the page can only ever say what is
 * actually the case — and grows on its own as the roster does.
 */
@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * "Scarborough, Toronto, ON" → "Toronto"; "Mississauga, ON" → "Mississauga".
   * The last token is the province, so the city is the one before it.
   */
  private cityOf(location: string): string | null {
    const parts = location
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return null;
    return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  }

  async publicStats(tenantSlug: string): Promise<PublicStats> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug || 'demo' },
      select: { id: true },
    });

    const empty: PublicStats = {
      providers: 0,
      verifiedProviders: 0,
      completedBookings: 0,
      averageRating: null,
      reviewsCount: 0,
      cities: [],
      testimonials: [],
    };
    if (!tenant) return empty;

    const tenantId = tenant.id;
    // Only providers who can actually be booked count as "on the platform".
    const bookable = { tenantId, services: { some: {} } };

    const [providers, verifiedProviders, completedBookings, ratings, locations, reviews] =
      await Promise.all([
        this.prisma.providerProfile.count({ where: bookable }),
        this.prisma.providerProfile.count({
          where: { ...bookable, verified: true },
        }),
        this.prisma.booking.count({
          where: { tenantId, status: BookingStatus.COMPLETED },
        }),
        // Reviews carry no tenantId of their own — scope through the provider.
        this.prisma.review.aggregate({
          where: { provider: { tenantId } },
          _avg: { rating: true },
          _count: true,
        }),
        this.prisma.providerProfile.findMany({
          where: bookable,
          select: { location: true },
        }),
        this.prisma.review.findMany({
          where: {
            provider: { tenantId },
            rating: { gte: 4 },
            comment: { not: null },
          },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            rating: true,
            comment: true,
            client: {
              select: {
                city: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
            provider: { select: { location: true } },
            booking: { select: { service: { select: { name: true } } } },
          },
        }),
      ]);

    const cityCounts = new Map<string, number>();
    for (const { location } of locations) {
      const city = this.cityOf(location);
      if (city) cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
    }

    const testimonials: PublicTestimonial[] = reviews.map((r) => {
      const first = r.client?.user?.firstName ?? 'A';
      const last = r.client?.user?.lastName ?? '';
      return {
        // First name plus last initial — real reviewers, not full names on a
        // public page.
        name: last ? `${first} ${last.charAt(0)}.` : first,
        initials: `${first.charAt(0)}${last.charAt(0)}`.toUpperCase(),
        location: r.client?.city || this.cityOf(r.provider.location) || '',
        service: r.booking?.service?.name ?? 'Cleaning',
        rating: r.rating,
        comment: r.comment ?? '',
      };
    });

    return {
      providers,
      verifiedProviders,
      completedBookings,
      averageRating:
        ratings._count > 0
          ? Math.round((ratings._avg.rating ?? 0) * 100) / 100
          : null,
      reviewsCount: ratings._count,
      cities: [...cityCounts.entries()]
        .map(([name, count]) => ({ name, providers: count }))
        .sort((a, b) => b.providers - a.providers || a.name.localeCompare(b.name)),
      testimonials,
    };
  }
}
