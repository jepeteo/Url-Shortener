export const PUBLIC_PAGES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/app", changeFrequency: "weekly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
  { path: "/imprint", changeFrequency: "yearly", priority: 0.3 },
  { path: "/abuse", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export function buildSitemapEntries(baseUrl, lastModified = new Date()) {
  const base = String(baseUrl || "https://mikrouli.link").replace(/\/$/, "");

  return PUBLIC_PAGES.map((page) => ({
    url: page.path === "/" ? base : `${base}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
