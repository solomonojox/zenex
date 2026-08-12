# Zenex — Development Progress Report

**Date:** 12 August 2026
**Status:** Deployed · full customer and cleaner journeys working end to end

---

## Summary

Zenex began as a design prototype — screens that looked finished but were
connected to nothing. Every cleaner, price and booking was fake, and everything
reset on page refresh.

It is now a working, deployed product. Customers get an exact price from their
home size, book a real time slot, pay with Canadian sales tax calculated
correctly, message their cleaner live, and leave a review. Cleaners manage their
own services, prices, working hours, verification documents and earnings.
Administrators oversee users, verifications and disputes.

---

## What was delivered

### 1. The engine (from nothing)

A complete backend and a real database hosted in Canada. Customers, cleaners,
bookings, payments, messages, reviews and documents are now stored permanently.

### 2. Accounts and security

- Registration and sign-in for customers, cleaners and administrators, each
  seeing a different version of the app.
- Passwords stored using strong encryption — unreadable even to us.
- **Forgot password** with a secure link that expires in one hour and works once.
- **Stay signed in** — sessions renew quietly in the background instead of
  logging people out mid-task.
- **Attack protection** — sign-in attempts limited to 5 per minute.
- Signing out ends the session on the server, not just the device.

### 3. Two ways to book

**Instant booking (new — the primary path).** The customer enters bedrooms and
bathrooms, immediately sees three exact prices including tax, picks a time from
the combined availability of every cleaner, and the system automatically assigns
the best-rated verified cleaner who is genuinely free. No browsing required.
This matches how the leading Canadian competitors convert customers.

**Browse and choose.** Search real cleaners by location, rating and price, view
full profiles with services, reviews and published working hours, save
favourites, and book a specific person.

Both paths share the same protections:

- **Real availability** — only times the cleaner is genuinely free are offered.
- **No double-booking** — the system refuses two bookings for the same cleaner
  at the same time.
- **Address collected** — with access notes for buzzer codes, parking and pets.

### 4. Money and tax

- **Canadian sales tax calculated by province** — 13% HST in Ontario, 15% in
  the Maritimes, 5% GST in Alberta and BC, GST+QST in Quebec.
- Clear breakdown before paying: service, extras, tax, total.
- Platform commission taken on the **pre-tax** amount — sales tax is set aside
  for remittance, not treated as revenue.
- Cleaners have an earnings wallet with transaction history and payouts.
- **Cancellation policy enforced automatically:** 24+ hours ahead is a full
  refund; inside 24 hours is 50%. Refunds credit the customer, adjust the
  cleaner's earnings, and notify both.
- **Stripe fully integrated**, including the setup that lets cleaners receive
  payouts to their own bank accounts. Currently in demo mode — adding live keys
  switches it on with no further development.

### 5. Trust and safety

- Cleaners upload government ID, insurance, background checks and business
  registration; files are stored privately and viewed only through short-lived
  links.
- Administrators approve or reject each submission; approved cleaners get a
  **Verified** badge.
- **Insurance expiry is enforced** — warnings 30 days out, and the badge is
  removed automatically if cover lapses.
- Verification is **optional at signup** ("Skip for now") so early cleaners
  aren't lost to a long form, with a dashboard reminder until it's done.

### 6. Communication

- **Live messaging** between customers and cleaners.
- **In-app notifications** with unread counts, driven by real events: booking
  made, confirmed, started, completed, cancelled, paid, new message, new
  review, verification decided.
- **Emails** for booking confirmations, cancellations, password resets, and an
  automatic **reminder 24 hours before every job**.

### 7. Three dashboards

**Customer** — next booking, spending stats, booking history with cancel and
review, favourites, subscription plans, wallet and receipts.

**Cleaner** — earnings and performance, job list with Accept → Start → Complete,
**services and pricing they control themselves**, weekly schedule and time off,
document verification, profile, and payouts.

**Administrator** — business overview, user management with suspend/restore,
verification queue, and dispute handling.

### 8. Subscriptions

Recurring plans (Starter, Regular, Premium) — subscribe from the homepage, see
the renewal date, cancel any time.

### 9. Quality and reliability

- **44 automated tests** across both halves of the system, covering the
  highest-risk logic: tax calculation, scheduling and conflict detection,
  duration parsing and time formatting.
- **Error monitoring** ready to alert the team when something breaks in
  production, with passwords and personal data stripped before sending.
- **Friendly error and 404 pages** instead of blank screens.
- **Health check** so the hosting platform detects and recovers from outages.
- **Legal pages drafted** — Privacy, Terms and Cookies, written to describe how
  Zenex actually handles data and money.
- **Deployed** with configuration and a step-by-step guide.

---

## Problems found and fixed

Several issues were caught that would have affected real users:

| Issue | Consequence if shipped |
| ----- | ---------------------- |
| No availability system | Two customers could book the same cleaner for the same hour |
| Booking never asked for an address | The cleaner wouldn't know where to go |
| New cleaners had no working hours | Every date showed "no openings" — they'd assume the platform was broken |
| Cleaners with no services appeared in search | Customers hit dead-end profiles |
| Durations like "90 mins" read as 90 hours | No bookable slots, with no explanation |
| Times shown in the wrong timezone | Picking 8:00 AM displayed 4:00 AM on the confirmation |
| One customer's data cached for the next | A signed-in user briefly saw the previous user's dashboard |
| "Invalid Date" could render on screen | Visible broken text on a booking card |
| Sign-in had no rate limit | 100 password guesses per minute |
| Messaging accepted any website's connection | Cross-site access to a live chat channel |
| Cancelling a paid booking refunded nothing | Customers charged for cancelled work |
| Expired insurance kept the Verified badge | Uninsured cleaners still shown as verified |

---

## Where things stand

**Working now:** the complete customer journey (instant price → book → pay →
message → review → cancel with refund), the complete cleaner journey (sign up →
verify → set services and hours → accept jobs → get paid), and full
administrative oversight — all live.

### Before taking real customers

These are business steps, not development:

1. **Legal review** of the draft policy pages by a Canadian lawyer — Zenex
   stores government ID documents, so privacy obligations are real.
2. **Accountant sign-off** on sales-tax registration and rates.
3. **Activate live payments** by connecting a Stripe account.
4. **Recruit cleaners.** A marketplace needs supply before demand. This is now
   the main commercial task — the product side is ready.
5. **Tune the instant pricing** (base price and per-room amounts) to real
   market rates.

### Recommended next development

- Email address confirmation at signup.
- Background-check integration with a screening provider.
- Per-city timezones (currently one consistent time standard).
- Customer-raised disputes (today only administrators can open one).
- A mobile app.

---

*Prepared by the Zenex development team.*
