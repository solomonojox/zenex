/**
 * Every transactional email Zenex sends.
 *
 * Kept separate from MailService so the templates can be rendered and asserted
 * on without a transport, an API key, or a network call — see templates.spec.ts.
 *
 * Two rules hold throughout:
 *
 *  1. Everything interpolated goes through `esc()`. Names, service labels and
 *     dispute reasons are user-supplied; dropping them raw into HTML lets a
 *     provider called `<img onerror=...>` write markup into a client's inbox.
 *  2. Every template returns a plain-text body alongside the HTML. Text is
 *     written deliberately rather than stripped from the markup, because
 *     HTML-only mail is a well-known spam signal and some clients show text
 *     by default.
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** A label/value pair rendered as a row in the details table. */
type Fact = [label: string, value: string];

interface Block {
  /** Short line some clients preview next to the subject. */
  preheader?: string;
  heading: string;
  /** Body paragraphs. Plain strings — escaped on the way in. */
  paragraphs?: string[];
  facts?: Fact[];
  cta?: { label: string; url: string };
  /** Small print under the divider, e.g. "you can ignore this email". */
  footnote?: string;
}

// ─────────────── helpers ───────────────

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** HTML-escape anything that came from a user or the database. */
export function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Canadian dollars, always two decimals. */
export function money(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `$${n.toFixed(2)} CAD`;
}

/**
 * Booking times are stored and displayed as UTC wall-clock throughout Zenex,
 * so emails must format in UTC too. Formatting in the server's local zone is
 * how a client in Toronto ends up reading "4:00 AM" for an 8:00 AM booking.
 */
export function when(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

const BRAND = '#0d9488';
const INK = '#0f172a';
const MUTED = '#475569';
const FAINT = '#94a3b8';
const RULE = '#e2e8f0';

function factRows(facts: Fact[]): string {
  return facts
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:${FAINT}">${esc(label)}</td>
        <td style="padding:6px 0;font-size:13px;color:${INK};font-weight:600;text-align:right">${esc(value)}</td>
      </tr>`,
    )
    .join('');
}

/** Render one email to HTML + text. */
export function render(subject: string, block: Block): RenderedEmail {
  const paragraphs = block.paragraphs ?? [];
  const facts = block.facts ?? [];

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f8fafb">
  ${
    block.preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(block.preheader)}</div>`
      : ''
  }
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;padding:28px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK}">
        <tr><td style="font-size:20px;font-weight:800;color:${BRAND};padding-bottom:18px">Zenex</td></tr>
        <tr><td style="font-size:20px;font-weight:700;line-height:1.3;padding-bottom:10px">${esc(block.heading)}</td></tr>
        ${paragraphs
          .map(
            (p) =>
              `<tr><td style="font-size:14px;line-height:1.65;color:${MUTED};padding-bottom:10px">${esc(p)}</td></tr>`,
          )
          .join('')}
        ${
          facts.length
            ? `<tr><td style="padding:8px 0">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                        style="border-top:1px solid ${RULE};border-bottom:1px solid ${RULE}">
                   ${factRows(facts)}
                 </table>
               </td></tr>`
            : ''
        }
        ${
          block.cta
            ? `<tr><td style="padding-top:20px">
                 <a href="${esc(block.cta.url)}"
                    style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px">${esc(block.cta.label)}</a>
               </td></tr>`
            : ''
        }
        ${
          block.footnote
            ? `<tr><td style="font-size:12px;line-height:1.6;color:${FAINT};padding-top:18px">${esc(block.footnote)}</td></tr>`
            : ''
        }
        <tr><td style="font-size:12px;color:${FAINT};padding-top:24px;border-top:1px solid ${RULE};margin-top:20px">
          Zenex — Canada's trusted cleaning marketplace.<br/>
          This is a service message about your account or a booking.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textParts = [
    block.heading,
    '',
    ...paragraphs,
    ...(facts.length
      ? ['', ...facts.map(([label, value]) => `${label}: ${value}`)]
      : []),
    ...(block.cta ? ['', `${block.cta.label}: ${block.cta.url}`] : []),
    ...(block.footnote ? ['', block.footnote] : []),
    '',
    '—',
    "Zenex — Canada's trusted cleaning marketplace.",
  ];

  return { subject, html, text: textParts.join('\n').trim() };
}

