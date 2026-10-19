import { describe, expect, it } from "vitest";
import { expiryReminderTemplate } from "../lib/email/templates/expiry-reminder";
import { preferenceResultHtml, signEmailPreference, verifyEmailPreference } from "../lib/expiry/preferences";
import { formatExpiryDate, getLinkStatus, qrExpiryWarning } from "../lib/expiry/display";

const links = [
  {
    id: "1",
    shortCode: "qrcode",
    originalUrl: "https://example.com/menu?table=4",
    expiresAt: "2026-11-01T12:00:00.000Z",
  },
  {
    id: "2",
    shortCode: "cafe",
    originalUrl: "https://example.com/?q=a&b=1",
    expiresAt: "2026-11-02T12:00:00.000Z",
  },
];

describe("expiryReminderTemplate", () => {
  it("writes one short free-plan digest with an upgrade link and an unsubscribe link", () => {
    const { subject, html, text } = expiryReminderTemplate({
      stage: "expired",
      audience: "free",
      links,
      unsubscribeUrl: "https://mikrouli.link/api/email/preferences?token=abc",
      pricingUrl: "https://mikrouli.link/pricing",
      dashboardUrl: "https://mikrouli.link/dashboard",
    });

    expect(subject).toBe("Your mikrouli.link links have expired");
    expect(text).toContain("they come back");
    expect(text).toContain("https://mikrouli.link/qrcode");
    expect(text).toContain("https://mikrouli.link/cafe");
    expect(text).toContain("Upgrade to Pro: https://mikrouli.link/pricing");
    expect(text).toContain("Dashboard: https://mikrouli.link/dashboard");
    expect(text).toContain("Turn these reminders off: https://mikrouli.link/api/email/preferences?token=abc");
    expect(html).toContain("https://mikrouli.link/pricing");
    expect(html).toContain("&amp;");
    expect(html).not.toContain("person@example.com");
  });

  it("points a Business account at the dashboard", () => {
    const { text } = expiryReminderTemplate({
      stage: "upcoming",
      audience: "business",
      links: [links[0]],
      unsubscribeUrl: "https://mikrouli.link/unsub",
    });
    expect(text).toContain("Open your dashboard:");
    expect(text).not.toContain("Upgrade to Pro");
    expect(text).toContain("1 Nov 2026 UTC");
  });
});

describe("email preference tokens", () => {
  it("round-trips a signed one-click preference and rejects tampering", () => {
    const token = signEmailPreference({ userId: "user-1", enabled: false }, "secret");
    expect(verifyEmailPreference(token, "secret")).toEqual({ userId: "user-1", enabled: false });
    expect(verifyEmailPreference(token, "other")).toBeNull();
    expect(verifyEmailPreference(`${token}x`, "secret")).toBeNull();
    expect(verifyEmailPreference("not-a-token", "secret")).toBeNull();
    expect(preferenceResultHtml({ enabled: false, otherUrl: "https://mikrouli.link/on" })).toContain(
      "Expiry reminders are off"
    );
  });
});

describe("expiry display", () => {
  it("shows the printed-QR warning with the expiry date", () => {
    const expiresAt = "2026-11-01T12:00:00.000Z";
    const dateLabel = formatExpiryDate(expiresAt, "en-GB");
    expect(qrExpiryWarning(expiresAt, new Date("2026-10-19T00:00:00.000Z"), "en-GB", "free")).toBe(
      `This QR code stops working on ${dateLabel}. Printing it? Upgrade to keep it working.`
    );
    expect(formatExpiryDate(expiresAt, "en-GB", "UTC")).toBe("1 Nov 2026");
    expect(qrExpiryWarning(null, new Date(), "en-GB", "free")).toBeNull();
    expect(getLinkStatus(expiresAt, new Date("2026-10-19T00:00:00.000Z"), "en-GB").detail).toContain(
      dateLabel
    );
  });
});
