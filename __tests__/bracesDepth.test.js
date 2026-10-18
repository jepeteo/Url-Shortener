import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const braces = require("braces");

describe("patched braces nesting cap", () => {
  it("still expands ordinary patterns", () => {
    expect(braces("a{b,c}", { expand: true })).toEqual(["ab", "ac"]);
  });

  it("rejects nesting deep enough to overflow the stack", () => {
    const pattern = "{".repeat(200) + "a" + "}".repeat(200);
    expect(() => braces(pattern)).toThrow(/max depth/);
    expect(() => braces(pattern, { expand: true })).toThrow(/max depth/);
  });
});
