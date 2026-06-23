import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/mongodb", () => ({
  default: Promise.resolve({ db: () => ({}) }),
}));

import { generateApiKey, hashApiKey } from "../lib/apiKeys";

describe("apiKeys", () => {
  it("generates keys with mkl_ prefix", () => {
    const key = generateApiKey();
    expect(key.startsWith("mkl_")).toBe(true);
    expect(key.length).toBeGreaterThan(10);
  });

  it("hashes keys deterministically", () => {
    const key = "mkl_test_key";
    expect(hashApiKey(key)).toBe(hashApiKey(key));
    expect(hashApiKey(key)).not.toBe(key);
  });
});
