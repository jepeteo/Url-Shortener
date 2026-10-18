import { describe, expect, it } from "vitest";
import {
  appendCreatorToken,
  creatorCookieOptions,
  creatorTokenMatches,
  generateCreatorToken,
  hashCreatorToken,
  parseCreatorCookie,
} from "../lib/creatorToken";

describe("creator tokens", () => {
  it("matches only the token that was stored as a hash", () => {
    const token = generateCreatorToken();
    const other = generateCreatorToken();
    const cookie = appendCreatorToken(null, token);
    const hash = hashCreatorToken(token);

    expect(parseCreatorCookie(cookie)).toEqual([token]);
    expect(creatorTokenMatches(cookie, hash)).toBe(true);
    expect(creatorTokenMatches(cookie, hashCreatorToken(other))).toBe(false);
    expect(creatorTokenMatches(null, hash)).toBe(false);
    expect(creatorTokenMatches(cookie, null)).toBe(false);
  });

  it("keeps the cookie httpOnly", () => {
    expect(creatorCookieOptions().httpOnly).toBe(true);
    expect(creatorCookieOptions().sameSite).toBe("lax");
  });

  it("ignores a malformed cookie", () => {
    expect(parseCreatorCookie("not-base64url-json")).toEqual([]);
    expect(creatorTokenMatches("%%%", "abc")).toBe(false);
  });
});
