import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

function run(path) {
  return middleware(new NextRequest(new URL(path, "http://localhost")));
}

describe("middleware reserved routes", () => {
  it("rewrites a short code", () => {
    const response = run("/abc123");
    expect(response.headers.get("x-middleware-rewrite")).toContain("/api/abc123");
  });

  it("does not rewrite reserved or two-letter paths", () => {
    for (const path of ["/imprint", "/impressum", "/abuse", "/el", "/en", "/blog"]) {
      expect(run(path).headers.get("x-middleware-rewrite")).toBeNull();
    }
  });
});
