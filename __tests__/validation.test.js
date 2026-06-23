import { describe, expect, it } from "vitest";
import { isValidUuid } from "../lib/validation";

describe("isValidUuid", () => {
  it("accepts valid UUID strings", () => {
    expect(isValidUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects invalid ids", () => {
    expect(isValidUuid("not-an-id")).toBe(false);
    expect(isValidUuid("")).toBe(false);
    expect(isValidUuid(null)).toBe(false);
  });
});
