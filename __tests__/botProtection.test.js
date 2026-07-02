import { describe, expect, it } from "vitest";
import { isHoneypotTriggered } from "../lib/botProtection";

describe("isHoneypotTriggered", () => {
  it("returns false when honeypot is empty", () => {
    expect(isHoneypotTriggered({ name: "Test", website: "" })).toBe(false);
    expect(isHoneypotTriggered({ name: "Test" })).toBe(false);
  });

  it("returns true when honeypot is filled", () => {
    expect(isHoneypotTriggered({ website: "https://spam.example" })).toBe(true);
    expect(isHoneypotTriggered({ website: "  bot  " })).toBe(true);
  });
});
