# Deploying Zenex

Two services plus a database:

| Piece | Host | Notes |
| ----- | ---- | ----- |
| Frontend (Next.js) | **Vercel** | Root of this repo |
| API (NestJS) | **Render** | `zenex-api/` subfolder |
| Database + file storage | **Supabase** | Already provisioned |

Deploy the **API first** — the frontend needs its URL.

---

## 1. Supabase (already set up)

Confirm two things in the dashboard:

- **Storage → buckets**: a **private** bucket named `zenex-uploads` exists (KYC documents).
- **Connect → ORMs**: you have both the pooled connection string (port **6543**) and the direct one (port **5432**).

---

## 2. API on Render

1. Push this repo to GitHub (see the branch you're working on).
2. Render → **New → Blueprint** → pick the repo. It reads `zenex-api/render.yaml`.
3. Fill in the env vars Render marks as required:

| Variable | Value |
| -------- | ----- |
| `DATABASE_URL` | Supabase **pooled** string (`:6543`, ends `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **direct** string (`:5432`) |
| `CORS_ORIGINS` | Your Vercel URL, e.g. `https://zenex.vercel.app` |
| `APP_URL` | Same Vercel URL (used in email links + Stripe redirects) |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | From Supabase → Settings → API |
| `RESEND_API_KEY` / `MAIL_FROM` | Optional — blank means emails are logged, not sent |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Optional — blank keeps demo payments |

`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are generated automatically by Render.

4. Deploy. The start command runs `prisma migrate deploy` before booting, so the
   schema is applied automatically.
5. Verify: `https://<your-api>.onrender.com/api/health` should return
   `{"status":"ok","database":"up",...}`.

> **Free tier caveat:** Render's free instances sleep after inactivity, so the
> first request can take ~30s and the hourly reminder cron won't fire reliably.
> Use the Starter plan if reminders matter.

---

## 3. Frontend on Vercel

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** leave as the repo root (not `zenex-api`).
3. Environment variables:

| Variable | Value |
| -------- | ----- |
| `NEXT_PUBLIC_API_URL` | `https://<your-api>.onrender.com/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional (`pk_test_…`) |

4. Deploy, then go back to Render and make sure `CORS_ORIGINS` and `APP_URL`
   contain the real Vercel domain. Redeploy the API after changing them.

---

## 4. Seed the production database (optional)

Only if you want the demo providers and subscription plans:

```bash
cd zenex-api
# point .env at the production DB, then:
npm run prisma:seed
```

Skip this for a real launch — create genuine providers instead. The demo
accounts all use the password `password123` and must never exist in production.

---

## 5. Going live with payments

1. Create a Stripe account and enable **Connect**.
2. Add `STRIPE_SECRET_KEY` to Render and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to Vercel.
3. Add a webhook endpoint in Stripe pointing at
   `https://<your-api>.onrender.com/api/payments/webhook`, subscribe to
   `payment_intent.succeeded`, and put the signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Providers then connect payout accounts from **Wallet → Payout account**.

No code changes are needed — `StripeService.enabled` switches the app out of
demo mode as soon as a real key is present.

---

## Pre-launch checklist

- [ ] Legal pages reviewed by a Canadian lawyer (`/privacy`, `/terms`, `/cookies` are drafts)
- [ ] GST/HST registration and rates confirmed with an accountant
- [ ] Demo seed accounts removed from production
- [ ] `zenex-uploads` bucket is **private**
- [ ] Real Stripe keys + webhook configured and tested
- [ ] Error tracking (e.g. Sentry) added
- [ ] A real domain pointed at Vercel, with `APP_URL`/`CORS_ORIGINS` updated to match
