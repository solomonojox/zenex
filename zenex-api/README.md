# Zenex API

Backend for the Zenex cleaning-services marketplace — **NestJS + Prisma + PostgreSQL**.

This service is designed to plug directly into the existing Next.js frontend
(`../`). It emits plain JWT claims that the frontend's `AuthProvider` reads, and
honors the `x-Tenant` header the frontend already sends.

## Tech stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Framework      | NestJS (TypeScript)                      |
| Database       | PostgreSQL                               |
| ORM            | Prisma                                   |
| Auth           | JWT (access + refresh) via Passport, argon2 hashing |
| Authorization  | Role guards (CLIENT / PROVIDER / ADMIN)  |
| Multi-tenancy  | `x-Tenant` header → tenant-scoped queries |
| Payments       | Stripe Connect (to be added)             |
| Real-time      | Socket.IO gateway (to be added)          |
| Validation     | class-validator + global ValidationPipe  |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env         # then edit DATABASE_URL + secrets

# 3. Create the database schema
npm run prisma:migrate       # or: npx prisma migrate dev --name init

# 4. (optional) Seed demo data ported from the frontend mock data
npm run prisma:seed

# 5. Run the API
npm run start:dev            # http://localhost:4000/api
```

You need a running PostgreSQL. Locally the fastest option is Docker:

```bash
docker run --name zenex-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=zenex -p 5432:5432 -d postgres:16
```

## Project structure

```
src/
├── main.ts                 # bootstrap: helmet, CORS, global pipes
├── app.module.ts           # root module + tenant middleware wiring
├── config/
│   └── configuration.ts    # typed env config
├── prisma/
│   ├── prisma.module.ts    # global Prisma provider
│   └── prisma.service.ts
├── common/                 # cross-cutting building blocks
│   ├── decorators/         # @Roles, @Public, @CurrentUser
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── interceptors/       # response envelope
│   ├── filters/            # global exception filter
│   ├── middleware/         # tenant resolver (x-Tenant header)
│   └── enums/              # Role
└── modules/                # one folder per domain
    ├── auth/               # register, login, refresh, logout (+ JWT strategy)
    ├── users/              # /users/me, admin lookups
    └── providers/          # search, detail, self-update

