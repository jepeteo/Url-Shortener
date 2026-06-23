import { describe, expect, it, vi, beforeEach } from "vitest";

const mockInsertOne = vi.fn();
const mockDb = {
  collection: vi.fn(() => ({
    insertOne: mockInsertOne,
  })),
};

vi.mock("../lib/mongodb", () => ({
  default: Promise.resolve({
    db: () => mockDb,
  }),
}));

vi.mock("../lib/usage", () => ({
  canCreateLink: vi.fn().mockResolvedValue({ allowed: true }),
}));

describe("createShortUrl", () => {
  beforeEach(() => {
    mockInsertOne.mockReset();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  it("rejects invalid URLs", async () => {
    const { createShortUrl } = await import("../lib/shorten");
    const result = await createShortUrl({ originalUrl: "javascript:alert(1)" });
    expect(result.error).toBeTruthy();
    expect(result.status).toBe(400);
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
    mockInsertOne.mockResolvedValue({ insertedId: "abc" });
    const { createShortUrl } = await import("../lib/shorten");
    const result = await createShortUrl({
      originalUrl: "https://example.com",
      user: { id: "user1", plan: "free" },
    });
    expect(result.shortCode).toBeTruthy();
    expect(result.shortUrl).toContain("http://localhost:3000/");
    expect(mockInsertOne).toHaveBeenCalledOnce();
  });

  it("returns conflict when alias is taken", async () => {
    mockInsertOne.mockRejectedValue({ code: 11000 });
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
