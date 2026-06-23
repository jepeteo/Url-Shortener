import { NextResponse } from "next/server";

const RESERVED_PATHS = new Set([
  "app",
  "api",
  "auth",
  "dashboard",
  "analytics",
  "pricing",
  "admin",
  "terms",
  "privacy",
  "link-not-found",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "og-image.png",
]);

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

  if (RESERVED_PATHS.has(segment.toLowerCase())) {
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
