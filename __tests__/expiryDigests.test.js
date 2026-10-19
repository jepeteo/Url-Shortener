import { describe, expect, it } from "vitest";
import { buildDigests } from "../lib/expiry/digests";
import { classifyExpiryStage } from "../lib/expiry/display";

const now = new Date("2026-10-19T03:00:00.000Z");

function link(overrides) {
  return {
    id: "link-1",
    shortCode: "abc",
    originalUrl: "https://example.com",
    expiresAt: "2026-10-22T15:00:00.000Z",
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

describe("classifyExpiryStage", () => {
  it("warns while the expiry date is one to three UTC days away", () => {
    expect(classifyExpiryStage("2026-10-22T23:00:00.000Z", now)).toBe("upcoming");
    expect(classifyExpiryStage("2026-10-20T01:00:00.000Z", now)).toBe("upcoming");
    expect(classifyExpiryStage("2026-10-23T00:30:00.000Z", now)).toBeNull();
  });

  it("uses today only while the link is still live", () => {
    expect(classifyExpiryStage("2026-10-19T18:00:00.000Z", now)).toBe("today");
    expect(classifyExpiryStage("2026-10-19T01:00:00.000Z", now)).toBeNull();
  });

  it("sends the expired stage only after an expiry archive", () => {
    expect(
      classifyExpiryStage("2026-10-18T00:00:00.000Z", now, {
        archived: true,
        archiveReason: "expired",
      })
    ).toBe("expired");
    expect(
      classifyExpiryStage("2026-10-18T00:00:00.000Z", now, {
        archived: true,
        archiveReason: "user",
      })
    ).toBeNull();
    expect(
      classifyExpiryStage("2026-10-18T00:00:00.000Z", now, {
        archived: true,
        archiveReason: null,
      })
    ).toBeNull();
  });
});

describe("buildDigests", () => {
  it("groups a user's links into one digest per stage", () => {
    const digests = buildDigests(
      [
        link({ id: "a", shortCode: "aaa", expiresAt: "2026-10-22T12:00:00.000Z" }),
        link({ id: "b", shortCode: "bbb", expiresAt: "2026-10-21T12:00:00.000Z" }),
        link({
          id: "c",
          shortCode: "ccc",
          userId: "user-2",
          email: "other@example.com",
          expiresAt: "2026-10-19T20:00:00.000Z",
        }),
      ],
      now
    );

    expect(digests).toHaveLength(2);
    const first = digests.find((digest) => digest.userId === "user-1");
    expect(first.stage).toBe("upcoming");
    expect(first.links.map((item) => item.shortCode)).toEqual(["bbb", "aaa"]);
    expect(first.audience).toBe("free");
    expect(digests.find((digest) => digest.userId === "user-2").stage).toBe("today");
  });

  it("skips anonymous, unverified, opted-out, and already-sent links", () => {
    const digests = buildDigests(
      [
        link({ userId: null, isAnonymous: true }),
        link({ id: "unverified", emailVerified: null }),
        link({ id: "opt-out", emailPreferences: false }),
        link({ id: "sent", sentStages: ["upcoming"] }),
        link({ id: "keep", shortCode: "keep" }),
      ],
      now
    );

    expect(digests).toHaveLength(1);
    expect(digests[0].links.map((item) => item.id)).toEqual(["keep"]);
  });

  it("keeps a lapsed paid plan distinct from a free account", () => {
    const [digest] = buildDigests(
      [link({ plan: "pro", paymentStatus: "past_due" })],
      now
    );
    expect(digest.audience).toBe("lapsed-pro");
  });
});
