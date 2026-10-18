import { describe, expect, it } from "vitest";
import { isReservedPath } from "../lib/reservedPaths";

describe("reservedPaths", () => {
  it("includes middleware and alias routes", () => {
    expect(isReservedPath("api")).toBe(true);
    expect(isReservedPath("mtxadmin")).toBe(true);
    expect(isReservedPath("contact")).toBe(true);
    expect(isReservedPath("imprint")).toBe(true);
    expect(isReservedPath("impressum")).toBe(true);
    expect(isReservedPath("abuse")).toBe(true);
    expect(isReservedPath("qr-code-generator")).toBe(true);
    expect(isReservedPath("utm-builder")).toBe(true);
    expect(isReservedPath("blog")).toBe(true);
    expect(isReservedPath("el")).toBe(true);
    expect(isReservedPath("en")).toBe(true);
    expect(isReservedPath("admin")).toBe(true);
  });

  it("allows custom aliases", () => {
    expect(isReservedPath("my-link")).toBe(false);
    expect(isReservedPath("promo2026")).toBe(false);
  });

  it("is case insensitive", () => {
    expect(isReservedPath("Dashboard")).toBe(true);
  });
});
