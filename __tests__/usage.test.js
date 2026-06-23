import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCountResult = vi.fn();
const mockDb = {
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn().mockImplementation(() => mockCountResult()),
    })),
  })),
};

vi.mock("../lib/db", () => ({
  getDb: () => mockDb,
  urls: {},
}));

describe("canCreateLink", () => {
  beforeEach(() => {
    mockCountResult.mockReset();
  });

  it("allows anonymous users", async () => {
    const { canCreateLink } = await import("../lib/usage");
    const result = await canCreateLink(null);
    expect(result.allowed).toBe(true);
  });

  it("blocks free users at monthly limit", async () => {
    mockCountResult.mockResolvedValue([{ count: 20 }]);
    const { canCreateLink } = await import("../lib/usage");
    const result = await canCreateLink({
      id: "user1",
      plan: "free",
      emailVerified: new Date(),
    });
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(20);
  });

  it("allows business users without limit", async () => {
    const { canCreateLink } = await import("../lib/usage");
    const result = await canCreateLink({ id: "user1", plan: "business", emailVerified: new Date() });
    expect(result.allowed).toBe(true);
  });

  it("caps unverified free users at 2 links", async () => {
    mockCountResult.mockResolvedValue([{ count: 2 }]);
    const { canCreateLink } = await import("../lib/usage");
    const result = await canCreateLink({
      id: "user1",
      plan: "free",
      emailVerified: null,
    });
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(2);
    expect(result.verified).toBe(false);
    expect(result.reason).toContain("Verify your email");
  });

  it("allows unverified free users under 2 links", async () => {
    mockCountResult.mockResolvedValue([{ count: 1 }]);
    const { canCreateLink } = await import("../lib/usage");
    const result = await canCreateLink({
      id: "user1",
      plan: "free",
      emailVerified: null,
    });
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(2);
  });
});
