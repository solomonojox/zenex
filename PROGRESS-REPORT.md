# Zenex — Development Progress Report

**Prepared for:** Client review
**Date:** 11 August 2026

---

## Summary in one paragraph

Zenex started as a design prototype — screens that looked right but weren't
connected to anything. Every price, cleaner and booking on screen was fake.
Today it became a working product: a real system where customers can search
genuine cleaners, book a specific time, pay with tax correctly calculated, message
their cleaner live, and leave a review — while cleaners manage their schedule,
earnings and verification, and administrators oversee the whole marketplace.

---

## 1. We built the engine behind the app

Previously the app had **no backend** — no database, no accounts, no way to save
anything. Everything reset when you refreshed the page.

We built a complete backend system and connected a real database (hosted on
Supabase, in Canada). The app now permanently stores customers, cleaners,
bookings, payments, messages, reviews and documents.

**What this means:** Zenex is now a real application rather than a demonstration.

---

## 2. Accounts and security

- Customers, cleaners and administrators can register and sign in, each seeing
  a different version of the app appropriate to their role.
- Passwords are stored using strong encryption — even we cannot read them.
- **Forgot password** works: users receive a secure reset link that expires
  after one hour and can only be used once.
- **Stay signed in:** sessions renew quietly in the background, so users aren't
  kicked out mid-task.
- **Protection against attack:** sign-in attempts are limited to 5 per minute,
  which blocks automated password-guessing.
- Signing out properly ends the session everywhere, not just on that device.

---

## 3. Finding and booking a cleaner

- The homepage and search page now show **real cleaners** from the database,
  filterable by location, rating, price and service type.
- Each cleaner has a real profile: their services, prices, languages,
  experience, working hours and genuine customer reviews.
- Customers can save favourite cleaners with the heart button.

### The booking process

A customer picks a service, chooses a **real available time slot**, adds extras
(inside fridge, oven, laundry), enters the **service address**, and pays.

Two important improvements here:

- **Real availability.** Cleaners set their working hours, and customers only
  see times that cleaner is genuinely free. Previously the calendar was
  decorative.
- **No double-booking.** The system now refuses two bookings for the same
  cleaner at the same time. This was a serious risk before — two customers
  could have booked the same hour.
- **The address is collected.** Previously nothing asked where the job was, so
  a cleaner would have had no idea where to go. Customers can also add access
  notes (buzzer code, parking, pets).

---

## 4. Money, tax and payments

- **Canadian sales tax is calculated correctly** based on the province where
  the work happens — 13% HST in Ontario, 15% in the Maritimes, 5% GST in
  Alberta and BC, and the combined GST+QST rate in Quebec.
- Customers see a clear breakdown before paying: service, extras, tax, total.
- Zenex takes a **platform commission** on each booking. Importantly, the
  commission is calculated on the pre-tax amount — sales tax is set aside for
  remittance to the government, not treated as revenue.
- Cleaners have an **earnings wallet** showing their balance, transaction
  history and payouts.

### Cancellations and refunds

A fair, automatic policy is now enforced:

- Cancel **24 hours or more** in advance → **full refund**
- Cancel **within 24 hours** → **50% refund** (the rest compensates the cleaner
  for the reserved time)

Refunds happen automatically — the customer is credited, the cleaner's earnings
are adjusted, and both are notified.

### Card payments

The system is fully wired for **Stripe**, the payment processor used by most
online businesses, including the setup that lets cleaners receive payouts to
their own bank accounts.

**Currently running in demo mode** — the entire flow works and is testable, but
no real money moves. Adding live payment keys switches it on with no further
development work.

---

## 5. Trust and safety

This is what customers judge a cleaning marketplace on, so we invested here.

- **Cleaner verification:** cleaners upload government ID, insurance
  certificates, background checks and business registration. Files are stored
  securely and only ever viewed through short-lived private links.
- **Administrator review:** staff review each submission and approve or reject
  it. Approved cleaners get a visible "Verified" badge.
- **Insurance expiry is tracked and enforced.** Cleaners record when their
  insurance expires; warnings appear 30 days out, and if it lapses the system
  **automatically removes their verified badge** until valid cover is supplied.
  Previously this was cosmetic — an uninsured cleaner could have kept working.
- **Optional at signup:** new cleaners can upload documents during
  registration, or choose "Skip for now" and complete it later from their
  dashboard. This avoids losing early cleaners to a long signup, while a
  reminder keeps it visible until done.

---

## 6. Communication

- **Live messaging** between customers and cleaners — messages appear instantly
  without refreshing the page.
- **In-app notifications** with an unread counter, triggered by real events:
  booking made, booking confirmed, job started, job completed, cancellation,
  payment received, new message, new review, verification approved.
- **Email notifications:** booking confirmations, cancellation notices,
  password resets, and an automatic **reminder 24 hours before every job** —
  which is proven to reduce no-shows.

---

## 7. The three dashboards

**Customer:** upcoming booking, spending stats, booking history with cancel and
review options, favourite cleaners, subscription plans, wallet and receipts.

**Cleaner:** earnings and performance figures, job list with a working
progression (Accept → Start → Complete), a schedule editor for weekly hours and
time off, document verification, editable profile and pricing, and payout
management.

**Administrator:** business overview (users, bookings, revenue, open issues),
user management with suspend/restore, the verification review queue, and
dispute handling.

---

## 8. Subscriptions

Recurring cleaning plans (Starter, Regular, Premium) are live — customers can
subscribe from the homepage, see their active plan with its renewal date, and
cancel at any time.

---

## 9. Quality, legal and launch readiness

- **Automated tests** covering the highest-risk calculations — tax and
  scheduling. 28 tests, all passing. These catch mistakes before customers do.
- **Error monitoring** ready to alert the team the moment something breaks in
  production, with passwords and personal data stripped out before sending.
- **Friendly error pages** instead of blank screens when something goes wrong.
- **Legal pages drafted** — Privacy Policy, Terms of Service and Cookie Policy,
  written to accurately describe how Zenex actually handles data and money.
- **Deployment prepared** — configuration and a step-by-step guide for putting
  Zenex online, plus a system health check so the hosting platform can detect
  outages automatically.

---

## Where things stand

**Ready now:** the complete customer journey (search → book → pay → message →
review), the complete cleaner journey (sign up → get verified → set availability
→ accept jobs → get paid), and full administrative oversight. The app is tested,
documented and prepared for launch.

### Before accepting real customers

These are business steps rather than development work:

1. **Legal review.** The policy pages are accurate drafts but must be reviewed
   by a Canadian lawyer — Zenex stores government ID documents, so privacy
   obligations are real.
2. **Accountant sign-off** on sales-tax registration and rates.
3. **Activate live payments** by connecting a Stripe account.
4. **Recruit cleaners.** A marketplace needs supply before demand — this is now
   the main commercial task, not a technical one.

### Recommended next development

- Let cleaners add and edit their own services and prices (currently
  administrator-managed).
- Email address confirmation at signup.
- Instant pricing from home size (bedrooms/bathrooms) with automatic cleaner
  matching — this is how the leading Canadian competitors convert customers,
  and would be Zenex's strongest competitive move.
- Background-check integration with a screening provider.
- A mobile app.

---

*Prepared by the Zenex development team.*
