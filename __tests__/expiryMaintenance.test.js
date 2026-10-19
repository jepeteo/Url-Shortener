import { beforeEach, describe, expect, it, vi } from "vitest";
import { runExpiryMaintenance } from "../lib/expiry/maintenance";

const now = new Date("2026-10-19T03:00:00.000Z");

function liveLink(overrides) {
  return {
    id: "live-1",
    shortCode: "soon",
    originalUrl: "https://example.com/a",
    expiresAt: "2026-10-21T12:00:00.000Z",
    archivedAt: null,
    archiveReason: null,
    userId: "user-1",
    isAnonymous: false,
    email: "person@example.com",
    emailVerified: new Date("2026-01-01T00:00:00.000Z"),
    emailPreferences: true,
    plan: "free",
    paymentStatus: null,
    sentStages: [],
    ...overrides,
  };
}

describe("runExpiryMaintenance", () => {
  let sent;
  let claims;
  let released;
  let archivedCalls;
  let tracks;

  beforeEach(() => {
    sent = [];
    claims = [];
    released = [];
    archivedCalls = 0;
    tracks = [];
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  function options(rows, extra = {}) {
    return {
      db: { tag: "db" },
      now,
      loadRows: async (_db, _now, kind) => rows[kind] || [],
      countArchivable: async () => (rows.archivable || []).length + (extra.anonymousArchivable || 0),
      archive: async () => {
        archivedCalls += 1;
        rows.expired = [
          ...(rows.expired || []),
          ...(rows.archivable || []).map((row) => ({
            ...row,
            archivedAt: now,
            archiveReason: "expired",
          })),
        ];
        rows.archivable = [];
        return [{ shortCode: "due" }];
      },
      claim: async (_db, digest) => {
        claims.push(digest.stage);
        return extra.claim ? extra.claim(digest) : digest.links;
      },
      release: async (_db, stage, urlIds) => {
        released.push({ stage, urlIds });
      },
      send: async (payload) => {
        if (extra.failSend) {
          throw new Error("resend down");
        }
        sent.push(payload);
        return { sent: true };
      },
      track: async (name, properties) => {
        tracks.push({ name, properties });
      },
      ...extra.options,
    };
  }

  it("sends one digest per stage, archives, then sends the expired digest", async () => {
    const rows = {
      active: [
        liveLink({ id: "a", shortCode: "aaa" }),
        liveLink({ id: "b", shortCode: "bbb", expiresAt: "2026-10-22T08:00:00.000Z" }),
      ],
      archivable: [liveLink({ id: "old", shortCode: "old", expiresAt: "2026-10-18T00:00:00.000Z" })],
      expired: [],
    };

    const result = await runExpiryMaintenance(options(rows));

    expect(sent.map((message) => message.stage)).toEqual(["upcoming", "expired"]);
    expect(sent[0].links).toHaveLength(2);
    expect(sent[0].email).toBe("person@example.com");
    expect(sent[1].links.map((link) => link.shortCode)).toEqual(["old"]);
    expect(archivedCalls).toBe(1);
    expect(sent.findIndex((message) => message.stage === "expired")).toBeGreaterThan(0);
    expect(claims).toEqual(["upcoming", "expired"]);
    expect(tracks.map((event) => event.properties)).toEqual([{ stage: "upcoming" }, { stage: "expired" }]);
    expect(result.archived).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.reminders.upcoming).toEqual({ users: 1, links: 2 });
    expect(result.reminders.expired).toEqual({ users: 1, links: 1 });
  });

  it("does not send again when the claim already exists", async () => {
    const rows = {
      active: [liveLink()],
      expired: [],
    };
    const result = await runExpiryMaintenance(
      options(rows, { claim: async () => [] })
    );
    expect(sent).toHaveLength(0);
    expect(result.reminders.upcoming).toEqual({ users: 0, links: 0 });
  });

  it("releases the claim when sending fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const rows = { active: [liveLink({ id: "a" })], expired: [] };
    const result = await runExpiryMaintenance(options(rows, { failSend: true }));
    expect(result.failed).toBe(1);
    expect(released).toEqual([{ stage: "upcoming", urlIds: ["a"] }]);
    expect(tracks).toHaveLength(0);
    error.mockRestore();
  });

  it("dry-run counts mail and archives without sending or writing", async () => {
    const rows = {
      active: [liveLink()],
      archivable: [liveLink({ id: "old", shortCode: "old", expiresAt: "2026-10-18T00:00:00.000Z" })],
      expired: [
        liveLink({
          id: "gone",
          shortCode: "gone",
          archivedAt: now,
          archiveReason: "expired",
          expiresAt: "2026-10-17T00:00:00.000Z",
        }),
      ],
    };
    const result = await runExpiryMaintenance({ ...options(rows, { anonymousArchivable: 2 }), dryRun: true });
    expect(sent).toHaveLength(0);
    expect(claims).toHaveLength(0);
    expect(archivedCalls).toBe(0);
    expect(result.dryRun).toBe(true);
    expect(result.archived).toBe(3);
    expect(result.reminders.upcoming.links).toBe(1);
    expect(result.reminders.expired.links).toBe(2);
  });
});
