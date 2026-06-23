import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCountDocuments = vi.fn();
const mockDb = {
  collection: vi.fn(() => ({
    countDocuments: mockCountDocuments,
  })),
};

vi.mock("../lib/mongodb", () => ({
  default: Promise.resolve({
    db: () => mockDb,
  }),
}));

describe("canCreateLink", () => {
  beforeEach(() => {
    mockCountDocuments.mockReset();
  });

  it("allows anonymous users", async () => {
    const { canCreateLink } = await import("../lib/usage");
    const result = await canCreateLink(null);
    expect(result.allowed).toBe(true);
  });

  it("blocks free users at monthly limit", async () => {
    mockCountDocuments.mockResolvedValue(20);
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
    mockCountDocuments.mockResolvedValue(2);
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
    mockCountDocuments.mockResolvedValue(1);
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
