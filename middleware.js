import { NextResponse } from "next/server";
import { isReservedPath } from "@/lib/reservedPaths";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segment = pathname.slice(1);
  if (!segment || segment.includes("/")) {
    return NextResponse.next();
  }

  if (isReservedPath(segment)) {
    return NextResponse.next();
  }

  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(segment)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`/api/${segment}`, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
