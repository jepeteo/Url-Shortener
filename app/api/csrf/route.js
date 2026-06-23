import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const csrfToken = generateCsrfToken();
  await setCsrfCookie(csrfToken);
  return NextResponse.json({ csrfToken });
}
