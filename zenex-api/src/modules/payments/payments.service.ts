import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Booking,
  BookingStatus,
  PayoutStatus,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { StripeService } from './stripe.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
    private readonly subscriptions: SubscriptionsService,
  ) {}

  private ref(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private money(n: number) {
    return Math.round(n * 100) / 100;
  }

  private ensureWallet(userId: string) {
    return this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  /** Client pays for a booking. Live → Stripe PaymentIntent; demo → instant settle. */
  async checkout(user: AuthUser, bookingId: string) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { userId: user.id },
    });
    if (!client) throw new ForbiddenException('Only clients can pay');

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { transaction: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== client.id) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.transaction) {
      throw new BadRequestException('Booking already paid');
    }

    // The client is charged the full total (incl. tax), but the platform fee
    // and the provider's earning are calculated on the pre-tax subtotal —
    // sales tax is held for remittance, not shared.
    const amount = this.money(booking.totalPrice);
    const taxAmount = this.money(booking.taxAmount ?? 0);
    const subtotal = this.money(amount - taxAmount);
    const platformFee = this.money(
      (subtotal * this.stripe.platformFeePercent) / 100,
    );
    const providerEarning = this.money(subtotal - platformFee);

    if (this.stripe.enabled) {
      const wallet = await this.ensureWallet(user.id);
      const intent = await this.stripe.client.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: (wallet.currency || 'CAD').toLowerCase(),
        metadata: {
          bookingId: booking.id,
          clientId: client.id,
          providerId: booking.providerId,
        },
        automatic_payment_methods: { enabled: true },
      });
      // Settlement is finalized by the webhook on payment_intent.succeeded.
      return {
        mode: 'live' as const,
        clientSecret: intent.client_secret,
        amount,
        subtotal,
        taxAmount,
        platformFee,
        providerEarning,
      };
    }

    // DEMO mode — settle immediately.
    await this.settle(booking, { amount, platformFee, providerEarning });
    return {
      mode: 'demo' as const,
      paid: true,
      amount,
      subtotal,
      taxAmount,
      platformFee,
      providerEarning,
      bookingId: booking.id,
    };
  }

  /** Records the money movement for a paid booking (client debit + provider credit). */
  private async settle(
    booking: Booking,
    opts: {
      amount: number;
      platformFee: number;
      providerEarning: number;
      stripeRef?: string;
    },
  ) {
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { id: booking.clientId },
    });
    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { id: booking.providerId },
    });
    if (!clientProfile || !providerProfile) {
      throw new NotFoundException('Booking parties not found');
    }

    // Capture up front — narrowing doesn't survive the transaction closure.
    const clientUserId: string = clientProfile.userId;
    const providerUserId: string = providerProfile.userId;

    const clientWallet = await this.ensureWallet(clientUserId);
    const providerWallet = await this.ensureWallet(providerUserId);

    // `await`, not `return` — this used to return the transaction, which made
    // every line below it unreachable. The "payment received" and "you earned"
    // notifications have therefore never actually been sent.
    await this.prisma.$transaction(async (tx) => {
      // Client is charged (debit) — this is the one transaction tied to the booking.
      await tx.transaction.create({
        data: {
          reference: this.ref('TXN'),
          walletId: clientWallet.id,
          bookingId: booking.id,
          description: `Payment — booking ${booking.reference}`,
          amount: -opts.amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.COMPLETED,
          stripeRef: opts.stripeRef,
        },
      });
      await tx.wallet.update({
        where: { id: clientWallet.id },
        data: { balance: { decrement: opts.amount } },
      });

      // Provider is credited their earning (net of platform fee).
      await tx.transaction.create({
        data: {
          reference: this.ref('TXN'),
          walletId: providerWallet.id,
          description: `Earning — booking ${booking.reference}`,
          amount: opts.providerEarning,
          type: TransactionType.CREDIT,
          status: TransactionStatus.COMPLETED,
          stripeRef: opts.stripeRef,
        },
      });
      await tx.wallet.update({
        where: { id: providerWallet.id },
        data: { balance: { increment: opts.providerEarning } },
      });

      if (booking.status === BookingStatus.PENDING) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CONFIRMED },
        });
      }
    });

    // Receipt for the client, earnings alert for the provider.
    await this.notifications.notifyMany([
      {
        userId: clientUserId,
        type: 'payment',
        title: `Payment received — $${opts.amount.toFixed(2)}`,
        body: `Booking ${booking.reference}`,
      },
      {
        userId: providerUserId,
        type: 'payment',
        title: `You earned $${opts.providerEarning.toFixed(2)}`,
        body: `Booking ${booking.reference} · paid`,
      },
    ]);

    // Emailed receipt with the tax itemised. This is the single choke point
    // for a successful payment — both the demo path and the Stripe webhook
    // land here — so wiring it once covers every way a booking gets paid.
    const clientUser = await this.prisma.user.findUnique({
      where: { id: clientUserId },
      select: { email: true, firstName: true },
    });

    // serviceId is nullable, so pull it into a local first — narrowing a
    // property access does not survive into the query argument.
    const serviceId = booking.serviceId;
    const service = serviceId
      ? await this.prisma.service.findUnique({
          where: { id: serviceId },
          select: { name: true },
        })
      : null;

    if (clientUser?.email) {
      const taxAmount = this.money(booking.taxAmount ?? 0);
      await this.mail.paymentReceipt({
        to: clientUser.email,
        clientName: clientUser.firstName,
        reference: booking.reference,
        serviceName: service?.name ?? 'Cleaning',
        scheduledFor: booking.scheduledFor,
        subtotal: this.money(booking.basePrice),
        extrasTotal: this.money(booking.extrasTotal ?? 0),
        taxAmount,
        taxLabel: booking.taxLabel ?? 'Tax',
        total: opts.amount,
      });
    }
  }

  /** Stripe webhook — verifies signature and settles on payment_intent.succeeded. */
  async handleWebhook(signature: string, rawBody: Buffer) {
    if (!this.stripe.enabled) {
      return { received: true, ignored: 'demo mode' };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.client.webhooks.constructEvent(
        rawBody,
        signature,
        this.stripe.webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    // A subscription only becomes ACTIVE once Stripe confirms the first
    // payment. Until this fires the row sits PENDING and grants nothing, so an
    // abandoned checkout never leaves someone holding an unpaid plan.
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId =
        session.metadata?.subscriptionId ?? session.client_reference_id;
      if (subscriptionId) {
        const stripeSubId =
          typeof session.subscription === 'string'
            ? session.subscription
            : (session.subscription?.id ?? undefined);
        await this.subscriptions.activate(subscriptionId, stripeSubId);
      }
      return { received: true };
    }

    // ── Recurring billing ──
    // Renewals are driven by Stripe, not by our clock. The allowance is only
    // ever granted against an invoice Stripe confirms it collected.
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
      // The first invoice is handled by checkout.session.completed; this is
      // for the periods after it.
      if (stripeSubId && invoice.billing_reason !== 'subscription_create') {
        const periodEnd = invoice.period_end
          ? new Date(invoice.period_end * 1000)
          : undefined;
        await this.subscriptions.renewFromPayment(stripeSubId, periodEnd);
      }
      return { received: true };
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
      if (stripeSubId) {
        await this.subscriptions.markPaymentFailed(stripeSubId);
      }
      return { received: true };
    }

    // Stripe has exhausted its retries, or the customer's cancellation has
    // reached the end of the paid period.
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      await this.subscriptions.markCancelledByStripe(sub.id);
      return { received: true };
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;
      if (bookingId) {
        const booking = await this.prisma.booking.findUnique({
          where: { id: bookingId },
          include: { transaction: true },
        });
        if (booking && !booking.transaction) {
          const amount = this.money(intent.amount / 100);
          const taxAmount = this.money(booking.taxAmount ?? 0);
          const subtotal = this.money(amount - taxAmount);
          const platformFee = this.money(
            (subtotal * this.stripe.platformFeePercent) / 100,
          );
          const providerEarning = this.money(subtotal - platformFee);
          await this.settle(booking, {
            amount,
            platformFee,
            providerEarning,
            stripeRef: intent.id,
          });
        }
      }
    }

    return { received: true };
  }

  /**
   * Refund a cancelled booking. `percent` is how much of the charge to return
   * (100 = full). Reverses the wallet entries and, in live mode, issues a real
   * Stripe refund. Safe to call on unpaid bookings — it simply no-ops.
   */
  async refundBooking(bookingId: string, percent: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { transaction: true },
    });
    if (!booking?.transaction) return null; // never paid — nothing to refund

    const paid = Math.abs(booking.transaction.amount);
    const refundAmount = this.money((paid * Math.max(0, Math.min(percent, 100))) / 100);
    if (refundAmount <= 0) return null;

    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { id: booking.clientId },
    });
    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { id: booking.providerId },
    });
    if (!clientProfile || !providerProfile) return null;

    const clientUserId = clientProfile.userId;
    const providerUserId = providerProfile.userId;
    const clientWallet = await this.ensureWallet(clientUserId);
    const providerWallet = await this.ensureWallet(providerUserId);

    // Claw back the provider's share proportionally to what we refund.
    const taxAmount = this.money(booking.taxAmount ?? 0);
    const subtotal = this.money(paid - taxAmount);
    const platformFee = this.money(
      (subtotal * this.stripe.platformFeePercent) / 100,
    );
    const providerEarned = this.money(subtotal - platformFee);
    const providerClawback = this.money((providerEarned * percent) / 100);

    let stripeRef: string | undefined;
    if (this.stripe.enabled && booking.transaction.stripeRef) {
      try {
        const refund = await this.stripe.client.refunds.create({
          payment_intent: booking.transaction.stripeRef,
          amount: Math.round(refundAmount * 100),
        });
        stripeRef = refund.id;
      } catch (e) {
        this.logger.warn(`Stripe refund failed: ${(e as Error).message}`);
      }
    }

    await this.prisma.$transaction([
      // Credit the client back.
      this.prisma.transaction.create({
        data: {
          reference: this.ref('TXN'),
          walletId: clientWallet.id,
          description: `Refund — booking ${booking.reference}`,
          amount: refundAmount,
          type: TransactionType.CREDIT,
          status: TransactionStatus.REFUNDED,
          stripeRef,
        },
      }),
      this.prisma.wallet.update({
        where: { id: clientWallet.id },
        data: { balance: { increment: refundAmount } },
      }),
      // Reverse the provider's earning.
      this.prisma.transaction.create({
        data: {
          reference: this.ref('TXN'),
          walletId: providerWallet.id,
          description: `Reversal — booking ${booking.reference} cancelled`,
          amount: -providerClawback,
          type: TransactionType.DEBIT,
          status: TransactionStatus.REFUNDED,
          stripeRef,
        },
      }),
      this.prisma.wallet.update({
        where: { id: providerWallet.id },
        data: { balance: { decrement: providerClawback } },
      }),
      // Mark the original charge as refunded.
      this.prisma.transaction.update({
        where: { id: booking.transaction.id },
        data: { status: TransactionStatus.REFUNDED },
      }),
    ]);

    await this.notifications.notifyMany([
      {
        userId: clientUserId,
        type: 'payment',
        title: `Refund issued — $${refundAmount.toFixed(2)}`,
        body: `Booking ${booking.reference}${percent < 100 ? ` (${percent}% per cancellation policy)` : ''}`,
      },
      {
        userId: providerUserId,
        type: 'payment',
        title: `Booking ${booking.reference} cancelled`,
        body: `$${providerClawback.toFixed(2)} reversed from your balance`,
      },
    ]);

    // Money leaving the platform gets its own email. It lives here rather than
    // in the cancellation flow because this is the only code that knows the
    // amount actually refunded after the policy percentage is applied — and
    // because refunds triggered any other way still need confirming.
    const clientUser = await this.prisma.user.findUnique({
      where: { id: clientUserId },
      select: { email: true, firstName: true },
    });
    if (clientUser?.email) {
      await this.mail.refundIssued({
        to: clientUser.email,
        name: clientUser.firstName,
        reference: booking.reference,
        amount: refundAmount,
        reason:
          percent < 100
            ? `${percent}% refunded under the cancellation policy`
            : undefined,
      });
    }

    return { refundAmount, providerClawback, percent, stripeRef };
  }

  // ─────────────── Stripe Connect (provider payouts) ───────────────

  /**
   * Start or resume Express onboarding. Returns a hosted Stripe URL the
   * provider completes; in demo mode returns a stub so the UI still works.
   */
  async connectOnboarding(user: AuthUser, returnUrl: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!provider) {
      throw new ForbiddenException('Only providers can connect payouts');
    }

    const wallet = await this.ensureWallet(user.id);

    if (!this.stripe.enabled) {
      return {
        mode: 'demo' as const,
        url: null,
        message:
          'Stripe is not configured — payouts run in demo mode. Add STRIPE_SECRET_KEY to enable real onboarding.',
      };
    }

    let accountId = wallet.stripeConnectAccountId;
    if (!accountId) {
      const account = await this.stripe.client.accounts.create({
        type: 'express',
        country: 'CA',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: 'individual',
        metadata: { providerId: provider.id, userId: user.id },
      });
      accountId = account.id;
      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    const link = await this.stripe.client.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return { mode: 'live' as const, url: link.url, accountId };
  }

  /** Whether this provider can actually receive payouts yet. */
  async connectStatus(user: AuthUser) {
    const wallet = await this.ensureWallet(user.id);
    const accountId = wallet.stripeConnectAccountId;

    if (!this.stripe.enabled) {
      return {
        mode: 'demo' as const,
        connected: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };
    }
    if (!accountId) {
      return {
        mode: 'live' as const,
        connected: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };
    }

    const account = await this.stripe.client.accounts.retrieve(accountId);
    return {
      mode: 'live' as const,
      connected: true,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements?.currently_due ?? [],
    };
  }

  /** Provider withdraws their available balance. Live → Stripe transfer; demo → simulated. */
  async payout(user: AuthUser) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!provider) {
      throw new ForbiddenException('Only providers can request payouts');
    }

    const wallet = await this.ensureWallet(user.id);
    if (wallet.balance <= 0) {
      throw new BadRequestException('No balance available for payout');
    }

    const amount = this.money(wallet.balance);
    const jobs = await this.prisma.transaction.count({
      where: { walletId: wallet.id, type: TransactionType.CREDIT },
    });

    let stripeRef: string | undefined;
    if (this.stripe.enabled && !wallet.stripeConnectAccountId) {
      throw new BadRequestException(
        'Connect your payout account before requesting a payout.',
      );
    }
    if (this.stripe.enabled && wallet.stripeConnectAccountId) {
      const transfer = await this.stripe.client.transfers.create({
        amount: Math.round(amount * 100),
        currency: (wallet.currency || 'CAD').toLowerCase(),
        destination: wallet.stripeConnectAccountId,
      });
      stripeRef = transfer.id;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          reference: this.ref('PAY'),
          providerId: provider.id,
          amount,
          jobsCount: jobs,
          status: PayoutStatus.PAID,
          stripeRef,
          paidAt: new Date(),
        },
      });
      await tx.transaction.create({
        data: {
          reference: this.ref('TXN'),
          walletId: wallet.id,
          description: `Payout ${payout.reference}`,
          amount: -amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.COMPLETED,
          stripeRef,
        },
      });
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: 0 },
      });
      return payout;
    });

    // Sent after the transaction commits, not inside it — an email is not
    // rollback-able, and telling someone their money is on the way when the
    // write later failed would be worse than not telling them at all.
    const providerUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, firstName: true },
    });
    if (providerUser?.email) {
      await this.mail.payoutSent({
        to: providerUser.email,
        providerName: providerUser.firstName,
        amount,
        jobCount: jobs,
      });
    }

    return result;
  }
}
