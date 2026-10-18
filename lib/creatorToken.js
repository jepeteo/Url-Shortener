import crypto from "crypto";

export const CREATOR_COOKIE_NAME = "mk_creator";
const MAX_TOKENS = 30;

export function generateCreatorToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashCreatorToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function parseCreatorCookie(value) {
  if (!value || typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((token) => typeof token === "string" && token.length > 0)
      .slice(-MAX_TOKENS);
  } catch {
    return [];
  }
}

export function serializeCreatorCookie(tokens) {
  const trimmed = tokens.filter((token) => typeof token === "string" && token).slice(-MAX_TOKENS);
  return Buffer.from(JSON.stringify(trimmed), "utf8").toString("base64url");
}

export function appendCreatorToken(cookieValue, token) {
  const tokens = parseCreatorCookie(cookieValue);
  tokens.push(token);
  return serializeCreatorCookie(tokens);
}

export function creatorTokenMatches(cookieValue, tokenHash) {
  if (!tokenHash || typeof tokenHash !== "string") {
    return false;
  }

  const tokens = parseCreatorCookie(cookieValue);
  return tokens.some((token) => {
    const hash = hashCreatorToken(token);
    if (hash.length !== tokenHash.length) {
      return false;
    }
    try {
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(tokenHash));
    } catch {
      return false;
    }
  });
}

export function creatorCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  };
}
