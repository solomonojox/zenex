/**
 * Works out which tenant the browser is talking to.
 *
 * The old rule was "first DNS label is the tenant", which is right for
 * `acme.zenex.ca` and catastrophically wrong everywhere else. On Vercel the
 * hostname is `zenex-app.vercel.app`, so it sent `x-Tenant: zenex-app` — a
 * tenant that does not exist. The API scopes every query by tenant, so the
 * whole site returned empty lists with no error: zero cleaners, zero bookings,
 * zero everything. It worked locally only because `localhost` has no dot.
 *
 * So: an explicit NEXT_PUBLIC_TENANT always wins, platform and preview hosts
 * are never treated as tenants, and returning null means "send no header" and
 * let the API fall back to its own default.
 */

/** Hosts where the first label is a deploy name, not a customer. */
const PLATFORM_SUFFIXES = [
  'vercel.app',
  'netlify.app',
  'onrender.com',
  'pages.dev',
  'github.io',
  'fly.dev',
  'railway.app',
];

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

export function resolveTenant(
  hostname?: string | null,
  configured?: string | null,
): string | null {
  // An explicit setting is always trusted — it is the only way to run a
  // single-tenant deployment on a platform domain.
  const explicit = configured?.trim();
  if (explicit) return explicit.toLowerCase();

  if (!hostname) return null;
  const host = hostname.trim().toLowerCase();
  if (!host) return null;

  // Local development and raw IPs carry no tenant information.
  if (host === 'localhost' || host.endsWith('.localhost')) return null;
  if (IPV4.test(host)) return null;

  // Preview and platform domains: the first label is the deployment.
  if (
    PLATFORM_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))
  ) {
    return null;
  }

  const parts = host.split('.');
  // Fewer than three labels means an apex domain like "zenex.ca" — the site
  // itself, not a tenant of it.
  if (parts.length < 3) return null;
  if (parts[0] === 'www') return null;

  return parts[0];
}