// ─────────────── onboarding ───────────────

export const welcomeClient = (o: { appUrl: string; name: string }) =>
  render('Welcome to Zenex', {
    preheader: 'Your account is ready — find a cleaner near you.',
    heading: `Welcome, ${o.name}`,
    paragraphs: [
      'Your Zenex account is ready. You can browse vetted cleaners in your area, see real prices up front, and book in a couple of minutes.',
      'Every cleaner on Zenex is identity-checked before they can take work, and payment is only released after the job is done.',
    ],
    cta: { label: 'Find a cleaner', url: `${o.appUrl}/search` },
  });

export const welcomeProvider = (o: { appUrl: string; name: string }) =>
  render('Welcome to Zenex — next steps', {
    preheader: 'Two things to finish before you can take bookings.',
    heading: `Welcome aboard, ${o.name}`,
    paragraphs: [
      'Your provider account is set up. Before clients can book you, there are two things to finish:',
      '1. Upload your ID and insurance so we can verify you. Verified cleaners appear first in search and get noticeably more bookings.',
      '2. Set your working hours. We have started you on Monday to Saturday, 8am to 6pm — adjust it to match reality, because clients can only book the times you publish.',
    ],
    cta: { label: 'Finish setting up', url: `${o.appUrl}/provider` },
  });

export const verifyEmail = (o: { appUrl: string; name: string; token: string }) =>
  render('Confirm your email address', {
    preheader: 'One click to confirm your address.',
    heading: 'Confirm your email',
    paragraphs: [
      `Hi ${o.name}, please confirm this address so we can send you booking confirmations and receipts.`,
    ],
    cta: {
      label: 'Confirm email',
      url: `${o.appUrl}/auth/verify?token=${encodeURIComponent(o.token)}`,
    },
    footnote:
      "This link expires in 24 hours. If you didn't create a Zenex account, you can ignore this email.",
  });

export const passwordReset = (o: { appUrl: string; name: string; token: string }) =>
  render('Reset your Zenex password', {
    preheader: 'A link to choose a new password.',
    heading: 'Reset your password',
    paragraphs: [
      `Hi ${o.name}, we received a request to reset your Zenex password.`,
    ],
    cta: {
      label: 'Choose a new password',
      url: `${o.appUrl}/auth/reset?token=${encodeURIComponent(o.token)}`,
    },
    footnote:
      "This link expires in 1 hour. If you didn't ask for this, you can safely ignore this email — your password will not change.",
  });

// ─────────────── bookings ───────────────

export const bookingConfirmed = (o: {
  appUrl: string;
  clientName: string;
  providerName: string;
  serviceName: string;
  reference: string;
  scheduledFor: Date;
  total: number;
  address?: string | null;
}) =>
  render(`Booking confirmed — ${o.reference}`, {
    preheader: `${o.serviceName} with ${o.providerName}, ${when(o.scheduledFor)}`,
    heading: `You're booked, ${o.clientName}`,
    paragraphs: [`${o.providerName} will see you at the time below.`],
    facts: [
      ['Service', o.serviceName],
      ['Cleaner', o.providerName],
      ['When', when(o.scheduledFor)],
      ...(o.address ? ([['Address', o.address]] as Fact[]) : []),
      ['Reference', o.reference],
      ['Total', money(o.total)],
    ],
    cta: { label: 'View booking', url: `${o.appUrl}/client` },
  });

export const newBookingForProvider = (o: {
  appUrl: string;
  providerName: string;
  clientName: string;
  serviceName: string;
  reference: string;
  scheduledFor: Date;
  address?: string | null;
  payout?: number;
}) =>
  render(`New booking — ${o.reference}`, {
    preheader: `${o.serviceName} for ${o.clientName}, ${when(o.scheduledFor)}`,
    heading: `New job booked, ${o.providerName}`,
    facts: [
      ['Service', o.serviceName],
      ['Client', o.clientName],
      ['When', when(o.scheduledFor)],
      ...(o.address ? ([['Address', o.address]] as Fact[]) : []),
      ['Reference', o.reference],
      ...(o.payout !== undefined
        ? ([['Your payout', money(o.payout)]] as Fact[])
        : []),
    ],
    cta: { label: 'Open dashboard', url: `${o.appUrl}/provider` },
  });

