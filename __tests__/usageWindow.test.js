import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clauses = [];

vi.mock("drizzle-orm", () => ({
  and: (...parts) => ({ parts }),
  eq: (column, value) => ({ op: "eq", column, value }),
  gte: (column, value) => ({ op: "gte", column, value }),
  count: () => "count",
}));

vi.mock("../lib/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: (clause) => {
          clauses.push(clause);
          return Promise.resolve([{ count: 4 }]);
        },
      }),
    }),
  }),
  urls: {
    userId: "userId",
    createdAt: "createdAt",
    archivedAt: "archivedAt",
  },
}));

describe("monthly link count window", () => {
  const previousTz = process.env.TZ;

  beforeEach(() => {
    clauses.length = 0;
    process.env.TZ = "America/Los_Angeles";
  });

  afterEach(() => {
    process.env.TZ = previousTz;
  });

  it("starts at the UTC month even when local time is still the previous month", async () => {
    const { getMonthlyLinkCount, getMonthKey, getUtcMonthStart } = await import("../lib/usage");
    const now = new Date("2026-05-01T00:30:00.000Z");

    expect(getUtcMonthStart(now).toISOString()).toBe("2026-05-01T00:00:00.000Z");
    expect(getMonthKey(now)).toBe("2026-05");

    const count = await getMonthlyLinkCount("user-1", now);
    expect(count).toBe(4);
    expect(clauses[0].parts).toHaveLength(2);
    expect(clauses[0].parts[0]).toEqual({ op: "eq", column: "userId", value: "user-1" });
    expect(clauses[0].parts[1].op).toBe("gte");
    expect(clauses[0].parts[1].column).toBe("createdAt");
    expect(clauses[0].parts[1].value.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    expect(JSON.stringify(clauses[0])).not.toContain("archivedAt");
  });
});
