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
    });
    expect(fetch).toHaveBeenCalled();
  });
});
