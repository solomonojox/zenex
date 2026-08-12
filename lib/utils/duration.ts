export const DEFAULT_DURATION_MINS = 120;

/** Shortest and longest job we'll accept from a free-text label. */
export const MIN_DURATION_MINS = 15;
export const MAX_DURATION_MINS = 12 * 60;

/**
 * Job length in minutes from a provider's free-text duration label.
 *
 * Providers type these by hand, so both units and ranges appear:
 *   "2–3 hrs"  → 120   (uses the lower bound)
 *   "90 mins"  → 90
 *   "1.5 hours"→ 90
 *   ""         → 120
 *
 * Assuming hours unconditionally would turn "90 mins" into a 90-hour job,
 * which fits in no working day and silently leaves the client with no
 * bookable slots. Anything implausible falls back to the default.
 */
export function durationFromLabel(label?: string | null): number {
  if (!label) return DEFAULT_DURATION_MINS;

  const match = label.match(/(\d+(?:\.\d+)?)/);
  if (!match) return DEFAULT_DURATION_MINS;

  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_DURATION_MINS;

  const isMinutes = /\bmin/i.test(label);
  const mins = Math.round(isMinutes ? value : value * 60);

  if (mins < MIN_DURATION_MINS || mins > MAX_DURATION_MINS) {
    return DEFAULT_DURATION_MINS;
  }
  return mins;
}
