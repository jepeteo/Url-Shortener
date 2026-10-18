import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("redirectCache", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, NODE_ENV: "test" };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.REDIRECT_CACHE_TTL_SEC;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("stores and retrieves redirects in memory during development", async () => {
    const { getCachedRedirect, setCachedRedirect } = await import("../lib/redirectCache");

    await setCachedRedirect("abc123", "https://example.com", "url-id-1");
    const cached = await getCachedRedirect("abc123");

    expect(cached).toEqual({
      originalUrl: "https://example.com",
      urlId: "url-id-1",
      linkExpiresAt: null,
    });
  });

  it("invalidates cached redirects", async () => {
    const { getCachedRedirect, setCachedRedirect, invalidateCachedRedirect } =
      await import("../lib/redirectCache");

    await setCachedRedirect("abc123", "https://example.com", "url-id-1");
    await invalidateCachedRedirect("abc123");

    expect(await getCachedRedirect("abc123")).toBeNull();
  });

  it("uses Upstash when configured", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const payload = JSON.stringify({
      originalUrl: "https://example.com",
      urlId: "url-id-1",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: "OK" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: payload }),
        })
    );

    const { setCachedRedirect, getCachedRedirect } = await import("../lib/redirectCache");

    await setCachedRedirect("abc123", "https://example.com", "url-id-1");
    const cached = await getCachedRedirect("abc123");

    expect(cached).toEqual({
      originalUrl: "https://example.com",
      urlId: "url-id-1",
      linkExpiresAt: null,
    });
    expect(fetch).toHaveBeenCalled();
  });

  it("does not serve a cached redirect after the link expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
    const { setCachedRedirect, getCachedRedirect } = await import("../lib/redirectCache");

    await setCachedRedirect(
      "abc123",
      "https://example.com",
      "url-id-1",
      "2026-06-01T00:01:00.000Z"
    );
    expect((await getCachedRedirect("abc123"))?.originalUrl).toBe("https://example.com");

    vi.setSystemTime(new Date("2026-06-01T00:01:01.000Z"));
    expect(await getCachedRedirect("abc123")).toBeNull();
    vi.useRealTimers();
  });

  it("drops an Upstash hit once the stored link expiry has passed", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const payload = JSON.stringify({
      originalUrl: "https://example.com",
      urlId: "url-id-1",
      linkExpiresAt: "2020-01-01T00:00:00.000Z",
    });

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: payload }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: 1 }),
        })
    );

    const { getCachedRedirect } = await import("../lib/redirectCache");
    expect(await getCachedRedirect("abc123")).toBeNull();
    expect(String(fetch.mock.calls[1][0])).toContain("/del/redirect:abc123");
  });

  it("caps the Upstash TTL at the link expiry", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: "OK" }),
      })
    );

    const { setCachedRedirect } = await import("../lib/redirectCache");
    await setCachedRedirect(
      "abc123",
      "https://example.com",
      "url-id-1",
      "2026-06-01T00:01:30.000Z"
    );

    expect(String(fetch.mock.calls[0][0])).toContain("EX=90");
    vi.useRealTimers();
  });
});