export const bookingReminder = (o: {
  appUrl: string;
  name: string;
  counterpartName: string;
  serviceName: string;
  reference: string;
  scheduledFor: Date;
  address?: string | null;
}) =>
  render(`Reminder: your clean is tomorrow (${o.reference})`, {
    preheader: `${o.serviceName} with ${o.counterpartName} tomorrow.`,
    heading: `See you tomorrow, ${o.name}`,
    facts: [
      ['Service', o.serviceName],
      ['With', o.counterpartName],
      ['When', when(o.scheduledFor)],
      ...(o.address ? ([['Address', o.address]] as Fact[]) : []),
      ['Reference', o.reference],
    ],
    cta: { label: 'Manage booking', url: `${o.appUrl}/client` },
    footnote:
      'Need to change something? Cancellations made more than 24 hours ahead are refunded in full.',
  });

export const bookingCancelled = (o: {
  appUrl: string;
  name: string;
  reference: string;
  serviceName: string;
  scheduledFor?: Date;
  refundAmount?: number;
  cancelledBy?: string;
}) =>
  render(`Booking cancelled — ${o.reference}`, {
    preheader: `${o.serviceName} has been cancelled.`,
    heading: 'Booking cancelled',
    paragraphs: [
      `Hi ${o.name}, booking ${o.reference} has been cancelled${
        o.cancelledBy ? ` by ${o.cancelledBy}` : ''
      }.`,
      ...(o.refundAmount !== undefined && o.refundAmount > 0
        ? [
            `A refund of ${money(o.refundAmount)} is on its way back to your original payment method. Card refunds usually settle within 5 to 10 business days.`,
          ]
        : []),
    ],
    facts: [
      ['Service', o.serviceName],
      ...(o.scheduledFor ? ([['Was booked for', when(o.scheduledFor)]] as Fact[]) : []),
      ['Reference', o.reference],
      ...(o.refundAmount !== undefined
        ? ([['Refund', money(o.refundAmount)]] as Fact[])
        : []),
    ],
    cta: { label: 'Book again', url: `${o.appUrl}/search` },
  });

export const bookingRescheduled = (o: {
  appUrl: string;
  name: string;
  reference: string;
  serviceName: string;
  previous: Date;
  scheduledFor: Date;
}) =>
  render(`Booking moved — ${o.reference}`, {
    preheader: `Now ${when(o.scheduledFor)}.`,
    heading: 'Your booking has moved',
    paragraphs: [`Hi ${o.name}, ${o.serviceName} has been rescheduled.`],
    facts: [
      ['Was', when(o.previous)],
      ['Now', when(o.scheduledFor)],
      ['Reference', o.reference],
    ],
    cta: { label: 'View booking', url: `${o.appUrl}/client` },
  });

export const reviewRequest = (o: {
  appUrl: string;
  clientName: string;
  providerName: string;
  reference: string;
}) =>
  render(`How did it go with ${o.providerName}?`, {
    preheader: 'A quick rating helps other clients choose.',
    heading: `How did it go, ${o.clientName}?`,
    paragraphs: [
      `${o.providerName} has marked your clean as complete. A rating takes about twenty seconds and it is the main thing other clients use to choose.`,
      'It also matters a great deal to the cleaner — reviews are how good people on Zenex get more work.',
    ],
    facts: [['Reference', o.reference]],
    cta: { label: 'Leave a review', url: `${o.appUrl}/client` },
  });

// ─────────────── money ───────────────

