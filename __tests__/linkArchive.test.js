import { describe, expect, it, vi } from "vitest";
import { archiveExpiredLinks } from "../lib/expiry/archive";

describe("archiveExpiredLinks", () => {
  it("archives expired links, records the reason, and keeps the rows", async () => {
    const invalidate = vi.fn(async () => {});
    const remove = vi.fn();
    let setValues;
    const now = new Date("2026-10-19T03:00:00.000Z");
    const db = {
      update: () => ({
        set: (values) => {
          setValues = values;
          return {
            where: () => ({
              returning: async () => [{ shortCode: "qrcode" }, { shortCode: "alias" }],
            }),
          };
        },
      }),
      delete: remove,
    };

    const archived = await archiveExpiredLinks(db, now, invalidate);

    expect(archived).toHaveLength(2);
    expect(setValues).toEqual({ archivedAt: now, archiveReason: "expired" });
    expect(remove).not.toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith("qrcode");
    expect(invalidate).toHaveBeenCalledWith("alias");
  });
});
