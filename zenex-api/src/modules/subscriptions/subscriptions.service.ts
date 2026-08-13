import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreatePlanDto } from './dto/create-plan.dto';
import { MailService } from '../mail/mail.service';
import { StripeService } from '../payments/stripe.service';
import { calculateTax } from '../../common/tax/canadian-tax';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

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

  /**
   * What this plan costs, before anyone commits to anything.
   *
   * Recurring billing needs the customer to see the tax-inclusive total and
   * the date of the first charge *before* they agree, not after. Tax is
   * resolved from the client's own province, same engine the booking path uses.
   */
  async quote(user: AuthUser, planId: string) {
    const client = await this.clientFor(user.id);
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    const tax = calculateTax(plan.price, client.city);
    const renewsAt = this.computeRenewal(plan.frequency);

    return {
      plan,
      subtotal: tax.subtotal,
      taxAmount: tax.taxAmount,
      taxLabel: tax.taxLabel,
      province: tax.province,
      total: tax.total,
      firstChargeOn: new Date(),
      renewsAt,
      // Stated plainly so the consent copy and the API agree.
      cancellationTerms:
        'Cancel any time from your dashboard. Cancelling stops future charges; the current period runs to its end and is not refunded.',
    };
  }

  /**
   * Start a subscription.
   *
   * Two rules this did not previously honour:
   *
   *  1. Nothing activates without payment. The old version wrote an ACTIVE row
   *     and returned — a $379/month plan for nothing, renewing forever. It is
   *     created PENDING and only flips to ACTIVE once money has actually moved
   *     (immediately in demo mode, on the Stripe webhook in live mode).
   *  2. Consent is recorded. A recurring charge needs evidence the customer
   *     agreed to *this amount* on *this date*, or a chargeback is unwinnable.
   */
  async subscribe(user: AuthUser, planId: string, consent: boolean) {
    const client = await this.clientFor(user.id);
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    if (!consent) {
      throw new BadRequestException(
        'Please confirm you agree to the recurring charge before subscribing.',
      );
    }

    // One live plan per client — stacking two recurring charges is almost
    // always an accident, usually a double-click.
    const existing = await this.prisma.subscription.findFirst({
      where: {
        clientId: client.id,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED] },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'You already have an active plan. Cancel it before starting another.',
      );
    }

    const tax = calculateTax(plan.price, client.city);

    const subscription = await this.prisma.subscription.create({
      data: {
        planId,
        clientId: client.id,
        // Not ACTIVE yet — see activate().
        status: SubscriptionStatus.PENDING,
        renewsAt: this.computeRenewal(plan.frequency),
        cleansRemaining: 0,
        consentAt: new Date(),
        consentAmount: tax.total,
      },
      include: { plan: true },
    });

    // ── Live mode: hand off to Stripe Checkout ──
    // A hosted session rather than our own card form: Stripe creates the
    // customer, stores the card for future periods and handles SCA, none of
    // which we want to reimplement for recurring billing.
    if (this.stripe.enabled) {
      const priceId = await this.ensureStripePrice(plan, tax.total);
      const appUrl =
        this.config.get<string>('mail.appUrl') || 'http://localhost:3000';

      const session = await this.stripe.client.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/client?subscribed=1`,
        cancel_url: `${appUrl}/#plans`,
        client_reference_id: subscription.id,
        metadata: { subscriptionId: subscription.id },
      });

      return {
        mode: 'live' as const,
        subscriptionId: subscription.id,
        checkoutUrl: session.url,
      };
    }

    // ── Demo mode: settle immediately, same as the booking path ──
    const activated = await this.activate(subscription.id);
    return { mode: 'demo' as const, subscriptionId: subscription.id, subscription: activated };
  }

  /**
   * Flip a paid subscription live and grant its first allowance.
   *
   * Called straight away in demo mode, and from the Stripe webhook in live
   * mode. Idempotent — Stripe retries webhooks, and granting a second month of
   * cleans because a delivery was repeated would be a real cost.
   */
  async activate(subscriptionId: string, stripeSubId?: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, client: { include: { user: true } } },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.status === SubscriptionStatus.ACTIVE) return sub;

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        activatedAt: new Date(),
        cleansRemaining: sub.plan.includedCleans,
        ...(stripeSubId ? { stripeSubId } : {}),
      },
      include: { plan: true },
    });

    // Confirmation only once money has actually moved.
    const account = sub.client?.user;
    if (account?.email) {
      await this.mail.subscriptionStarted({
        to: account.email,
        name: account.firstName,
        planName: sub.plan.name,
        frequency: sub.plan.frequency,
        price: sub.consentAmount ?? sub.plan.price,
      });
    }

    return updated;
  }

  /**
   * Stripe needs a Price object; our plans live in Postgres. Created once and
   * cached on the plan row so we do not spawn a new Price on every checkout.
   */
  private async ensureStripePrice(
    plan: { id: string; name: string; frequency: string; stripePriceId: string | null },
    amount: number,
  ): Promise<string> {
    if (plan.stripePriceId) return plan.stripePriceId;

    const product = await this.stripe.client.products.create({
      name: `Zenex ${plan.name} plan`,
    });
    const price = await this.stripe.client.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100),
      currency: 'cad',
      // Billed monthly regardless of clean frequency — the plan price is
      // already a monthly figure, and the frequency describes visits.
      recurring: { interval: 'month' },
    });

    await this.prisma.subscriptionPlan.update({
      where: { id: plan.id },
      data: { stripePriceId: price.id },
    });
    return price.id;
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

    // Cancel at Stripe first. Previously this only flipped the local row,
    // which meant a customer who cancelled kept being charged every month
    // while the app showed them as cancelled — the worst possible pairing.
    // If Stripe rejects, we do not mark it cancelled locally either: better an
    // honest error than a UI that says cancelled while the card is still live.
    if (sub.stripeSubId && this.stripe.enabled) {
      await this.stripe.client.subscriptions.update(sub.stripeSubId, {
        // Matches the terms shown at checkout: the period already paid for
        // runs to its end, and nothing renews after it.
        cancel_at_period_end: true,
      });
    }

    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.CANCELLED },
      include: { plan: true },
    });
  }

  /**
   * A renewal payment succeeded — start the next period.
   *
   * Driven by Stripe's `invoice.paid` in live mode, so the allowance is only
   * ever granted against money that actually arrived. `periodEnd` comes from
   * Stripe rather than being recomputed, so our renewal date cannot drift away
   * from the date the card is really charged on.
   */
  async renewFromPayment(stripeSubId: string, periodEnd?: Date) {
    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubId },
      include: { plan: true },
    });
    if (!sub) return null;

    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        // Resets rather than accumulates — "2 cleans a month" is not 24 saved
        // up over a year.
        cleansRemaining: sub.plan.includedCleans,
        renewsAt: periodEnd ?? this.computeRenewal(sub.plan.frequency),
      },
    });
  }

  /**
   * A renewal payment failed.
   *
   * Paused, not cancelled: Stripe retries a failed card over several days and
   * most recover. PAUSED stops entitlements immediately — the booking path
   * only honours ACTIVE — without destroying the subscription while the
   * customer still has a chance to fix their card.
   */
  async markPaymentFailed(stripeSubId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubId },
      include: { plan: true, client: { include: { user: true } } },
    });
    if (!sub || sub.status === SubscriptionStatus.CANCELLED) return null;

    const updated = await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.PAUSED, cleansRemaining: 0 },
    });

    const account = sub.client?.user;
    if (account?.email) {
      await this.mail.subscriptionPaymentFailed({
        to: account.email,
        name: account.firstName,
        planName: sub.plan.name,
        amount: sub.consentAmount ?? sub.plan.price,
      });
    }

    return updated;
  }

  /** Stripe has given up retrying, or the subscription ended. */
  async markCancelledByStripe(stripeSubId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubId },
    });
    if (!sub) return null;
    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.CANCELLED, cleansRemaining: 0 },
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
