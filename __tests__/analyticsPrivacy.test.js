import { describe, expect, it } from "vitest";
import { measurementBeforeSend, sanitizeMeasurementUrl } from "../lib/analyticsPrivacy";

describe("sanitizeMeasurementUrl", () => {
  it("strips query strings and hashes", () => {
    expect(sanitizeMeasurementUrl("/api/auth/verify?token=secret")).toBe("/api/auth/verify");
    expect(sanitizeMeasurementUrl("/dashboard?upgraded=1#billing")).toBe("/dashboard");
  });

  it("removes a password reset token from the path", () => {
    expect(sanitizeMeasurementUrl("/auth/reset-password/abc123")).toBe("/auth/reset-password");
    expect(
      sanitizeMeasurementUrl("https://mikrouli.link/auth/reset-password/abc123?x=1")
    ).toBe("https://mikrouli.link/auth/reset-password");
  });

  it("drops values that are not URLs", () => {
    expect(sanitizeMeasurementUrl("")).toBeNull();
    expect(sanitizeMeasurementUrl("http://[")).toBeNull();
  });
});

describe("measurementBeforeSend", () => {
  it("returns the event with a safe URL", () => {
    expect(measurementBeforeSend({ type: "pageview", url: "/pricing?ref=ad" })).toEqual({
      type: "pageview",
      url: "/pricing",
    });
  });

  it("drops an event with no usable URL", () => {
    expect(measurementBeforeSend({ url: "" })).toBeNull();
    expect(measurementBeforeSend(null)).toBeNull();
  });
});