export const paymentReceipt = (o: {
  appUrl: string;
  clientName: string;
  reference: string;
  serviceName: string;
  scheduledFor: Date;
  subtotal: number;
  extrasTotal?: number;
  taxAmount: number;
  taxLabel: string;
  total: number;
}) =>
  render(`Receipt for ${o.reference}`, {
    preheader: `${money(o.total)} — thank you.`,
    heading: 'Your receipt',
    paragraphs: [
      `Thanks ${o.clientName}. Here is the breakdown for your booking. Keep this for your records.`,
    ],
    facts: [
      ['Service', o.serviceName],
      ['When', when(o.scheduledFor)],
      ['Reference', o.reference],
      ['Subtotal', money(o.subtotal)],
      ...(o.extrasTotal
        ? ([['Extras', money(o.extrasTotal)]] as Fact[])
        : []),
      // The tax line is itemised because Canadian clients claiming a business
      // expense need the GST/HST shown separately, not folded into a total.
      [o.taxLabel || 'Tax', money(o.taxAmount)],
      ['Total paid', money(o.total)],
    ],
    cta: { label: 'View bookings', url: `${o.appUrl}/client` },
  });

export const refundIssued = (o: {
  appUrl: string;
  name: string;
  reference: string;
  amount: number;
  reason?: string;
}) =>
  render(`Refund issued — ${o.reference}`, {
    preheader: `${money(o.amount)} is on its way back to you.`,
    heading: 'Refund on its way',
    paragraphs: [
      `Hi ${o.name}, we have refunded ${money(o.amount)} for booking ${o.reference}.`,
      ...(o.reason ? [`Reason: ${o.reason}`] : []),
      'Refunds return to your original payment method and usually settle within 5 to 10 business days, depending on your bank.',
    ],
    facts: [
      ['Reference', o.reference],
      ['Refund amount', money(o.amount)],
    ],
    cta: { label: 'View bookings', url: `${o.appUrl}/client` },
  });

export const payoutSent = (o: {
  appUrl: string;
  providerName: string;
  amount: number;
  jobCount?: number;
}) =>
  render(`Payout sent — ${money(o.amount)}`, {
    preheader: `${money(o.amount)} is on its way to your bank.`,
    heading: `Payout on its way, ${o.providerName}`,
    paragraphs: [
      `We have sent ${money(o.amount)} to your connected bank account${
        o.jobCount ? ` for ${o.jobCount} completed job${o.jobCount === 1 ? '' : 's'}` : ''
      }.`,
      'Most payouts arrive within 2 to 3 business days.',
    ],
    facts: [
      ['Amount', money(o.amount)],
      ...(o.jobCount ? ([['Jobs', String(o.jobCount)]] as Fact[]) : []),
    ],
    cta: { label: 'View earnings', url: `${o.appUrl}/wallet` },
  });

export const stripeOnboardingReminder = (o: {
  appUrl: string;
  providerName: string;
  pendingAmount?: number;
}) =>
  render('Add your bank details to get paid', {
    preheader: 'Your earnings are waiting on payout setup.',
    heading: `One step left, ${o.providerName}`,
    paragraphs: [
      o.pendingAmount
        ? `You have ${money(o.pendingAmount)} in completed work waiting, but we cannot pay it out until your bank details are connected.`
        : 'You cannot be paid until your bank details are connected. It takes a few minutes.',
      'We use Stripe to handle payouts, so your banking information never touches Zenex servers.',
    ],
    cta: { label: 'Connect bank account', url: `${o.appUrl}/wallet` },
  });

export const subscriptionStarted = (o: {
  appUrl: string;
  name: string;
  planName: string;
  frequency: string;
  price: number;
}) =>
  render(`Your ${o.planName} plan is active`, {
    preheader: `${o.frequency} cleans, ${money(o.price)} per month.`,
    heading: `${o.planName} plan active`,
    paragraphs: [
      `Hi ${o.name}, your subscription is live. You will be billed ${money(o.price)} per month and can cancel any time from your dashboard.`,
    ],
    facts: [
      ['Plan', o.planName],
      ['Frequency', o.frequency],
      ['Price', `${money(o.price)} / month`],
    ],
    cta: { label: 'Manage subscription', url: `${o.appUrl}/client` },
  });

// ─────────────── trust & verification ───────────────

export const kycApproved = (o: { appUrl: string; providerName: string }) =>
  render("You're verified on Zenex", {
    preheader: 'Your verified badge is live.',
    heading: `You're verified, ${o.providerName}`,
    paragraphs: [
      'Your documents checked out. Your profile now carries the verified badge, and you will appear ahead of unverified cleaners in search and instant matching.',
      'Keep your insurance current — we check expiry dates automatically, and the badge is removed if cover lapses.',
    ],
    cta: { label: 'View your profile', url: `${o.appUrl}/provider` },
  });

