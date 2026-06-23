import { describe, expect, it } from "vitest";
import {
  getPlan,
  canUseFeature,
  getExpiryDaysForPlan,
  computeExpiresAt,
} from "../lib/plans";

describe("getPlan", () => {
  it("returns free plan by default", () => {
    expect(getPlan().id).toBe("free");
    expect(getPlan("unknown").id).toBe("free");
  });

  it("returns pro and business plans", () => {
    expect(getPlan("pro").linksPerMonth).toBe(100);
    expect(getPlan("business").linksPerMonth).toBe(Infinity);
  });
});

describe("canUseFeature", () => {
  it("gates custom aliases by plan", () => {
    expect(canUseFeature("free", "customAlias")).toBe(false);
    expect(canUseFeature("pro", "customAlias")).toBe(true);
    expect(canUseFeature("business", "apiAccess")).toBe(true);
  });
});

describe("getExpiryDaysForPlan", () => {
  it("falls back to plan default for invalid expiry", () => {
    expect(getExpiryDaysForPlan("free", 365)).toBe(14);
    expect(getExpiryDaysForPlan("pro", 14)).toBe(14);
  });

  it("allows business never-expire option", () => {
    expect(getExpiryDaysForPlan("business", null)).toBe(null);
  });
});

describe("computeExpiresAt", () => {
  it("returns null for never-expire", () => {
    expect(computeExpiresAt(null)).toBe(null);
  });

  it("returns a future date", () => {
    const expiresAt = computeExpiresAt(7);
    expect(expiresAt).toBeInstanceOf(Date);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
