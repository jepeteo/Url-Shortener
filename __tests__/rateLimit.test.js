import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("checkRateLimit", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env = originalEnv;
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

  it("fails closed in production when Upstash is not configured", async () => {
    process.env.NODE_ENV = "production";
    const { checkRateLimit } = await import("../lib/rateLimit");
    expect(await checkRateLimit("prod-no-redis")).toBe(false);
  });

  it("exports named rate limit presets", async () => {
    const { RATE_LIMITS } = await import("../lib/rateLimit");
    expect(RATE_LIMITS.shorten.limit).toBe(10);
    expect(RATE_LIMITS.apiV1.limit).toBe(60);
    expect(RATE_LIMITS.apiKey.limit).toBe(3);
  });
});

describe("checkRateLimit with Upstash", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "test-token",
      NODE_ENV: "test",
    };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses Upstash when configured", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 1 }),
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: "OK" }),
    });

    const { checkRateLimit } = await import("../lib/rateLimit");
    expect(await checkRateLimit("upstash-user", { limit: 5, windowMs: 60_000 })).toBe(true);
    expect(fetch).toHaveBeenCalled();
  });

  it("fails closed in production when Upstash request fails", async () => {
    process.env.NODE_ENV = "production";
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { checkRateLimit } = await import("../lib/rateLimit");
    expect(await checkRateLimit("upstash-fail", { limit: 5, windowMs: 60_000 })).toBe(false);
  });
});
