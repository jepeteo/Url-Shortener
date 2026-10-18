import { beforeEach, describe, expect, it, vi } from "vitest";

const invalidateCachedRedirect = vi.fn(async () => {});
const sets = [];
const updateReturning = vi.fn(async () => [{ id: "11111111-1111-4111-8111-111111111111" }]);

vi.mock("next-auth/next", () => ({
  getServerSession: async () => ({ user: { id: "user-1" } }),
}));

vi.mock("../app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("../lib/csrf", () => ({
  validateCsrf: () => true,
}));

vi.mock("../lib/rateLimit", () => ({
  checkRateLimit: async () => true,
  RATE_LIMITS: { deleteUrl: { limit: 20, windowMs: 60_000 } },
}));

vi.mock("../lib/redirectCache", () => ({
  invalidateCachedRedirect: (...args) => invalidateCachedRedirect(...args),
}));

vi.mock("../lib/db", () => ({
  getDb: () => ({
    query: {
      urls: {
        findFirst: async () => ({
          id: "11111111-1111-4111-8111-111111111111",
          shortCode: "alias",
          userId: "user-1",
          archivedAt: null,
        }),
      },
    },
    update: () => ({
      set: (values) => {
        sets.push(values);
        return {
          where: () => ({
            returning: updateReturning,
          }),
        };
      },
    }),
    delete: vi.fn(),
  }),
  urls: {
    id: "id",
    userId: "userId",
    archivedAt: "archivedAt",
    shortCode: "shortCode",
  },
}));

const URL_ID = "11111111-1111-4111-8111-111111111111";

describe("DELETE /api/urls/[id]", () => {
  beforeEach(() => {
    sets.length = 0;
    invalidateCachedRedirect.mockClear();
    updateReturning.mockClear();
  });

  it("archives the link so the short code and quota row remain", async () => {
    const { DELETE } = await import("../app/api/urls/[id]/route");
    const response = await DELETE(new Request(`http://localhost/api/urls/${URL_ID}`), {
      params: Promise.resolve({ id: URL_ID }),
    });

    expect(response.status).toBe(200);
    expect(sets[0]).toEqual({ archivedAt: expect.any(Date) });
    expect(sets[0].userId).toBeUndefined();
    expect(invalidateCachedRedirect).toHaveBeenCalledWith("alias");
  });
});
