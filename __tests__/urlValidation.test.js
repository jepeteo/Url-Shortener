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
});

describe("aliases", () => {
  it("validates alias format", () => {
    expect(isValidAlias("my-link")).toBe(true);
    expect(isValidAlias("ab")).toBe(false);
  });

  it("reserves system paths", () => {
    expect(isReservedAlias("api")).toBe(true);
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
});
