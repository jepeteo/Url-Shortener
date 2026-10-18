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
  "imprint",
  "impressum",
  "abuse",
  "link-not-found",
  "error",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "og-image.png",
  // Upcoming public routes. Reserved now so they cannot be issued as short codes.
  "qr-code-generator",
  "utm-builder",
  "blog",
  // Locale prefixes. Middleware only rewrites a single 3–32 character segment,
  // so /el and /en never reach the short-link handler. They are reserved anyway
  // so a later alias-length change cannot hand them out as custom aliases.
  "el",
  "en",
]);

export function isReservedPath(segment) {
  return RESERVED_PATHS.has(segment.toLowerCase());
}
