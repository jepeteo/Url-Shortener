import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("upstash env resolution", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("detects Upstash env vars", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";

    const { isUpstashConfigured } = await import("../lib/upstash");
    expect(isUpstashConfigured()).toBe(true);
  });

  it("falls back to Vercel KV env vars", async () => {
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "kv-token";

    const { isUpstashConfigured } = await import("../lib/upstash");
    expect(isUpstashConfigured()).toBe(true);
  });

  it("uses Upstash vars over KV vars when both are set", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";
    process.env.KV_REST_API_URL = "https://kv.example.io";
    process.env.KV_REST_API_TOKEN = "kv-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 1 }),
      })
    );

    const { upstashCommand } = await import("../lib/upstash");
    await upstashCommand("/ping");

    expect(fetch).toHaveBeenCalledWith(
      "https://upstash.example.io/ping",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer upstash-token",
        }),
      })
    );
  });
});
