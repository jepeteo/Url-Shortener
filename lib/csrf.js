import crypto from "crypto";
import { cookies } from "next/headers";

export const CSRF_COOKIE_NAME = "csrf-token";
export const CSRF_HEADER_NAME = "x-csrf-token";

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCsrf(request) {
  const header = request.headers.get(CSRF_HEADER_NAME);
  const cookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!header || !cookie || header.length !== cookie.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(header), Buffer.from(cookie));
  } catch {
    return false;
  }
}

export async function setCsrfCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
