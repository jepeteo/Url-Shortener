import { describe, expect, it, vi } from "vitest";
import { ARCHIVE_REASONS } from "../lib/expiry/constants";
import {
  restoreLinksAfterUpgrade,
  shouldRestoreOnUpgrade,
  upgradeLinkPatch,
} from "../lib/expiry/restore";

const userId = "user-1";
const nextExpiry = new Date("2027-01-17T00:00:00.000Z");

function link(overrides) {
  return {
    id: "link-1",
    shortCode: "abc",
    userId,
    expiresAt: new Date("2026-10-01T00:00:00.000Z"),
    archivedAt: new Date("2026-10-01T00:00:00.000Z"),
    archiveReason: ARCHIVE_REASONS.expired,
    isAnonymous: false,
    ...overrides,
  };
}

describe("shouldRestoreOnUpgrade", () => {
  it("applies a paid checkout and a reactivation, and skips a same-plan renewal", () => {
    expect(shouldRestoreOnUpgrade({ source: "checkout", nextPlan: "pro" })).toBe(true);
    expect(shouldRestoreOnUpgrade({ source: "checkout", nextPlan: "free" })).toBe(false);
    expect(
      shouldRestoreOnUpgrade({
        source: "subscription",
        previousUser: { id: userId, plan: "free", paymentStatus: null },
        nextPlan: "pro",
        nextStatus: "active",
      })
    ).toBe(true);
    expect(
      shouldRestoreOnUpgrade({
        source: "subscription",
        previousUser: { id: userId, plan: "pro", paymentStatus: "past_due" },
        nextPlan: "pro",
        nextStatus: "active",
      })
    ).toBe(true);
    expect(
      shouldRestoreOnUpgrade({
        source: "subscription",
        previousUser: { id: userId, plan: "pro", paymentStatus: "active" },
        nextPlan: "business",
        nextStatus: "active",
      })
    ).toBe(true);
    expect(
      shouldRestoreOnUpgrade({
        source: "subscription",
        previousUser: { id: userId, plan: "pro", paymentStatus: "active" },
        nextPlan: "pro",
        nextStatus: "active",
      })
    ).toBe(false);
    expect(
      shouldRestoreOnUpgrade({
        source: "subscription",
        previousUser: { id: userId, plan: "business", paymentStatus: "active" },
        nextPlan: "pro",
        nextStatus: "active",
      })
    ).toBe(false);
  });
});

describe("upgradeLinkPatch", () => {
  it("restores only expiry archives and extends live links that end sooner", () => {
    expect(upgradeLinkPatch(link(), userId, nextExpiry)).toEqual({
      restored: true,
      expiresAt: nextExpiry,
    });
    expect(upgradeLinkPatch(link({ archiveReason: ARCHIVE_REASONS.user }), userId, nextExpiry)).toBeNull();
    expect(upgradeLinkPatch(link({ archiveReason: ARCHIVE_REASONS.admin }), userId, nextExpiry)).toBeNull();
    expect(upgradeLinkPatch(link({ archiveReason: null }), userId, nextExpiry)).toBeNull();
    expect(
      upgradeLinkPatch(
        link({
          archivedAt: null,
          archiveReason: null,
          expiresAt: new Date("2026-10-20T00:00:00.000Z"),
        }),
        userId,
        nextExpiry
      )
    ).toEqual({ extended: true, expiresAt: nextExpiry });
    expect(
      upgradeLinkPatch(
        link({
          archivedAt: null,
          archiveReason: null,
          expiresAt: new Date("2028-01-01T00:00:00.000Z"),
        }),
        userId,
        nextExpiry
      )
    ).toBeNull();
    expect(
      upgradeLinkPatch(link({ archivedAt: null, archiveReason: null, expiresAt: null }), userId, nextExpiry)
    ).toBeNull();
    expect(upgradeLinkPatch(link({ userId: "other" }), userId, nextExpiry)).toBeNull();
  });
});

describe("restoreLinksAfterUpgrade", () => {
  it("un-archives expired links, extends shorter live links, and tracks only the restore count", async () => {
    const rows = [
      link({ id: "expired", shortCode: "back" }),
      link({ id: "deleted", shortCode: "gone", archiveReason: ARCHIVE_REASONS.user }),
      link({
        id: "live",
        shortCode: "live",
        archivedAt: null,
        archiveReason: null,
        expiresAt: new Date("2026-10-25T00:00:00.000Z"),
      }),
      link({
        id: "never",
        shortCode: "never",
        archivedAt: null,
        archiveReason: null,
        expiresAt: null,
      }),
    ];
    const sets = [];
    const db = {
      select: () => ({ from: () => ({ where: async () => rows }) }),
      update: () => ({
        set: (values) => ({
          where: async () => {
            sets.push(values);
          },
        }),
      }),
    };
    const invalidate = vi.fn(async () => {});
    const track = vi.fn(async () => {});

    const result = await restoreLinksAfterUpgrade(db, userId, "pro", { invalidate, track });

    expect(result.count).toBe(1);
    expect(result.extended).toBe(1);
    expect(sets).toEqual([
      { archivedAt: null, archiveReason: null, expiresAt: expect.any(Date) },
      { expiresAt: expect.any(Date) },
    ]);
    const restoredExpiry = sets[0].expiresAt.getTime() - Date.now();
    expect(restoredExpiry).toBeGreaterThan(89 * 24 * 60 * 60 * 1000);
    expect(restoredExpiry).toBeLessThan(91 * 24 * 60 * 60 * 1000);
    expect(invalidate.mock.calls.map((call) => call[0]).sort()).toEqual(["back", "live"]);
    expect(track).toHaveBeenCalledWith("restore_after_upgrade", { count: 1 });
  });

  it("does not write or track when the plan is free", async () => {
    const db = { select: vi.fn(), update: vi.fn() };
    const track = vi.fn();
    const result = await restoreLinksAfterUpgrade(db, userId, "free", { track });
    expect(result).toEqual({ count: 0, extended: 0 });
    expect(db.select).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});
