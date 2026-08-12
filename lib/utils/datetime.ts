/**
 * Booking times are anchored to UTC by the API's availability engine — a slot
 * labelled "8:00 AM" is stored as 08:00Z. Formatting those instants in the
 * browser's local zone would shift the displayed time (e.g. 4:00 AM in
 * Toronto), so every booking time is rendered with timeZone: "UTC" to stay
 * consistent with the label the user actually picked.
 *
 * NOTE: this treats each provider's working hours as wall-clock time. Proper
 * per-provider IANA timezones are a future enhancement.
 */
const UTC = "UTC" as const;

/**
 * Parse an ISO string, returning null when it isn't a usable date.
 *
 * `new Date("nonsense")` does NOT throw — it produces an Invalid Date whose
 * toLocale* methods return the literal string "Invalid Date". Without this
 * guard that text would render straight into the UI.
 */
function parse(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function format(iso: string, options: Intl.DateTimeFormatOptions): string {
  const d = parse(iso);
  if (!d) return "";
  try {
    return d.toLocaleString(undefined, { ...options, timeZone: UTC });
  } catch {
    return "";
  }
}

export function formatBookingDate(iso: string): string {
  return format(iso, { weekday: "short", month: "short", day: "numeric" });
}

export function formatBookingTime(iso: string): string {
  return format(iso, { hour: "numeric", minute: "2-digit" });
}

export function formatBookingDateTime(iso: string): string {
  return format(iso, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Short form used in lists: "Aug 5, 9:00 AM". */
export function formatBookingShort(iso: string): string {
  return format(iso, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Convert a <input type="datetime-local"> value ("2026-08-05T09:00") into an
 * ISO instant, interpreting it as UTC so it lines up with slot anchoring.
 */
export function localInputToUtcIso(value: string): string {
  return `${value}${value.length === 16 ? ":00" : ""}.000Z`;
}
