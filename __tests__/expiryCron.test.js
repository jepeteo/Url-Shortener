import { beforeEach, describe, expect, it, vi } from "vitest";

const runExpiryMaintenance = vi.fn();

vi.mock("../lib/expiry/maintenance", () => ({
  runExpiryMaintenance: (...args) => runExpiryMaintenance(...args),
}));

vi.mock("../lib/db", () => ({
  getDb: () => ({ tag: "db" }),
}));

describe("GET /api/cron/cleanup-expired", () => {
  beforeEach(() => {
    runExpiryMaintenance.mockReset();
    process.env.CRON_SECRET = "cron-secret";
    delete process.env.EXPIRY_EMAIL_DRY_RUN;
  });

  it("rejects a missing or wrong secret", async () => {
    const { GET } = await import("../app/api/cron/cleanup-expired/route");
    const response = await GET(new Request("http://localhost/api/cron/cleanup-expired"));
    expect(response.status).toBe(401);
    expect(runExpiryMaintenance).not.toHaveBeenCalled();
  });

  it("runs reminders and archive together", async () => {
    runExpiryMaintenance.mockResolvedValue({
      dryRun: false,
      archived: 1,
      failed: 0,
      reminders: { upcoming: { users: 1, links: 1 }, today: { users: 0, links: 0 }, expired: { users: 1, links: 1 } },
    });
    const { GET } = await import("../app/api/cron/cleanup-expired/route");
    const response = await GET(
      new Request("http://localhost/api/cron/cleanup-expired", {
        headers: { authorization: "Bearer cron-secret" },
      })
    );
    expect(response.status).toBe(200);
    expect(runExpiryMaintenance).toHaveBeenCalledWith({ db: { tag: "db" }, dryRun: false });
    expect(await response.json()).toMatchObject({ archived: 1, failed: 0 });
  });

  it("dry-run query and env skip writes", async () => {
    process.env.EXPIRY_EMAIL_DRY_RUN = "1";
    runExpiryMaintenance.mockResolvedValue({ dryRun: true, archived: 0, failed: 0, reminders: {} });
    const { GET } = await import("../app/api/cron/cleanup-expired/route");
    const response = await GET(
      new Request("http://localhost/api/cron/cleanup-expired?dryRun=1", {
        headers: { authorization: "Bearer cron-secret" },
      })
    );
    expect(response.status).toBe(200);
    expect(runExpiryMaintenance).toHaveBeenCalledWith({ db: { tag: "db" }, dryRun: true });
  });

  it("returns 500 when a reminder send failed so the cron can retry", async () => {
    runExpiryMaintenance.mockResolvedValue({ dryRun: false, archived: 0, failed: 1, reminders: {} });
    const { GET } = await import("../app/api/cron/cleanup-expired/route");
    const response = await GET(
      new Request("http://localhost/api/cron/cleanup-expired", {
        headers: { authorization: "Bearer cron-secret" },
      })
    );
    expect(response.status).toBe(500);
  });
});
