import { describe, expect, it } from "vitest";
import { getEffectivePlan, isBillingActive } from "../lib/billing";

describe("isBillingActive", () => {
  it("treats null, active, and trialing as active", () => {
    expect(isBillingActive({ paymentStatus: null })).toBe(true);
    expect(isBillingActive({ paymentStatus: "active" })).toBe(true);
    expect(isBillingActive({ paymentStatus: "trialing" })).toBe(true);
  });

  it("treats past_due and canceled as inactive", () => {
    expect(isBillingActive({ paymentStatus: "past_due" })).toBe(false);
    expect(isBillingActive({ paymentStatus: "canceled" })).toBe(false);
    expect(isBillingActive({ paymentStatus: "unpaid" })).toBe(false);
  });
});

describe("getEffectivePlan", () => {
  it("returns stored plan when billing is active", () => {
    expect(getEffectivePlan({ plan: "pro", paymentStatus: "active" })).toBe("pro");
    expect(getEffectivePlan({ plan: "business", paymentStatus: null })).toBe("business");
  });

  it("downgrades to free when billing is inactive", () => {
    expect(getEffectivePlan({ plan: "pro", paymentStatus: "past_due" })).toBe("free");
    expect(getEffectivePlan({ plan: "business", paymentStatus: "canceled" })).toBe("free");
  });
});
