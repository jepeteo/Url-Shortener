import { beforeEach, describe, expect, it, vi } from "vitest";
import { signEmailPreference } from "../lib/expiry/preferences";

const sets = [];

vi.mock("../lib/db", () => ({
  getDb: () => ({
    update: () => ({
      set: (values) => ({
        where: async () => {
          sets.push(values);
        },
      }),
    }),
  }),
  users: { id: "id" },
}));

describe("email preference route", () => {
  beforeEach(() => {
    sets.length = 0;
    process.env.NEXTAUTH_SECRET = "pref-secret";
  });

  it("turns reminders off from a signed link", async () => {
    const token = signEmailPreference(
      { userId: "11111111-1111-4111-8111-111111111111", enabled: false },
      "pref-secret"
    );
    const { GET } = await import("../app/api/email/preferences/route");
    const response = await GET(
      new Request(`http://localhost/api/email/preferences?token=${encodeURIComponent(token)}`)
    );
    expect(response.status).toBe(200);
    expect(sets).toEqual([{ emailPreferences: false }]);
    expect(await response.text()).toContain("Expiry reminders are off");
  });

  it("rejects a bad token", async () => {
    const { POST } = await import("../app/api/email/preferences/route");
    const response = await POST(
      new Request("http://localhost/api/email/preferences?token=nope", { method: "POST" })
    );
    expect(response.status).toBe(400);
    expect(sets).toHaveLength(0);
  });
});
