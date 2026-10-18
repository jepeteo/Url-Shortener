import { NextResponse } from "next/server";

export const TEMPORARY_REDIRECT_STATUS = 307;

export function temporaryRedirect(url) {
  const response = NextResponse.redirect(url, {
    status: TEMPORARY_REDIRECT_STATUS,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
  return response;
}
