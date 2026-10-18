import { buildSitemapEntries } from "@/lib/publicPages";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mikrouli.link";
  return buildSitemapEntries(baseUrl);
}
