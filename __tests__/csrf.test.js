import { describe, expect, it } from "vitest";
import { validateCsrf } from "../lib/csrf";

function createRequest({ header, cookie } = {}) {
  return {
    headers: {
      get(name) {
        if (name === "x-csrf-token") {
          return header ?? null;
        }
        return null;
      },
    },
    cookies: {
      get(name) {
        if (name === "csrf-token" && cookie) {
          return { value: cookie };
        }
        return undefined;
      },
    },
  };
}

describe("validateCsrf", () => {
  it("accepts matching header and cookie", () => {
    const token = "a".repeat(64);
    expect(validateCsrf(createRequest({ header: token, cookie: token }))).toBe(true);
  });

  it("rejects missing or mismatched tokens", () => {
    const token = "a".repeat(64);
    expect(validateCsrf(createRequest({ header: token }))).toBe(false);
    expect(validateCsrf(createRequest({ cookie: token }))).toBe(false);
    expect(
      validateCsrf(createRequest({ header: token, cookie: `${token}x` }))
    ).toBe(false);
  });
});
