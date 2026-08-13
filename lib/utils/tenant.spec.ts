import { resolveTenant } from "./tenant";

describe("resolveTenant", () => {
  it("returns null on the Vercel host that broke production", () => {
    // This is the actual regression: zenex-app.vercel.app was sending
    // x-Tenant: zenex-app, so every query scoped to a tenant that does not
    // exist and the whole site rendered empty.
    expect(resolveTenant("zenex-app.vercel.app")).toBeNull();
  });

  it("ignores other platform and preview hosts", () => {
    for (const host of [
      "zenex-git-main-victor.vercel.app",
      "zenex.netlify.app",
      "zenex-api.onrender.com",
      "zenex.pages.dev",
      "zenex.fly.dev",
    ]) {
      expect(resolveTenant(host)).toBeNull();
    }
  });

  it("ignores local and IP hosts", () => {
    expect(resolveTenant("localhost")).toBeNull();
    expect(resolveTenant("app.localhost")).toBeNull();
    expect(resolveTenant("127.0.0.1")).toBeNull();
    expect(resolveTenant("192.168.1.14")).toBeNull();
  });

  it("treats an apex domain as no tenant", () => {
    expect(resolveTenant("zenex.ca")).toBeNull();
    expect(resolveTenant("www.zenex.ca")).toBeNull();
  });

  it("still resolves a genuine tenant subdomain", () => {
    expect(resolveTenant("acme.zenex.ca")).toBe("acme");
    expect(resolveTenant("Maple-Cleaning.zenex.ca")).toBe("maple-cleaning");
  });

  it("lets an explicit setting override the hostname", () => {
    expect(resolveTenant("zenex-app.vercel.app", "demo")).toBe("demo");
    expect(resolveTenant("acme.zenex.ca", "demo")).toBe("demo");
    expect(resolveTenant("zenex.ca", " Demo ")).toBe("demo");
  });

  it("ignores an empty or whitespace-only override", () => {
    expect(resolveTenant("zenex-app.vercel.app", "")).toBeNull();
    expect(resolveTenant("zenex-app.vercel.app", "   ")).toBeNull();
  });

  it("handles missing input", () => {
    expect(resolveTenant(undefined)).toBeNull();
    expect(resolveTenant(null)).toBeNull();
    expect(resolveTenant("")).toBeNull();
  });
});