export const kycRejected = (o: {
  appUrl: string;
  providerName: string;
  reason?: string;
}) =>
  render('We need another look at your documents', {
    preheader: 'Something needs correcting before we can verify you.',
    heading: 'We could not verify your documents',
    paragraphs: [
      `Hi ${o.providerName}, we were not able to approve your verification this time.`,
      ...(o.reason ? [`What needs fixing: ${o.reason}`] : []),
      'This is usually something small — a blurry photo, a cropped edge, or an expiry date we could not read. You can upload replacements straight away and we will look again.',
    ],
    cta: { label: 'Upload new documents', url: `${o.appUrl}/provider` },
  });

export const insuranceExpiring = (o: {
  appUrl: string;
  providerName: string;
  expiresOn: Date;
  daysLeft: number;
}) =>
  render(
    o.daysLeft > 0
      ? `Your insurance expires in ${o.daysLeft} day${o.daysLeft === 1 ? '' : 's'}`
      : 'Your insurance has expired',
    {
      preheader: 'Upload renewed cover to keep your verified badge.',
      heading:
        o.daysLeft > 0
          ? 'Your insurance is about to expire'
          : 'Your verified badge has been removed',
      paragraphs:
        o.daysLeft > 0
          ? [
              `Hi ${o.providerName}, the insurance on file expires on ${when(o.expiresOn)}.`,
              'When it lapses we remove the verified badge automatically, which means fewer bookings. Upload the renewed certificate before then and nothing changes.',
            ]
          : [
              `Hi ${o.providerName}, the insurance on file expired on ${when(o.expiresOn)}, so your verified badge has been removed for now.`,
              'Upload a current certificate and we will restore it as soon as it is reviewed.',
            ],
      facts: [['Expiry date', when(o.expiresOn)]],
      cta: { label: 'Upload insurance', url: `${o.appUrl}/provider` },
    },
  );

// ─────────────── messaging & disputes ───────────────

export const newMessage = (o: {
  appUrl: string;
  name: string;
  senderName: string;
  preview: string;
}) =>
  render(`New message from ${o.senderName}`, {
    preheader: o.preview.slice(0, 90),
    heading: `${o.senderName} sent you a message`,
    paragraphs: [`"${o.preview}"`],
    cta: { label: 'Reply', url: `${o.appUrl}/messages` },
    footnote:
      'You are getting this because you have an active conversation on Zenex.',
  });

export const disputeOpened = (o: {
  appUrl: string;
  name: string;
  reference: string;
  reason: string;
}) =>
  render(`We're looking into booking ${o.reference}`, {
    preheader: 'Our team has picked this up.',
    heading: 'Your issue has been logged',
    paragraphs: [
      `Hi ${o.name}, thanks for flagging a problem with booking ${o.reference}. Our team has it and will come back to you, normally within two business days.`,
      'Any payout on this booking is held until it is settled.',
    ],
    facts: [
      ['Reference', o.reference],
      ['Issue', o.reason],
    ],
    cta: { label: 'View booking', url: `${o.appUrl}/client` },
  });

export const disputeResolved = (o: {
  appUrl: string;
  name: string;
  reference: string;
  outcome: string;
  refundAmount?: number;
}) =>
  render(`Resolved — booking ${o.reference}`, {
    preheader: 'Here is the outcome.',
    heading: 'Your issue has been resolved',
    paragraphs: [
      `Hi ${o.name}, we have finished reviewing booking ${o.reference}.`,
      `Outcome: ${o.outcome}`,
      ...(o.refundAmount
        ? [
            `A refund of ${money(o.refundAmount)} has been issued and should reach you within 5 to 10 business days.`,
          ]
        : []),
    ],
    facts: [
      ['Reference', o.reference],
      ...(o.refundAmount
        ? ([['Refund', money(o.refundAmount)]] as Fact[])
        : []),
    ],
    cta: { label: 'View booking', url: `${o.appUrl}/client` },
  });
