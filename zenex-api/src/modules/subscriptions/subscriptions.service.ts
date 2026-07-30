import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Plans ----

  createPlan(user: AuthUser, dto: CreatePlanDto) {
    return this.prisma.subscriptionPlan.create({
      data: {
        tenantId: user.tenantId,
        name: dto.name,
        frequency: dto.frequency,
        price: dto.price,
        savesPercent: dto.savesPercent ?? 0,
        features: dto.features ?? [],
        popular: dto.popular ?? false,
      },
    });
  }

  listPlans(tenantSlug: string) {
    return this.prisma.subscriptionPlan.findMany({
      where: { tenant: { slug: tenantSlug } },
      orderBy: { price: 'asc' },
    });
  }

  // ---- Subscriptions ----

  private async clientFor(userId: string) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!client) throw new ForbiddenException('Only clients can subscribe');
    return client;
  }

  async subscribe(user: AuthUser, planId: string) {
    const client = await this.clientFor(user.id);
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    return this.prisma.subscription.create({
      data: {
        planId,
        clientId: client.id,
        status: SubscriptionStatus.ACTIVE,
        renewsAt: this.computeRenewal(plan.frequency),
      },
      include: { plan: true },
    });
  }

  async mySubscriptions(user: AuthUser) {
    const client = await this.clientFor(user.id);
    return this.prisma.subscription.findMany({
      where: { clientId: client.id },
      orderBy: { startedAt: 'desc' },
      include: { plan: true },
    });
  }

  async cancel(user: AuthUser, id: string) {
    const client = await this.clientFor(user.id);
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub || sub.clientId !== client.id) {
      throw new NotFoundException('Subscription not found');
    }
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.CANCELLED },
      include: { plan: true },
    });
  }

  /** Next renewal date derived from the plan's frequency label. */
  private computeRenewal(frequency: string): Date {
    const f = frequency.toLowerCase();
    const d = new Date();
    if (f.includes('bi') && f.includes('week')) {
      d.setDate(d.getDate() + 14);
    } else if (f.includes('week')) {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d;
  }
}