prisma/
├── schema.prisma           # full data model (all entities)
└── seed.ts                 # demo data ported from ../lib/data.ts
```

## Implemented endpoints

| Method | Path                       | Auth      | Purpose                       |
| ------ | -------------------------- | --------- | ----------------------------- |
| POST   | `/api/auth/register`       | public    | Create client or provider     |
| POST   | `/api/auth/login`          | public    | Login, returns tokens         |
| POST   | `/api/auth/refresh`        | public    | Rotate access token           |
| POST   | `/api/auth/logout`         | bearer    | Revoke refresh tokens         |
| GET    | `/api/users/me`            | bearer    | Current user + profile        |
| GET    | `/api/users/:id`           | admin     | Lookup a user                 |
| GET    | `/api/providers`           | public    | Search / filter / paginate    |
| GET    | `/api/providers/:id`       | public    | Provider detail + services    |
| PATCH  | `/api/providers/me/profile`| provider  | Update own profile            |
| POST   | `/api/bookings`            | client    | Create a booking (5-step flow)|
| GET    | `/api/bookings`            | bearer    | List my bookings (role-aware) |
| GET    | `/api/bookings/:id`        | bearer    | Booking detail                |
| PATCH  | `/api/bookings/:id/cancel` | bearer    | Cancel a booking              |
| PATCH  | `/api/bookings/:id/status` | prov/admin| Advance booking status        |
| POST   | `/api/reviews`             | client    | Review a completed booking     |
| GET    | `/api/reviews?providerId=` | public    | List a provider's reviews      |
| POST   | `/api/favorites`           | client    | Save a favorite provider       |
| GET    | `/api/favorites`           | client    | List my favorites             |
| DELETE | `/api/favorites/:providerId`| client   | Remove a favorite              |
| POST   | `/api/messages/threads`    | client/prov| Start or get a thread         |
| GET    | `/api/messages/threads`    | client/prov| List my threads (enriched)    |
| GET    | `/api/messages/threads/:id`| participant| Thread messages (marks read)  |
| POST   | `/api/messages/threads/:id/messages` | participant | Send a message      |
| POST   | `/api/verifications/documents` | provider | Upload a KYC doc (Supabase Storage) |
| POST   | `/api/verifications`       | provider  | Submit a verification request  |
| GET    | `/api/verifications/me`    | provider  | My verification status         |
| GET    | `/api/verifications`       | admin     | Review queue                   |
| PATCH  | `/api/verifications/:id/review` | admin | Approve/reject (sets `verified`)|
| GET    | `/api/subscription-plans`  | public    | List plans for the tenant      |
| POST   | `/api/subscription-plans`  | admin     | Create a plan                  |
| POST   | `/api/subscriptions`       | client    | Subscribe to a plan            |
| GET    | `/api/subscriptions/me`    | client    | My subscriptions               |
| PATCH  | `/api/subscriptions/:id/cancel` | client | Cancel a subscription         |
| POST   | `/api/payments/bookings/:bookingId/checkout` | client | Pay for a booking     |
| POST   | `/api/payments/payouts`    | provider  | Withdraw available balance     |
| POST   | `/api/payments/webhook`    | Stripe    | Payment webhook (live mode)    |
| GET    | `/api/wallet`              | bearer    | My wallet + balance            |
| GET    | `/api/wallet/transactions` | bearer    | My transactions                |
| GET    | `/api/wallet/payouts`      | provider  | My payouts                     |
| GET    | `/api/admin/overview`      | admin     | Dashboard aggregates           |
| GET    | `/api/admin/users`         | admin     | List/filter users              |
| PATCH  | `/api/admin/users/:id/status` | admin  | Activate/suspend a user        |
| GET    | `/api/admin/disputes`      | admin     | List disputes                  |
| POST   | `/api/admin/disputes`      | admin     | Log a dispute                  |
| PATCH  | `/api/admin/disputes/:id/resolve` | admin | Resolve/escalate a dispute   |

Real-time: Socket.IO namespace **`/messages`** — connect with the JWT access
token in the handshake (`io('/messages', { auth: { token } })`), emit
`thread:join` `{ threadId }`, and listen for `message:new`.

## Sales tax (GST/HST)

Bookings are priced **subtotal + Canadian sales tax**, resolved from the
provider's province (`src/common/tax/canadian-tax.ts`): HST for ON/NS/NB/NL/PE,
GST elsewhere, GST+QST for QC. `POST /api/bookings/quote` returns a full
breakdown before booking. The platform fee and the provider's earning are
calculated on the **pre-tax subtotal** — tax is held for remittance, not split.

> ⚠ Rates are standard published defaults, not tax advice. Verify with an
> accountant; GST/HST registration is generally required past $30k revenue
> over four consecutive quarters.

## Payments (demo vs live)

Payments run in **DEMO mode** until real Stripe keys are set — a booking checkout
settles instantly, debiting the client's wallet and crediting the provider's
earning (net of the `STRIPE_PLATFORM_FEE_PERCENT` fee), and payouts are
simulated. Everything is persisted as real `Transaction`/`Payout` rows.

To go **LIVE**, set `STRIPE_SECRET_KEY` (and `STRIPE_WEBHOOK_SECRET`) in `.env`,
plus `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in the frontend's `.env.local`.
The same endpoints then create real Stripe PaymentIntents (collected via Stripe
Elements in the booking flow) and Connect transfers, with settlement finalized
by the `/api/payments/webhook` handler. `StripeService.enabled` decides which
path runs — no code changes needed.

**Provider payouts** use Stripe Connect Express:

| Method | Path | Purpose |
| ------ | ---- | ------- |
| POST | `/api/payments/connect/onboarding` | Get a hosted Stripe onboarding URL |
| GET  | `/api/payments/connect/status` | Whether payouts are enabled yet |

Providers connect their account from **Wallet → Payout account**. In live mode a
payout is rejected until Connect onboarding is complete.

Local webhook testing:

```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
```

## Status

All core modules are built: **Auth, Users, Providers, Bookings, Reviews &
Favorites, Messaging, Verification/KYC, Subscriptions, Payments (Stripe/demo),
Wallet, Admin.**

Possible next steps: connect the Next.js frontend (swap `lib/data.ts` for real
API calls), add automated tests, add real Stripe keys to leave demo mode, wire
Notifications delivery, and deploy (Railway/Render + the Supabase DB).

## Connecting the frontend

In the frontend, set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` and replace
the mock imports from `lib/data.ts` with calls through the existing
`utils/tokenAxios.ts` instance. The components already receive data as props, so
this is a data-layer swap with no UI rewrites.

> Note: the frontend's `AuthProvider` currently decodes verbose .NET-style JWT
> claim URIs. This API issues plain claims (`sub`, `email`, `role`, `tenantId`),
> so simplify the claim-mapping in `context/auth/AuthProvider.tsx` accordingly
> (~15-line change).
