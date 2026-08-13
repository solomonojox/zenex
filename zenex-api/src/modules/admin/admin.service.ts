import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  DisputePriority,
  DisputeStatus,
  Prisma,
  SubscriptionStatus,
  TransactionType,
  VerificationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /** Dashboard aggregates, all scoped to the tenant. */
  async overview(tenantId: string) {
    const [
      users,
      clients,
      providers,
      bookings,
      bookingValue,
      paidAgg,
      earningsAgg,
      activeSubs,
      pendingVerifs,
      openDisputes,
    ] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.clientProfile.count({ where: { user: { tenantId } } }),
      this.prisma.providerProfile.count({ where: { tenantId } }),
      this.prisma.booking.count({ where: { tenantId } }),
      this.prisma.booking.aggregate({
        where: { tenantId },
        _sum: { totalPrice: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.DEBIT,
          bookingId: { not: null },
          wallet: { user: { tenantId } },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: TransactionType.CREDIT, wallet: { user: { tenantId } } },
        _sum: { amount: true },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE, plan: { tenantId } },
      }),
      this.prisma.verificationRequest.count({
        where: {
          status: {
            in: [VerificationStatus.SUBMITTED, VerificationStatus.IN_REVIEW],
          },
          provider: { tenantId },
        },
      }),
      this.prisma.dispute.count({
        where: { tenantId, status: DisputeStatus.OPEN },
      }),
    ]);

    // Bookings grouped by status (per-status counts — avoids groupBy typing quirks).
    const statuses = Object.values(BookingStatus);
    const statusCounts = await Promise.all(
      statuses.map((s) =>
        this.prisma.booking.count({ where: { tenantId, status: s } }),
      ),
    );
    const bookingsByStatus = Object.fromEntries(
      statuses.map((s, i) => [s, statusCounts[i]] as [string, number]),
    );

    const grossBookingValue = bookingValue._sum.totalPrice ?? 0;
    const grossPaid = Math.abs(paidAgg._sum.amount ?? 0);
    const providerEarnings = earningsAgg._sum.amount ?? 0;
    const platformRevenue =
      Math.round((grossPaid - providerEarnings) * 100) / 100;

    return {
      users,
      clients,
      providers,
      bookings,
      bookingsByStatus,
      grossBookingValue,
      grossPaid,
      platformRevenue,
      activeSubscriptions: activeSubs,
      pendingVerifications: pendingVerifs,
      openDisputes,
    };
  }

  async listUsers(tenantId: string, query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.UserWhereInput = { tenantId };
    if (query.role) where.role = query.role;
    if (query.status === 'active') where.isActive = true;
    if (query.status === 'suspended') where.isActive = false;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  setUserStatus(id: string, active: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: active },
      select: { id: true, email: true, isActive: true },
    });
  }

  listDisputes(tenantId: string, status?: DisputeStatus) {
    return this.prisma.dispute.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDispute(
    tenantId: string,
    dto: CreateDisputeDto,
    raisedById?: string,
  ) {
    const dispute = await this.prisma.dispute.create({
      data: {
        reference: 'DSP-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        tenantId,
        bookingId: dto.bookingId,
        clientName: dto.clientName,
        providerName: dto.providerName,
        issue: dto.issue,
        priority: dto.priority ?? DisputePriority.MEDIUM,
        raisedById,
      },
    });

    for (const p of await this.disputeParties(dispute.id)) {
      await this.mail.disputeOpened({
        to: p.email,
        name: p.firstName,
        reference: dispute.reference,
        reason: dispute.issue,
      });
    }

    return dispute;
  }

  async resolveDispute(id: string, status: DisputeStatus) {
    const dispute = await this.prisma.dispute.update({
      where: { id },
      data: { status, resolvedAt: new Date() },
    });

    // Only tell people once it is actually settled — an "under review" status
    // change is not news worth an email.
    if (status === DisputeStatus.RESOLVED) {
      for (const p of await this.disputeParties(dispute.id)) {
        await this.mail.disputeResolved({
          to: p.email,
          name: p.firstName,
          reference: dispute.reference,
          outcome: `Marked ${status.toLowerCase()} by the Zenex team.`,
        });
      }
    }

    return dispute;
  }

  /**
   * Everyone entitled to hear about a dispute.
   *
   * A Dispute stores only display-name strings, so addresses come from the
   * linked booking where there is one, plus whoever raised it. Deduplicated by
   * user id — the raiser is usually also a party to the booking, and sending
   * the same person two copies is how a support process loses credibility.
   */
  private async disputeParties(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      select: {
        raisedBy: { select: { id: true, email: true, firstName: true } },
        booking: {
          select: {
            client: { select: { user: { select: { id: true, email: true, firstName: true } } } },
            provider: { select: { user: { select: { id: true, email: true, firstName: true } } } },
          },
        },
      },
    });
    if (!dispute) return [];

    const candidates = [
      dispute.raisedBy,
      dispute.booking?.client?.user,
      dispute.booking?.provider?.user,
    ];

    const byId = new Map<string, { email: string; firstName: string }>();
    for (const c of candidates) {
      if (c?.email) byId.set(c.id, { email: c.email, firstName: c.firstName });
    }
    return [...byId.values()];
  }
}
