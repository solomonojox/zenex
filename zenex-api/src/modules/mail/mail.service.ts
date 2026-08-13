import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as T from './templates';
import type { RenderedEmail } from './templates';

export interface SendMailInput {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  /** Shows against the send in ZeptoMail's log — use a booking reference. */
  reference?: string;
}

/**
 * Transactional email via ZeptoMail's HTTP API.
 *
 * No SDK: the API is a single JSON POST, and pulling in a dependency to build
 * one request is not worth the supply-chain surface. Two details of Zoho's API
 * catch people out and are easy to get wrong:
 *
 *   - The auth header value is `Zoho-enczapikey <token>`, not `Bearer <token>`.
 *   - Recipients are nested: `to: [{ email_address: { address, name } }]`.
 *
 * If the token is absent the service runs in LOG mode — emails go to the
 * server log instead of the wire — so the whole app works in development
 * without an email provider, the same graceful-degradation pattern used for
 * Stripe demo mode.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly token: string;
  private readonly apiUrl: string;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly replyTo: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    // Zoho's setup page shows the token as the full header value —
    // "Zoho-enczapikey wSsVR6…" — and it is routinely copied that way. The
    // prefix is added below when the request is built, so strip it here rather
    // than sending it twice and failing auth with a token that is actually
    // correct.
    this.token = (this.config.get<string>('mail.token') || '')
      .replace(/^\s*Zoho-enczapikey\s+/i, '')
      .trim();
    this.apiUrl =
      this.config.get<string>('mail.apiUrl') ||
      'https://api.zeptomail.com/v1.1/email';
    this.replyTo = this.config.get<string>('mail.replyTo') || '';
    this.appUrl =
      this.config.get<string>('mail.appUrl') || 'http://localhost:3000';

    // MAIL_FROM may be a bare address or "Zenex <no-reply@zenex.ca>". Accept
    // both so the variable can stay as-is from the Resend setup.
    const raw = this.config.get<string>('mail.from') || '';
    const bracketed = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
    this.fromAddress = (bracketed ? bracketed[2] : raw).trim();
    this.fromName =
      this.config.get<string>('mail.fromName') ||
      (bracketed ? bracketed[1].replace(/^"|"$/g, '').trim() : '') ||
      'Zenex';

    if (!this.token) {
      this.logger.warn(
        'ZEPTOMAIL_TOKEN not set — emails will be logged, not sent',
      );
    } else if (!this.fromAddress) {
      this.logger.error(
        'ZEPTOMAIL_TOKEN is set but MAIL_FROM is empty — sends will be rejected',
      );
    }
  }

  get enabled(): boolean {
    return !!this.token && !!this.fromAddress;
  }

  /**
   * Why email is or isn't sending, safe to expose publicly.
   *
   * Surfaced on /api/health because "no email arrived" is otherwise
   * indistinguishable from the outside: log mode fails silently by design, so
   * the app looks healthy while nothing is delivered. Never includes the token.
   */
  get status() {
    const reasons: string[] = [];
    if (!this.token) reasons.push('ZEPTOMAIL_TOKEN is not set');
    if (!this.fromAddress) reasons.push('MAIL_FROM is not set');

    return {
      mode: this.enabled ? ('live' as const) : ('log-mode' as const),
      from: this.fromAddress || null,
      // The sender domain must be verified in the ZeptoMail agent or every
      // send is rejected, so it is worth showing at a glance.
      fromDomain: this.fromAddress.split('@')[1] ?? null,
      endpoint: this.apiUrl,
      ...(reasons.length ? { blockedBy: reasons } : {}),
    };
  }

  /**
   * Send a test message and hand back exactly what the provider said.
   *
   * "No email arrived" has half a dozen possible causes at the provider's end
   * — unverified sender domain, wrong regional endpoint, an unapproved
   * ZeptoMail agent, a bad token — and every one of them looks identical from
   * the app, which logs the rejection and carries on. This surfaces the raw
   * response so the actual reason is visible without trawling server logs.
   */
  async sendTest(to: string) {
    if (!this.enabled) {
      return {
        sent: false,
        mode: 'log-mode' as const,
        reason:
          'Mail is in log-mode — nothing is sent. See the mail block on /api/health.',
        status: this.status,
      };
    }

    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-enczapikey ${this.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          from: { address: this.fromAddress, name: this.fromName },
          to: [{ email_address: { address: to } }],
          subject: 'Zenex test email',
          htmlbody:
            '<p>If you are reading this, Zenex can send email successfully.</p>',
          textbody: 'If you are reading this, Zenex can send email successfully.',
        }),
      });

      const body = await res.text();
      return {
        sent: res.ok,
        mode: 'live' as const,
        httpStatus: res.status,
        from: this.fromAddress,
        to,
        // Zoho's own error code and message live here — this is the bit that
        // actually names the problem.
        providerResponse: body.slice(0, 1500),
      };
    } catch (e) {
      return {
        sent: false,
        mode: 'live' as const,
        error: (e as Error).message,
      };
    }
  }

  /** Never throws: a failed email must not roll back the action that caused it. */
  async send(input: SendMailInput): Promise<void> {
    if (!this.enabled) {
      this.logger.log(`[email:log-mode] To: ${input.to} — ${input.subject}`);
      return;
    }

    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          // Zoho's scheme, not Bearer.
          Authorization: `Zoho-enczapikey ${this.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          from: { address: this.fromAddress, name: this.fromName },
          to: [
            {
              email_address: {
                address: input.to,
                ...(input.toName ? { name: input.toName } : {}),
              },
            },
          ],
          ...(this.replyTo
            ? { reply_to: [{ address: this.replyTo, name: this.fromName }] }
            : {}),
          subject: input.subject,
          htmlbody: input.html,
          ...(input.text ? { textbody: input.text } : {}),
          ...(input.reference ? { client_reference: input.reference } : {}),
          // Open/click pixels in a booking receipt are hard to justify to a
          // customer and add nothing operationally. Off by default.
          track_opens: false,
          track_clicks: false,
        }),
      });

      if (!res.ok) {
        // Body carries Zoho's error code and the offending field, which is the
        // only way to tell "unverified sender domain" from "bad token".
        this.logger.warn(
          `Email send failed (${res.status}) to ${input.to}: ${await res.text()}`,
        );
      }
    } catch (e) {
      this.logger.warn(`Email send error: ${(e as Error).message}`);
    }
  }

  /** Send an already-rendered template. */
  private async dispatch(
    to: string,
    toName: string | undefined,
    email: RenderedEmail,
    reference?: string,
  ) {
    await this.send({
      to,
      toName,
      subject: email.subject,
      html: email.html,
      text: email.text,
      reference,
    });
  }

  private get ctx() {
    return { appUrl: this.appUrl };
  }

  // ─────────────── onboarding ───────────────

  async welcomeClient(o: { to: string; name: string }) {
    await this.dispatch(o.to, o.name, T.welcomeClient({ ...this.ctx, ...o }));
  }

  async welcomeProvider(o: { to: string; name: string }) {
    await this.dispatch(o.to, o.name, T.welcomeProvider({ ...this.ctx, ...o }));
  }

  async verifyEmail(o: { to: string; name: string; token: string }) {
    await this.dispatch(o.to, o.name, T.verifyEmail({ ...this.ctx, ...o }));
  }

  async passwordReset(o: { to: string; name: string; token: string }) {
    await this.dispatch(o.to, o.name, T.passwordReset({ ...this.ctx, ...o }));
  }

  // ─────────────── bookings ───────────────

  async bookingConfirmed(o: {
    to: string;
    clientName: string;
    providerName: string;
    serviceName: string;
    reference: string;
    scheduledFor: Date;
    total: number;
    address?: string | null;
  }) {
    await this.dispatch(
      o.to,
      o.clientName,
      T.bookingConfirmed({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  async newBookingForProvider(o: {
    to: string;
    providerName: string;
    clientName: string;
    serviceName: string;
    reference: string;
    scheduledFor: Date;
    address?: string | null;
    payout?: number;
  }) {
    await this.dispatch(
      o.to,
      o.providerName,
      T.newBookingForProvider({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  async bookingReminder(o: {
    to: string;
    name: string;
    counterpartName: string;
    serviceName: string;
    reference: string;
    scheduledFor: Date;
    address?: string | null;
  }) {
    await this.dispatch(
      o.to,
      o.name,
      T.bookingReminder({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  async bookingCancelled(o: {
    to: string;
    name: string;
    reference: string;
    serviceName: string;
    scheduledFor?: Date;
    refundAmount?: number;
    cancelledBy?: string;
  }) {
    await this.dispatch(
      o.to,
      o.name,
      T.bookingCancelled({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  async bookingRescheduled(o: {
    to: string;
    name: string;
    reference: string;
    serviceName: string;
    previous: Date;
    scheduledFor: Date;
  }) {
    await this.dispatch(
      o.to,
      o.name,
      T.bookingRescheduled({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  async reviewRequest(o: {
    to: string;
    clientName: string;
    providerName: string;
    reference: string;
  }) {
    await this.dispatch(
      o.to,
      o.clientName,
      T.reviewRequest({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  // ─────────────── money ───────────────

  async paymentReceipt(o: {
    to: string;
    clientName: string;
    reference: string;
    serviceName: string;
    scheduledFor: Date;
    subtotal: number;
    extrasTotal?: number;
    taxAmount: number;
    taxLabel: string;
    total: number;
  }) {
    await this.dispatch(
      o.to,
      o.clientName,
      T.paymentReceipt({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  async refundIssued(o: {
    to: string;
    name: string;
    reference: string;
    amount: number;
    reason?: string;
  }) {
    await this.dispatch(
      o.to,
      o.name,
      T.refundIssued({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  async payoutSent(o: {
    to: string;
    providerName: string;
    amount: number;
    jobCount?: number;
  }) {
    await this.dispatch(
      o.to,
      o.providerName,
      T.payoutSent({ ...this.ctx, ...o }),
    );
  }

  async stripeOnboardingReminder(o: {
    to: string;
    providerName: string;
    pendingAmount?: number;
  }) {
    await this.dispatch(
      o.to,
      o.providerName,
      T.stripeOnboardingReminder({ ...this.ctx, ...o }),
    );
  }

  async subscriptionPaymentFailed(o: {
    to: string;
    name: string;
    planName: string;
    amount: number;
  }) {
    await this.dispatch(
      o.to,
      o.name,
      T.subscriptionPaymentFailed({ ...this.ctx, ...o }),
    );
  }

  async subscriptionStarted(o: {
    to: string;
    name: string;
    planName: string;
    frequency: string;
    price: number;
  }) {
    await this.dispatch(
      o.to,
      o.name,
      T.subscriptionStarted({ ...this.ctx, ...o }),
    );
  }

  // ─────────────── trust & verification ───────────────

  async kycApproved(o: { to: string; providerName: string }) {
    await this.dispatch(
      o.to,
      o.providerName,
      T.kycApproved({ ...this.ctx, ...o }),
    );
  }

  async kycRejected(o: {
    to: string;
    providerName: string;
    reason?: string;
  }) {
    await this.dispatch(
      o.to,
      o.providerName,
      T.kycRejected({ ...this.ctx, ...o }),
    );
  }

  async insuranceExpiring(o: {
    to: string;
    providerName: string;
    expiresOn: Date;
    daysLeft: number;
  }) {
    await this.dispatch(
      o.to,
      o.providerName,
      T.insuranceExpiring({ ...this.ctx, ...o }),
    );
  }

  // ─────────────── messaging & disputes ───────────────

  async newMessage(o: {
    to: string;
    name: string;
    senderName: string;
    preview: string;
  }) {
    await this.dispatch(o.to, o.name, T.newMessage({ ...this.ctx, ...o }));
  }

  async disputeOpened(o: {
    to: string;
    name: string;
    reference: string;
    reason: string;
  }) {
    await this.dispatch(
      o.to,
      o.name,
      T.disputeOpened({ ...this.ctx, ...o }),
      o.reference,
    );
  }

  async disputeResolved(o: {
    to: string;
    name: string;
    reference: string;
    outcome: string;
    refundAmount?: number;
  }) {
    await this.dispatch(
      o.to,
      o.name,
      T.disputeResolved({ ...this.ctx, ...o }),
      o.reference,
    );
  }
}
