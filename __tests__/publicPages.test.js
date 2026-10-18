import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { OPERATOR } from "../lib/operator";
import { buildSitemapEntries, PUBLIC_PAGES } from "../lib/publicPages";
import { buildRobots, ROBOTS_DISALLOW } from "../lib/robotsPolicy";

describe("operator", () => {
  it("matches the Companies House facts", () => {
    expect(OPERATOR.legalName).toBe("MTX STUDIO LTD");
    expect(OPERATOR.companyNumber).toBe("15856187");
    expect(OPERATOR.registeredIn).toBe("England and Wales");
    expect(OPERATOR.register).toBe("Companies House");
    expect(OPERATOR.registeredOffice).toEqual([
      "Bartle House, 9 Oxford Court",
      "Manchester",
      "England",
      "M2 3WQ",
    ]);
    expect(OPERATOR.directors).toEqual(["Christos Mentis", "Theodoros Mentis"]);
    expect(OPERATOR.vatRegistered).toBe(false);
    expect(OPERATOR.icoNumber).toBeNull();
    expect(OPERATOR.contactEmail).toBe("hello@mikrouli.link");
    expect(OPERATOR.abuseEmail).toBe("abuse@mikrouli.link");
    expect(OPERATOR.governingLaw).toBe("England and Wales");
    expect(OPERATOR.effectiveDate).toBe("18 October 2026");
  });
});

describe("sitemap", () => {
  it("lists public marketing pages and leaves out auth", () => {
    const entries = buildSitemapEntries("https://mikrouli.link/", new Date("2026-10-18"));
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://mikrouli.link");
    expect(urls).toContain("https://mikrouli.link/pricing");
    expect(urls).toContain("https://mikrouli.link/imprint");
    expect(urls).toContain("https://mikrouli.link/abuse");
    expect(urls).toContain("https://mikrouli.link/privacy");
    expect(urls).toContain("https://mikrouli.link/terms");
    expect(urls).toContain("https://mikrouli.link/contact");
    expect(urls.some((url) => url.includes("/auth"))).toBe(false);
    expect(urls.some((url) => url.includes("/impressum"))).toBe(false);
    expect(urls.some((url) => url.includes("/dashboard"))).toBe(false);
    expect(PUBLIC_PAGES.map((page) => page.path)).not.toContain("/auth/signin");
  });
});

describe("robots", () => {
  it("allows marketing pages and blocks private routes", () => {
    const robots = buildRobots("https://mikrouli.link");
    expect(robots.sitemap).toBe("https://mikrouli.link/sitemap.xml");
    expect(robots.rules.allow).toBe("/");
    expect(ROBOTS_DISALLOW).toEqual(
      expect.arrayContaining(["/api/", "/auth/", "/dashboard", "/analytics", "/mtxadmin"])
    );
    for (const path of ["/pricing", "/imprint", "/abuse", "/privacy", "/terms", "/contact"]) {
      expect(ROBOTS_DISALLOW.some((rule) => path.startsWith(rule.replace(/\/$/, "")))).toBe(
        false
      );
    }
  });
});

describe("legal pages", () => {
  it("no longer uses the placeholder templates", () => {
    for (const file of ["app/privacy/page.js", "app/terms/page.js", "app/imprint/page.js"]) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("starting template");
      expect(source).not.toContain("[EFFECTIVE DATE]");
      expect(source).not.toContain("[COMPANY");
      expect(source).toContain("OPERATOR");
    }
  });

  it("does not say that no ICO registration number is held", () => {
    const files = [
      "app/privacy/page.js",
      "app/terms/page.js",
      "app/imprint/page.js",
      "app/contact/page.js",
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/no ICO/i);
      expect(source).not.toMatch(/do not yet hold an ICO/i);
      expect(source).not.toMatch(/registration number is held/i);
    }
  });

  it("shows an ICO number on the imprint only when one is set", () => {
    const source = readFileSync("app/imprint/page.js", "utf8");
    expect(source).toContain("OPERATOR.icoNumber");
    expect(source).toContain("ICO registration number:");
    expect(source).toContain("not registered for VAT");
  });
});
