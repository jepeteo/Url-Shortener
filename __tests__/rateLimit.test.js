import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a boolean promise", async () => {
    const { checkRateLimit } = await import("../lib/rateLimit");
    const result = await checkRateLimit("test-ip-boolean");
    expect(typeof result).toBe("boolean");
  });

  it("allows requests under the limit", async () => {
    const { checkRateLimit } = await import("../lib/rateLimit");
    const id = `test-under-${Date.now()}`;

    expect(await checkRateLimit(id, { limit: 2, windowMs: 60_000 })).toBe(true);
    expect(await checkRateLimit(id, { limit: 2, windowMs: 60_000 })).toBe(true);
  });

  it("blocks requests at the limit", async () => {
    const { checkRateLimit } = await import("../lib/rateLimit");
    const id = `test-block-${Date.now()}`;

    expect(await checkRateLimit(id, { limit: 2, windowMs: 60_000 })).toBe(true);
    expect(await checkRateLimit(id, { limit: 2, windowMs: 60_000 })).toBe(true);
    expect(await checkRateLimit(id, { limit: 2, windowMs: 60_000 })).toBe(false);
  });
});
