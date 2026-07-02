export const RESERVED_PATHS = new Set([
  "api",
  "auth",
  "dashboard",
  "analytics",
  "pricing",
  "app",
  "admin",
  "mtxadmin",
  "contact",
  "terms",
  "privacy",
  "link-not-found",
  "error",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "og-image.png",
]);

export function isReservedPath(segment) {
  return RESERVED_PATHS.has(segment.toLowerCase());
}
