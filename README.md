# Zenex

This is the Zenex prototype, restructured from a single-file Figma/AI
export into a proper Next.js (App Router) project with real routes and
separated components.

## Getting started

```bash
npm install
npm run dev
```

## Structure

- `app/` — one folder per route (App Router). Each `page.tsx` is intentionally
  thin: it wires together components from `components/<area>/`.
- `components/ui/` — shared primitives (`Card`, `Stars`, `StatusPill`, `VBadge`,
  `ProviderCard`).
- `components/nav/` — `Nav` (top bar) and `DemoBar` (a bottom quick-nav for
  jumping between screens while developing — safe to delete once you have
  real navigation flows everywhere).
- `components/<area>/` — one folder per route/domain (`landing`, `auth`,
  `search`, `profile`, `booking`, `client`, `provider`, `messages`, `wallet`,
  `admin`), holding that route's page-specific pieces.
- `lib/data.ts` — all mock data, now with real TypeScript types (`lib/types.ts`).
  Swap these for real API calls whenever you're ready — every component
  already receives its data as props or imports from this one place.

## Notable adaptations from the single-file export

The original file hard-coded almost every "detail" screen to `PROVIDERS[0]`
(Maria Santos), since it only ever simulated one click-path. Restoring real
routes required generalizing a few flows — worth knowing about before you
build on top of them:

- **Provider profile** is now `/providers/[id]`, looked up via
  `getProviderById`. Visiting an id that doesn't exist 404s.
- **Booking** is `/booking/[providerId]`, and can take a `?service=<index>`
  query param (the profile page's "Book Now" button passes the service the
  user had selected). The 5-step wizard (Service → Date & Time → Extras →
  Payment → Confirmed) is still in-component state, not sub-routes — that's a
  deliberate choice (see below), not an oversight.
- **Messages** is one route (`/messages?thread=<id>`) rather than a route per
  thread, so the thread list + active conversation can share state the way a
  real inbox does. `thread` ids correspond 1:1 with the first three
  `PROVIDERS` ids.
- **Subscription plan** buttons on the landing page link to
  `/search?plan=<name>` rather than straight to booking, since a plan isn't
  tied to a specific provider until the user picks one.
- **Auth** (`/auth`) uses `?mode=` and `?role=` query params for
  role-select/login/signup so each screen is a shareable URL, but the
  provider's 5-step onboarding wizard stays as internal `useState` — same
  reasoning as booking.

## Known issue carried over from the original export (left as-is per request)

Several components build Tailwind class names from a variable, e.g.
`` `bg-${c}-50` `` in `components/landing/ServiceCategories.tsx` and
`` `bg-${c}-50 text-${c}-600` `` in a few admin/client stat cards. Tailwind's
JIT compiler can't see these at build time (it only picks up class names it
can find as literal strings), so **those colors will not generate correctly
in a production build** unless you either:

1. Replace them with a static lookup object (e.g.
   `{ teal: "bg-teal-50 text-teal-600", blue: "bg-blue-50 text-blue-600" }`),
   or
2. Add every generated class to `tailwind.config.ts`'s `safelist`.

Locations to check: `components/landing/ServiceCategories.tsx`,
`components/client/StatsGrid.tsx`, `components/admin/OverviewTab.tsx`,
`components/provider/OverviewTab.tsx` (KPI up/down colors are static, but the
`c`-based backgrounds elsewhere are not).
