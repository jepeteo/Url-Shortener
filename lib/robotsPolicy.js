export const ROBOTS_DISALLOW = [
  "/api/",
  "/auth/",
  "/dashboard",
  "/analytics",
  "/mtxadmin",
];

export function buildRobots(baseUrl) {
  const base = String(baseUrl || "https://mikrouli.link").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ROBOTS_DISALLOW,
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
