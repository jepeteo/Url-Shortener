import { describe, expect, it, vi, beforeEach } from "vitest";
import * as analytics from "../lib/analytics";

const mockInsert = vi.fn();
const inserted = [];
const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn((values) => {
      inserted.push(values);
      return mockInsert();
    }),
  })),
};

vi.mock("../lib/db", () => ({
  getDb: () => mockDb,
  urls: {},
  isUniqueViolation: (error) => error?.code === "23505",
}));

vi.mock("../lib/usage", () => ({
  canCreateLink: vi.fn().mockResolvedValue({ allowed: true }),
  canCreateAnonymousLink: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.spyOn(analytics, "trackEvent").mockResolvedValue({ tracked: true });

describe("createShortUrl", () => {
  beforeEach(() => {
    mockInsert.mockReset();
    inserted.length = 0;
    analytics.trackEvent.mockClear();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  it("rejects invalid URLs", async () => {
    const { createShortUrl } = await import("../lib/shorten");
    const result = await createShortUrl({ originalUrl: "javascript:alert(1)" });
    expect(result.error).toBeTruthy();
    expect(result.status).toBe(400);
    expect(analytics.trackEvent).not.toHaveBeenCalled();
  });

  it("rejects reserved aliases", async () => {
    const { createShortUrl } = await import("../lib/shorten");
    const result = await createShortUrl({
      originalUrl: "https://example.com",
      user: { id: "user1", plan: "pro" },
      alias: "api",
    });
    expect(result.error).toBeTruthy();
    expect(result.status).toBe(400);
  });

  it("rejects custom alias on free plan", async () => {
    const { createShortUrl } = await import("../lib/shorten");
    const result = await createShortUrl({
      originalUrl: "https://example.com",
      user: { id: "user1", plan: "free" },
      alias: "my-link",
    });
    expect(result.error).toContain("Pro or Business");
    expect(result.status).toBe(403);
  });

  it("creates a short URL for valid input", async () => {
    mockInsert.mockResolvedValue(undefined);
    const { createShortUrl } = await import("../lib/shorten");
    const result = await createShortUrl({
      originalUrl: "https://example.com",
      user: { id: "user1", plan: "free" },
    });
    expect(result.shortCode).toBeTruthy();
    expect(result.shortUrl).toContain("http://localhost:3000/");
    expect(result.creatorToken).toBeNull();
    expect(inserted[0].creatorTokenHash).toBeNull();
    expect(mockInsert).toHaveBeenCalledOnce();
    expect(analytics.trackEvent).toHaveBeenCalledWith("link_created", { plan: "free" });
  });

  it("stores a creator token hash for anonymous links", async () => {
    mockInsert.mockResolvedValue(undefined);
    const { createShortUrl } = await import("../lib/shorten");
    const result = await createShortUrl({
      originalUrl: "https://example.com",
      ip: "203.0.113.10",
    });

    expect(result.creatorToken).toMatch(/^[a-f0-9]{64}$/);
    expect(inserted[0].isAnonymous).toBe(true);
    expect(inserted[0].creatorTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(inserted[0].creatorTokenHash).not.toBe(result.creatorToken);
    expect(analytics.trackEvent).toHaveBeenCalledWith("link_created", { plan: "free" });
    expect(analytics.trackEvent.mock.calls[0][1]).not.toHaveProperty("ip");
  });

  it("returns conflict when alias is taken", async () => {
    mockInsert.mockRejectedValue({ code: "23505" });
    const { createShortUrl } = await import("../lib/shorten");
    const result = await createShortUrl({
      originalUrl: "https://example.com",
      user: { id: "user1", plan: "pro" },
      alias: "taken",
    });
    expect(result.error).toContain("Alias already taken");
    expect(result.status).toBe(409);
  });
});
