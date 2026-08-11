import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Transactional email via Resend's HTTP API (no SDK needed).
 *
 * If RESEND_API_KEY is absent the service runs in LOG mode: emails are written
 * to the server log instead of being sent, so the whole flow works in
 * development without an email provider — same graceful-degradation pattern
 * as the Stripe demo mode.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('mail.apiKey') || '';
    this.from =
      this.config.get<string>('mail.from') || 'Zenex <onboarding@resend.dev>';
    this.appUrl =
      this.config.get<string>('mail.appUrl') || 'http://localhost:3000';

    if (!this.apiKey) {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged, not sent');
    }
  }

  get enabled(): boolean {
    return !!this.apiKey;
  }

  /** Never throws: a failed email must not break the surrounding action. */
  async send(input: SendMailInput): Promise<void> {
    if (!this.enabled) {
      this.logger.log(`[email:log-mode] To: ${input.to} — ${input.subject}`);
      return;
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
        }),
      });
      if (!res.ok) {
        this.logger.warn(`Email send failed (${res.status}): ${await res.text()}`);
      }
    } catch (e) {
      this.logger.warn(`Email send error: ${(e as Error).message}`);
    }
  }

  // ─────────────── Templates ───────────────

  private layout(heading: string, body: string, cta?: { label: string; url: string }) {
    return `
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
  <div style="font-size:20px;font-weight:800;color:#0d9488;margin-bottom:20px">Zenex</div>
  <h1 style="font-size:20px;margin:0 0 12px">${heading}</h1>
  <div style="font-size:14px;line-height:1.6;color:#475569">${body}</div>
  ${
    cta
      ? `<a href="${cta.url}" style="display:inline-block;margin-top:20px;background:#0d9488;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:10px">${cta.label}</a>`
      : ''
  }
  <p style="font-size:12px;color:#94a3b8;margin-top:28px;border-top:1px solid #e2e8f0;padding-top:14px">
    Zenex — Canada's trusted cleaning marketplace.
  </p>
</div>`.trim();
  }

  /** Formats a booking time in UTC to match how slots are stored/displayed. */
  private when(date: Date) {
    return date.toLocaleString('en-CA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  }

  async bookingConfirmed(opts: {
    to: string;
    clientName: string;
    providerName: string;
    serviceName: string;
    reference: string;
    scheduledFor: Date;
    total: number;
  }) {
    await this.send({
      to: opts.to,
      subject: `Booking confirmed — ${opts.reference}`,
      html: this.layout(
        `You're booked, ${opts.clientName}!`,
        `<p><strong>${opts.serviceName}</strong> with ${opts.providerName}</p>
         <p><strong>${this.when(opts.scheduledFor)}</strong></p>
         <p>Reference: ${opts.reference}<br/>Total charged: $${opts.total.toFixed(2)} CAD</p>`,
        { label: 'View booking', url: `${this.appUrl}/client` },
      ),
    });
  }

  async newBookingForProvider(opts: {
    to: string;
    providerName: string;
    clientName: string;
    serviceName: string;
    reference: string;
    scheduledFor: Date;
  }) {
    await this.send({
      to: opts.to,
      subject: `New booking — ${opts.reference}`,
      html: this.layout(
        `New job booked, ${opts.providerName}`,
        `<p><strong>${opts.serviceName}</strong> for ${opts.clientName}</p>
         <p><strong>${this.when(opts.scheduledFor)}</strong></p>
         <p>Reference: ${opts.reference}</p>`,
        { label: 'Open dashboard', url: `${this.appUrl}/provider` },
      ),
    });
  }

  async bookingReminder(opts: {
    to: string;
    name: string;
    counterpartName: string;
    serviceName: string;
    reference: string;
    scheduledFor: Date;
  }) {
    await this.send({
      to: opts.to,
      subject: `Reminder: your clean is tomorrow (${opts.reference})`,
      html: this.layout(
        `See you tomorrow, ${opts.name}`,
        `<p><strong>${opts.serviceName}</strong> with ${opts.counterpartName}</p>
         <p><strong>${this.when(opts.scheduledFor)}</strong></p>
         <p>Need to change something? You can manage this booking in your dashboard.</p>`,
        { label: 'Manage booking', url: `${this.appUrl}/client` },
      ),
    });
  }

  async passwordReset(opts: { to: string; name: string; token: string }) {
    const url = `${this.appUrl}/auth/reset?token=${encodeURIComponent(opts.token)}`;
    await this.send({
      to: opts.to,
      subject: 'Reset your Zenex password',
      html: this.layout(
        'Reset your password',
        `<p>Hi ${opts.name}, we received a request to reset your Zenex password.</p>
         <p>This link expires in <strong>1 hour</strong>. If you didn't ask for this, you can safely ignore this email.</p>`,
        { label: 'Choose a new password', url },
      ),
    });
  }

  async bookingCancelled(opts: {
    to: string;
    name: string;
    reference: string;
    serviceName: string;
  }) {
    await this.send({
      to: opts.to,
      subject: `Booking cancelled — ${opts.reference}`,
      html: this.layout(
        `Booking cancelled`,
        `<p>Hi ${opts.name}, booking <strong>${opts.reference}</strong> (${opts.serviceName}) has been cancelled.</p>`,
        { label: 'Book again', url: `${this.appUrl}/search` },
      ),
    });
  }
}
