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

export function formatBookingDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: UTC,
    });
  } catch {
    return "";
  }
}

export function formatBookingTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: UTC,
    });
  } catch {
    return "";
  }
}

export function formatBookingDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: UTC,
    });
  } catch {
    return "";
  }
}

/** Short form used in lists: "Aug 5, 9:00 AM". */
export function formatBookingShort(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: UTC,
    });
  } catch {
    return "";
  }
}

/**
 * Convert a <input type="datetime-local"> value ("2026-08-05T09:00") into an
 * ISO instant, interpreting it as UTC so it lines up with slot anchoring.
 */
export function localInputToUtcIso(value: string): string {
  return `${value}${value.length === 16 ? ":00" : ""}.000Z`;
}
