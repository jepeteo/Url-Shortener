import { describe, expect, it } from "vitest";
import { isReservedPath } from "../lib/reservedPaths";

describe("reservedPaths", () => {
  it("includes middleware and alias routes", () => {
    expect(isReservedPath("api")).toBe(true);
    expect(isReservedPath("mtxadmin")).toBe(true);
    expect(isReservedPath("contact")).toBe(true);
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
