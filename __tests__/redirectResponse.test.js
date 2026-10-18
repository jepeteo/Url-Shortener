import { describe, expect, it, vi } from "vitest";

const { findFirst, setCachedRedirect, getCachedRedirect, recordClickAsync } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  setCachedRedirect: vi.fn(),
  getCachedRedirect: vi.fn(),
  recordClickAsync: vi.fn(),
}));

vi.mock("../lib/db", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getDb: () => ({
      query: {
        urls: { findFirst },
      },
    }),
  };
});

vi.mock("../lib/redirectCache", () => ({
  getCachedRedirect: (...args) => getCachedRedirect(...args),
  setCachedRedirect: (...args) => setCachedRedirect(...args),
}));

vi.mock("../lib/clickTracking", () => ({
  recordClickAsync: (...args) => recordClickAsync(...args),
}));

describe("temporary redirects", () => {
  it("uses 307 and forbids caching", async () => {
    const { temporaryRedirect, TEMPORARY_REDIRECT_STATUS } = await import(
      "../lib/redirectResponse"
    );
    const response = temporaryRedirect("https://example.com/dest");

    expect(TEMPORARY_REDIRECT_STATUS).toBe(307);
    expect(response.status).toBe(307);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("location")).toBe("https://example.com/dest");
  });

  it("redirects never-expiring links with 307 instead of 308", async () => {
    getCachedRedirect.mockResolvedValueOnce(null);
    findFirst.mockResolvedValueOnce({
      id: "id-1",
      shortCode: "abc",
      originalUrl: "https://example.com/dest",
      expiresAt: null,
    });

    const { GET } = await import("../app/api/[shortCode]/route");
    const response = await GET(new Request("http://localhost/abc"), {
      params: Promise.resolve({ shortCode: "abc" }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("location")).toBe("https://example.com/dest");
    expect(setCachedRedirect).toHaveBeenCalledWith(
      "abc",
      "https://example.com/dest",
      "id-1",
      null
    );
    expect(recordClickAsync).toHaveBeenCalled();
  });

  it("sends a missing short code to the report page", async () => {
    getCachedRedirect.mockResolvedValueOnce(null);
    findFirst.mockResolvedValueOnce(null);

    const { GET } = await import("../app/api/[shortCode]/route");
    const response = await GET(new Request("http://localhost/missing"), {
      params: Promise.resolve({ shortCode: "missing" }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/link-not-found?code=missing"
    );
  });
});
