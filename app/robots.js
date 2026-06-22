export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/admin"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || "https://mikrouli.link"}/sitemap.xml`,
  };
}
