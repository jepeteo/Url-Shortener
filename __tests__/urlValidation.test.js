import { describe, expect, it } from "vitest";
import {
  isValidUrl,
  isValidAlias,
  isReservedAlias,
  appendUtmParams,
} from "../lib/urlValidation";

describe("isValidUrl", () => {
  it("accepts https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("accepts http URLs", () => {
    expect(isValidUrl("http://example.com/path")).toBe(true);
  });

  it("rejects javascript URLs", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data URLs", () => {
    expect(isValidUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("rejects localhost", () => {
    expect(isValidUrl("http://localhost:3000")).toBe(false);
  });

  it("rejects decimal IP hostnames", () => {
    expect(isValidUrl("http://2130706433")).toBe(false);
  });

  it("rejects private IPv4 addresses", () => {
    expect(isValidUrl("http://10.0.0.1")).toBe(false);
    expect(isValidUrl("http://192.168.1.1")).toBe(false);
    expect(isValidUrl("http://169.254.169.254")).toBe(false);
  });

  it("rejects private IPv6 addresses", () => {
    expect(isValidUrl("http://[::1]/")).toBe(false);
    expect(isValidUrl("http://[fd00::1]/")).toBe(false);
  });

  it("rejects empty or null input", () => {
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
  });
});

describe("aliases", () => {
  it("validates alias format", () => {
    expect(isValidAlias("my-link")).toBe(true);
    expect(isValidAlias("ab")).toBe(false);
    expect(isValidAlias("")).toBe(false);
    expect(isValidAlias(null)).toBe(false);
  });

  it("reserves system paths", () => {
    expect(isReservedAlias("api")).toBe(true);
    expect(isReservedAlias("auth")).toBe(true);
    expect(isReservedAlias("dashboard")).toBe(true);
    expect(isReservedAlias("analytics")).toBe(true);
    expect(isReservedAlias("pricing")).toBe(true);
    expect(isReservedAlias("app")).toBe(true);
    expect(isReservedAlias("admin")).toBe(true);
    expect(isReservedAlias("custom")).toBe(false);
  });
});

describe("appendUtmParams", () => {
  it("appends UTM parameters", () => {
    const result = appendUtmParams("https://example.com", {
      source: "newsletter",
      medium: "email",
      campaign: "launch",
    });
    expect(result).toContain("utm_source=newsletter");
    expect(result).toContain("utm_medium=email");
    expect(result).toContain("utm_campaign=launch");
  });

  it("appends term and content params", () => {
    const result = appendUtmParams("https://example.com", {
      source: "newsletter",
      term: "keyword",
      content: "banner",
    });
    expect(result).toContain("utm_term=keyword");
    expect(result).toContain("utm_content=banner");
  });
});
