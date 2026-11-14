import type { MetadataRoute } from "next";
import { AUTHOR_PAGES, getPosts } from "@/lib/blog";
import { FREE_CHECK } from "@/lib/flags";
import { PUBLIC_URL } from "@/lib/urls";

// When each page's content last changed: bump the date when you edit a page, so crawlers know to come back.
const PAGES: Record<string, string> = {
  "": "2026-11-14",
  "/pricing": "2026-11-12",
  "/about": "2026-11-14",
  "/methodology": "2026-11-14",
  ...(FREE_CHECK ? { "/check": "2026-11-14" } : {}),
  "/terms": "2026-10-24",
  "/privacy": "2026-10-24",
  "/refunds": "2026-10-24",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const latestPost = posts.map((p) => p.date).sort().at(-1);
  return [
    ...Object.entries(PAGES).map(([p, date]) => ({ url: `${PUBLIC_URL}${p}`, lastModified: date })),
    ...(latestPost ? [{ url: `${PUBLIC_URL}/blog`, lastModified: latestPost }] : []),
    ...Object.values(AUTHOR_PAGES).map((p) => ({ url: `${PUBLIC_URL}${p}`, lastModified: latestPost })),
    ...posts.map((p) => ({ url: `${PUBLIC_URL}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
