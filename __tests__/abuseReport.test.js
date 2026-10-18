import { describe, expect, it } from "vitest";
import {
  ABUSE_REPORT_RECEIVED,
  absoluteShortUrl,
  isReportableUrl,
  linkNotFoundTarget,
  parseAbuseReport,
} from "../lib/abuseReport";
import { abuseReportTemplate } from "../lib/email/templates/abuse-report";
import { RATE_LIMITS } from "../lib/rateLimit";

describe("parseAbuseReport", () => {
  it("accepts a URL, a known reason, and an optional email", () => {
    expect(
      parseAbuseReport({
        url: "https://mikrouli.link/phish",
        reason: "phishing",
        reporterEmail: "reporter@example.com",
        reasonLabel: "<script>",
      })
    ).toEqual({
      report: {
        url: "https://mikrouli.link/phish",
        reason: "phishing",
        reasonLabel: "Phishing or fraud",
        reporterEmail: "reporter@example.com",
      },
    });
  });

  it("allows a blank reporter email", () => {
    const parsed = parseAbuseReport({
      url: "https://example.com/bad",
      reason: "spam",
      reporterEmail: "  ",
    });
    expect(parsed.report.reporterEmail).toBeNull();
  });

  it("rejects bad URLs, unknown reasons, and bad emails", () => {
    expect(parseAbuseReport({ url: "javascript:alert(1)", reason: "phishing" }).error).toBeTruthy();
    expect(parseAbuseReport({ url: "https://example.com", reason: "nope" }).error).toBeTruthy();
    expect(
      parseAbuseReport({
        url: "https://example.com",
        reason: "malware",
        reporterEmail: "not-an-email",
      }).error
    ).toBeTruthy();
    expect(isReportableUrl("https://example.com\nBcc: evil")).toBe(false);
  });
});

describe("link reporting helpers", () => {
  it("builds a not-found URL that carries the short code", () => {
    const target = linkNotFoundTarget("https://mikrouli.link/abc", "abc");
    expect(target.pathname).toBe("/link-not-found");
    expect(target.searchParams.get("code")).toBe("abc");
  });

  it("ignores a short code that is not a safe path segment", () => {
    const target = linkNotFoundTarget("https://mikrouli.link/../admin", "../admin");
    expect(target.search).toBe("");
    expect(absoluteShortUrl("../admin", "https://mikrouli.link")).toBeNull();
    expect(absoluteShortUrl("summer", "https://mikrouli.link/")).toBe(
      "https://mikrouli.link/summer"
    );
  });
});

describe("abuse report email", () => {
  it("escapes the reported URL", () => {
    const { html, text } = abuseReportTemplate({
      url: "https://evil.example/?q=<script>alert(1)</script>",
      reasonLabel: "Phishing or fraud",
      reporterEmail: null,
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(text).toContain("Not provided");
  });
});

describe("abuse limits", () => {
  it("rate limits abuse reports", () => {
    expect(RATE_LIMITS.abuse.limit).toBeGreaterThan(0);
    expect(RATE_LIMITS.abuse.windowMs).toBeGreaterThan(0);
    expect(ABUSE_REPORT_RECEIVED.length).toBeGreaterThan(0);
  });
});
