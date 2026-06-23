import { describe, expect, it } from "vitest";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "../lib/validation";

describe("isValidObjectId", () => {
  it("accepts valid ObjectId strings", () => {
    const id = new ObjectId().toString();
    expect(isValidObjectId(id)).toBe(true);
  });

  it("rejects invalid ids", () => {
    expect(isValidObjectId("not-an-id")).toBe(false);
    expect(isValidObjectId("")).toBe(false);
    expect(isValidObjectId(null)).toBe(false);
  });
});
