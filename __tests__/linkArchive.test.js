import { beforeEach, describe, expect, it, vi } from "vitest";

const invalidateCachedRedirect = vi.fn(async () => {});
const updateReturning = vi.fn();
const deleteUrls = vi.fn();

vi.mock("../lib/redirectCache", () => ({
  invalidateCachedRedirect: (...args) => invalidateCachedRedirect(...args),
}));

vi.mock("../lib/db", () => ({
  getDb: () => ({
    update: () => ({
      set: (values) => ({
        where: () => ({
          returning: () => updateReturning(values),
        }),
      }),
    }),
    delete: deleteUrls,
  }),
  urls: {
    expiresAt: "expiresAt",
    archivedAt: "archivedAt",
    shortCode: "shortCode",
  },
}));

describe("expired link cleanup", () => {
  beforeEach(() => {
    invalidateCachedRedirect.mockClear();
    updateReturning.mockReset();
    deleteUrls.mockClear();
    process.env.CRON_SECRET = "cron-secret";
  });

  it("archives expired links and keeps the rows", async () => {
    updateReturning.mockResolvedValue([{ shortCode: "qrcode" }, { shortCode: "alias" }]);
    const { GET } = await import("../app/api/cron/cleanup-expired/route");
    const response = await GET(
      new Request("http://localhost/api/cron/cleanup-expired", {
        headers: { authorization: "Bearer cron-secret" },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ archived: 2 });
    expect(updateReturning).toHaveBeenCalledWith({ archivedAt: expect.any(Date) });
    expect(deleteUrls).not.toHaveBeenCalled();
    expect(invalidateCachedRedirect).toHaveBeenCalledWith("qrcode");
    expect(invalidateCachedRedirect).toHaveBeenCalledWith("alias");
  });
});
