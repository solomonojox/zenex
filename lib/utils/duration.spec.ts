import {
  durationFromLabel,
  DEFAULT_DURATION_MINS,
  MAX_DURATION_MINS,
} from "./duration";

describe("durationFromLabel", () => {
  it("reads hours by default", () => {
    expect(durationFromLabel("2 hrs")).toBe(120);
    expect(durationFromLabel("3 hours")).toBe(180);
    expect(durationFromLabel("1 hr")).toBe(60);
  });

  it("uses the lower bound of a range", () => {
    expect(durationFromLabel("2–3 hrs")).toBe(120); // en dash
    expect(durationFromLabel("4-6 hrs")).toBe(240); // hyphen
    expect(durationFromLabel("5 to 7 hrs")).toBe(300);
  });

  it("reads minutes when the label says minutes", () => {
    // The original bug: "90 mins" was read as 90 hours, leaving no bookable
    // slot and no explanation for the customer.
    expect(durationFromLabel("90 mins")).toBe(90);
    expect(durationFromLabel("45 minutes")).toBe(45);
    expect(durationFromLabel("30 Min")).toBe(30);
  });

  it("handles fractional hours", () => {
    expect(durationFromLabel("1.5 hrs")).toBe(90);
    expect(durationFromLabel("2.5 hours")).toBe(150);
  });

  it("falls back to the default for empty or unusable input", () => {
    expect(durationFromLabel("")).toBe(DEFAULT_DURATION_MINS);
    expect(durationFromLabel(undefined)).toBe(DEFAULT_DURATION_MINS);
    expect(durationFromLabel(null)).toBe(DEFAULT_DURATION_MINS);
    expect(durationFromLabel("a while")).toBe(DEFAULT_DURATION_MINS);
    expect(durationFromLabel("0 hrs")).toBe(DEFAULT_DURATION_MINS);
  });

  it("rejects implausible values rather than blocking a calendar", () => {
    expect(durationFromLabel("500 hrs")).toBe(DEFAULT_DURATION_MINS);
    expect(durationFromLabel("5 mins")).toBe(DEFAULT_DURATION_MINS); // too short
  });

  it("never returns anything a working day can't hold", () => {
    const labels = ["2 hrs", "90 mins", "1.5 hours", "12 hrs", "", "nonsense"];
    for (const l of labels) {
      const mins = durationFromLabel(l);
      expect(mins).toBeGreaterThan(0);
      expect(mins).toBeLessThanOrEqual(MAX_DURATION_MINS);
    }
  });
});
