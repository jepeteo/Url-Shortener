import { beforeEach, describe, expect, it, vi } from "vitest";

const tasks = [];
const insertValues = vi.fn(async () => {});
const updateWhere = vi.fn(async () => {});

vi.mock("next/server", () => ({
  after: (task) => {
    tasks.push(task);
  },
}));

vi.mock("../lib/db", () => ({
  getDb: () => ({
    update: () => ({
      set: () => ({
        where: updateWhere,
      }),
    }),
    insert: () => ({
      values: insertValues,
    }),
  }),
  urls: { id: "id", clicks: "clicks" },
  clicks: {},
}));

describe("recordClickAsync", () => {
  beforeEach(() => {
    tasks.length = 0;
    insertValues.mockClear();
    updateWhere.mockClear();
  });

  it("schedules the write with after() so the redirect does not wait on it", async () => {
    const { recordClickAsync } = await import("../lib/clickTracking");
    const request = new Request("http://localhost/abc", {
      headers: {
        "user-agent": "Mozilla/5.0",
        "x-forwarded-for": "203.0.113.8",
        referer: "https://news.example",
      },
    });

    recordClickAsync({ id: "url-1", shortCode: "abc" }, request);

    expect(tasks).toHaveLength(1);
    expect(insertValues).not.toHaveBeenCalled();

    await tasks[0]();

    expect(updateWhere).toHaveBeenCalledOnce();
    expect(insertValues).toHaveBeenCalledOnce();
    expect(insertValues.mock.calls[0][0].ip).toBe("203.0.113.0");
    expect(insertValues.mock.calls[0][0].shortCode).toBe("abc");
  });

  it("does not record bot traffic", async () => {
    const { recordClickAsync } = await import("../lib/clickTracking");
    const request = new Request("http://localhost/abc", {
      headers: { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
    });

    recordClickAsync({ id: "url-1", shortCode: "abc" }, request);
    await tasks[0]();

    expect(insertValues).not.toHaveBeenCalled();
  });
});
