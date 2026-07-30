import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryProvidersDto } from './dto/query-providers.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Paginated, filterable provider search — powers /search on the frontend. */
  async findAll(tenantSlug: string, query: QueryProvidersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ProviderProfileWhereInput = {
      tenant: { slug: tenantSlug },
    };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { tags: { has: query.q } },
        { user: { firstName: { contains: query.q, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.q, mode: 'insensitive' } } },
      ];
    }
    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }
    if (query.verified === 'true') where.verified = true;
    if (query.instant === 'true') where.instant = true;

    const orderBy: Prisma.ProviderProfileOrderByWithRelationInput =
      query.sort === 'price'
        ? { hourlyRate: 'asc' }
        : query.sort === 'ai_match'
          ? { aiMatch: 'desc' }
          : { rating: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.providerProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { firstName: true, lastName: true } },
          services: true,
        },
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
