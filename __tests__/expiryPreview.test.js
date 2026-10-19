import { beforeEach, describe, expect, it, vi } from "vitest";

const getServerSession = vi.fn();

vi.mock("next-auth/next", () => ({
  getServerSession: (...args) => getServerSession(...args),
}));

vi.mock("../app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

describe("expiry email preview", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    process.env.ADMIN_EMAILS = "owner@mikrouli.link";
    process.env.NEXT_PUBLIC_BASE_URL = "https://mikrouli.link";
  });

  it("is admin-only and does not send mail", async () => {
    getServerSession.mockResolvedValue({ user: { email: "owner@mikrouli.link" } });
    const { GET } = await import("../app/api/admin/expiry-email-preview/route");
    const response = await GET(
      new Request("http://localhost/api/admin/expiry-email-preview?stage=expired&audience=free")
    );
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Preview only");
    expect(html).toContain("they come back");
    expect(html).toContain("Nothing was sent");
  });

  it("rejects everyone else", async () => {
    getServerSession.mockResolvedValue({ user: { email: "person@example.com" } });
    const { GET } = await import("../app/api/admin/expiry-email-preview/route");
    const response = await GET(new Request("http://localhost/api/admin/expiry-email-preview"));
    expect(response.status).toBe(403);
  });
});