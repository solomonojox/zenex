/**
 * Coarse geography for provider matching.
 *
 * Provider and client locations are free-text strings ("Scarborough, Toronto,
 * ON"), and matching previously compared them with a substring test. That made
 * a cleaner in Mississauga invisible to a client in Toronto — twenty minutes
 * apart, zero overlap — while `maxRadiusKm` sat on the schema unused.
 *
 * This resolves the common Canadian city names to coordinates so real distance
 * can be measured. It is deliberately a lookup table, not a geocoding service:
 * no API key, no network call on the booking path, no per-request cost. The
 * trade-off is coverage — anything not listed resolves to null and the caller
 * falls back to the old substring behaviour, so an unknown town degrades to
 * what happens today rather than to nothing.
 *
 * When the roster outgrows this (thousands of providers, postal-code level
 * precision, "within 15 minutes' drive" rather than straight-line distance),
 * the replacement is PostGIS with a geography column and a GiST index, not a
 * longer table.
 */

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Keys are lowercase. Toronto's districts are listed separately from Toronto
 * itself because a cleaner who works Scarborough is not necessarily willing to
 * cross the city to Etobicoke, and the distance between them should say so.
 */
const CITIES: Record<string, Coords> = {
  // ── Greater Toronto Area ──
  toronto: { lat: 43.6532, lng: -79.3832 },
  'north york': { lat: 43.7615, lng: -79.4111 },
  scarborough: { lat: 43.7764, lng: -79.2318 },
  etobicoke: { lat: 43.6205, lng: -79.5132 },
  'east york': { lat: 43.6906, lng: -79.3279 },
  mississauga: { lat: 43.589, lng: -79.6441 },
  brampton: { lat: 43.7315, lng: -79.7624 },
  markham: { lat: 43.8561, lng: -79.337 },
  vaughan: { lat: 43.8361, lng: -79.4983 },
  'richmond hill': { lat: 43.8828, lng: -79.4403 },
  oakville: { lat: 43.4675, lng: -79.6877 },
  burlington: { lat: 43.3255, lng: -79.799 },
  milton: { lat: 43.5183, lng: -79.8774 },
  ajax: { lat: 43.8509, lng: -79.0204 },
  pickering: { lat: 43.8384, lng: -79.0868 },
  whitby: { lat: 43.8975, lng: -78.9429 },
  oshawa: { lat: 43.8971, lng: -78.8658 },
  newmarket: { lat: 44.0592, lng: -79.4613 },
  aurora: { lat: 44.0065, lng: -79.4504 },

  // ── Rest of Ontario ──
  hamilton: { lat: 43.2557, lng: -79.8711 },
  ottawa: { lat: 45.4215, lng: -75.6972 },
  kitchener: { lat: 43.4516, lng: -80.4925 },
  waterloo: { lat: 43.4643, lng: -80.5204 },
  cambridge: { lat: 43.3616, lng: -80.3144 },
  guelph: { lat: 43.5448, lng: -80.2482 },
  london: { lat: 42.9849, lng: -81.2453 },
  windsor: { lat: 42.3149, lng: -83.0364 },
  barrie: { lat: 44.3894, lng: -79.6903 },
  kingston: { lat: 44.2312, lng: -76.486 },
  'st catharines': { lat: 43.1594, lng: -79.2469 },
  'niagara falls': { lat: 43.0896, lng: -79.0849 },
  sudbury: { lat: 46.4917, lng: -80.993 },
  'thunder bay': { lat: 48.3809, lng: -89.2477 },

  // ── Quebec ──
  montreal: { lat: 45.5019, lng: -73.5674 },
  laval: { lat: 45.6066, lng: -73.7124 },
  longueuil: { lat: 45.5312, lng: -73.5185 },
  gatineau: { lat: 45.4765, lng: -75.7013 },
  'quebec city': { lat: 46.8139, lng: -71.208 },
  sherbrooke: { lat: 45.4042, lng: -71.8929 },

  // ── British Columbia ──
  vancouver: { lat: 49.2827, lng: -123.1207 },
  burnaby: { lat: 49.2488, lng: -122.9805 },
  surrey: { lat: 49.1913, lng: -122.849 },
  richmond: { lat: 49.1666, lng: -123.1336 },
  coquitlam: { lat: 49.2838, lng: -122.7932 },
  langley: { lat: 49.1044, lng: -122.6603 },
  victoria: { lat: 48.4284, lng: -123.3656 },
  kelowna: { lat: 49.888, lng: -119.496 },

  // ── Prairies ──
  calgary: { lat: 51.0447, lng: -114.0719 },
  edmonton: { lat: 53.5461, lng: -113.4938 },
  'red deer': { lat: 52.2681, lng: -113.8112 },
  lethbridge: { lat: 49.6935, lng: -112.8418 },
  winnipeg: { lat: 49.8951, lng: -97.1384 },
  regina: { lat: 50.4452, lng: -104.6189 },
  saskatoon: { lat: 52.1332, lng: -106.6700 },

  // ── Atlantic ──
  halifax: { lat: 44.6488, lng: -63.5752 },
  dartmouth: { lat: 44.6714, lng: -63.5772 },
  moncton: { lat: 46.0878, lng: -64.7782 },
  'saint john': { lat: 45.2733, lng: -66.0633 },
  fredericton: { lat: 45.9636, lng: -66.6431 },
  "st john's": { lat: 47.5615, lng: -52.7126 },
  charlottetown: { lat: 46.2382, lng: -63.1311 },
};

/**
 * Longest names first, so "richmond hill" is tested before "richmond" and
 * "north york" before "york". Without this, an Ontario provider in Richmond
 * Hill would resolve to Richmond, British Columbia — 3,400km out.
 */
const CITY_NAMES = Object.keys(CITIES).sort((a, b) => b.length - a.length);

/** Resolve a free-text location to coordinates, or null if unrecognised. */
export function resolveCity(location?: string | null): Coords | null {
  if (!location) return null;
  const haystack = location.toLowerCase();
  for (const name of CITY_NAMES) {
    if (haystack.includes(name)) return CITIES[name];
  }
  return null;
}

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function distanceKm(a: Coords, b: Coords): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Is `providerLocation` close enough to `clientLocation` to serve it?
 *
 * Returns null — meaning "cannot tell" — when either side is unrecognised, so
 * callers can fall back rather than silently excluding a provider on the basis
 * of a spelling this table happens not to know.
 */
export function isWithinRadius(
  providerLocation: string | null | undefined,
  clientLocation: string | null | undefined,
  radiusKm: number,
): boolean | null {
  const from = resolveCity(providerLocation);
  const to = resolveCity(clientLocation);
  if (!from || !to) return null;
  return distanceKm(from, to) <= radiusKm;
}
