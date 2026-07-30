import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** A client reviews one of their COMPLETED bookings (one review per booking). */
  async create(user: AuthUser, dto: CreateReviewDto) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { userId: user.id },
    });
    if (!client) throw new ForbiddenException('Only clients can leave reviews');

    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== client.id) {
      throw new ForbiddenException('You can only review your own bookings');
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed bookings');
    }

    const existing = await this.prisma.review.findUnique({
      where: { bookingId: booking.id },
    });
    if (existing) {
      throw new BadRequestException('This booking has already been reviewed');
    }

    // Create the review and recompute the provider's rating atomically.
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          bookingId: booking.id,
          clientId: client.id,
          providerId: booking.providerId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      const agg = await tx.review.aggregate({
        where: { providerId: booking.providerId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.providerProfile.update({
        where: { id: booking.providerId },
        data: {
          rating: agg._avg.rating ?? 0,
          reviewsCount: agg._count._all,
        },
      });

      return created;
    });
  }

  /** Public list of a provider's reviews. */
  findByProvider(providerId: string) {
    return this.prisma.review.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }
}
