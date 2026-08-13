import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryProvidersDto } from './dto/query-providers.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import {
  distanceBetween,
  isWithinRadius,
} from '../../common/geo/canadian-cities';

/**
 * Ceiling on rows pulled when a location filter is active.
 *
 * Distance needs haversine per row, which can't be expressed in a Prisma
 * `where`, so a located search fetches an ordered pool and filters in memory.
 * Past this many providers in one tenant, results become a "top N nearest"
 * approximation rather than the complete set — the point at which this should
 * move to PostGIS and go back into the query.
 */
const SEARCH_POOL = 500;

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Paginated, filterable provider search — powers /search on the frontend. */
  async findAll(tenantSlug: string, query: QueryProvidersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ProviderProfileWhereInput = {
      tenant: { slug: tenantSlug },
      // A provider with no services can't be booked, so keep them out of
      // search rather than sending clients to a dead end.
      services: { some: {} },
    };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { tags: { has: query.q } },
        { user: { firstName: { contains: query.q, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.q, mode: 'insensitive' } } },
      ];
    }
    if (query.verified === 'true') where.verified = true;
    if (query.instant === 'true') where.instant = true;

    const orderBy: Prisma.ProviderProfileOrderByWithRelationInput =
      query.sort === 'price'
        ? { hourlyRate: 'asc' }
        : query.sort === 'ai_match'
          ? { aiMatch: 'desc' }
          : { rating: 'desc' };

    const include = {
      user: { select: { firstName: true, lastName: true } },
      services: true,
    };

    // Location filtering happens in memory, because it measures real distance
    // against each provider's own maxRadiusKm — the same rule the instant-quote
    // matcher uses. Keeping the old SQL substring test here would have search
    // and instant-book disagree about who covers a given city, which is the
    // sort of contradiction clients notice and providers complain about.
    if (query.location) {
      const location = query.location;
      const city = location.split(',')[0].trim().toLowerCase();

      const pool = await this.prisma.providerProfile.findMany({
        where,
        orderBy,
        take: SEARCH_POOL,
        include,
      });

      const nearby = pool.filter((p) => {
        const within = isWithinRadius(p.location, location, p.maxRadiusKm);
        // null means one of the two places isn't in the coordinate table;
        // fall back to the substring test so an unlisted town behaves as it
        // did before rather than dropping the provider from search entirely.
        return within ?? p.location.toLowerCase().includes(city);
      });

      // "Nearest" only means anything once we know where the client is, which
      // is why it lives in this branch. Providers whose town isn't in the
      // coordinate table sink to the bottom rather than sorting as distance 0
      // and jumping to the front.
      if (query.sort === 'distance') {
        nearby.sort((a, b) => {
          const da = distanceBetween(a.location, location);
          const db = distanceBetween(b.location, location);
          if (da === null && db === null) return 0;
          if (da === null) return 1;
          if (db === null) return -1;
          return da - db;
        });
      }

      const total = nearby.length;
      return {
        items: nearby.slice((page - 1) * limit, page * limit),
        meta: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.providerProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include,
      }),
      this.prisma.providerProfile.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true } },
        services: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return provider;
  }

  // ─────────────── Own services (provider-managed) ───────────────

  private async ownProfile(userId: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');
    return provider;
  }

  async listOwnServices(userId: string) {
    const provider = await this.ownProfile(userId);
    return this.prisma.service.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createOwnService(userId: string, dto: CreateServiceDto) {
    const provider = await this.ownProfile(userId);
    return this.prisma.service.create({
      data: {
        tenantId: provider.tenantId,
        providerId: provider.id,
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        price: dto.price,
      },
    });
  }

  async updateOwnService(userId: string, id: string, dto: UpdateServiceDto) {
    const provider = await this.ownProfile(userId);
    // Scope by providerId so one provider can't edit another's service.
    const existing = await this.prisma.service.findFirst({
      where: { id, providerId: provider.id },
    });
    if (!existing) throw new NotFoundException('Service not found');

    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async deleteOwnService(userId: string, id: string) {
    const provider = await this.ownProfile(userId);
    const existing = await this.prisma.service.findFirst({
      where: { id, providerId: provider.id },
    });
    if (!existing) throw new NotFoundException('Service not found');

    // Past bookings reference this service, so keep their history intact by
    // detaching rather than blocking the delete.
    await this.prisma.booking.updateMany({
      where: { serviceId: id },
      data: { serviceId: null },
    });
    await this.prisma.service.delete({ where: { id } });
    return { deleted: true };
  }

  async updateOwn(userId: string, dto: UpdateProviderDto) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }
    return this.prisma.providerProfile.update({
      where: { id: provider.id },
      data: dto,
    });
  }
}
