import {
  formatBookingDate,
  formatBookingTime,
  formatBookingDateTime,
  formatBookingShort,
  localInputToUtcIso,
} from "./datetime";

/**
 * Booking times are UTC-anchored: a slot labelled "9:00 AM" is stored as
 * 09:00Z. These helpers must therefore render in UTC — formatting in the
 * browser's local zone previously showed a Toronto user "4:00 AM" for the
 * 8:00 AM slot they had just picked.
 */
const NINE_AM_UTC = "2026-08-05T09:00:00.000Z";

describe("booking time formatting", () => {
  it("renders the time in UTC, not the local zone", () => {
    expect(formatBookingTime(NINE_AM_UTC)).toMatch(/^9:00/);
  });

  it("renders the date in UTC so it never slips a day", () => {
    expect(formatBookingDate(NINE_AM_UTC)).toContain("5");
    expect(formatBookingDate(NINE_AM_UTC)).toContain("Aug");
  });

  it("keeps date and time consistent in the long form", () => {
    const long = formatBookingDateTime(NINE_AM_UTC);
    expect(long).toContain("9:00");
    expect(long).toContain("August");
  });

  it("does not shift a midnight-boundary time into the previous day", () => {
    // 00:30Z would read as the day before in any negative-offset zone.
    const label = formatBookingDate("2026-08-05T00:30:00.000Z");
    expect(label).toContain("5");
  });

  it("formats the compact list form", () => {
    const short = formatBookingShort(NINE_AM_UTC);
    expect(short).toContain("Aug");
    expect(short).toContain("9:00");
  });

  it("returns an empty string for invalid input instead of throwing", () => {
    expect(formatBookingDate("not-a-date")).toBe("");
    expect(formatBookingTime("")).toBe("");
    expect(formatBookingDateTime("nope")).toBe("");
  });
});

describe("localInputToUtcIso", () => {
  it("treats a datetime-local value as UTC", () => {
    // Matches how slots are anchored, so provider time off lines up with
    // the slots it is meant to block.
    expect(localInputToUtcIso("2026-08-05T09:00")).toBe(
      "2026-08-05T09:00:00.000Z",
    );
  });

  it("passes through a value that already has seconds", () => {
    expect(localInputToUtcIso("2026-08-05T09:00:30")).toBe(
      "2026-08-05T09:00:30.000Z",
    );
  });

  it("produces a value the Date constructor accepts", () => {
    const iso = localInputToUtcIso("2026-12-25T14:30");
    expect(Number.isNaN(new Date(iso).getTime())).toBe(false);
    expect(new Date(iso).getUTCHours()).toBe(14);
  });
});
