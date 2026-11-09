import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { FREE_CHECK } from "@/lib/flags";
import { PUBLIC_URL } from "@/lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const pages = ["", "/pricing", "/blog", ...(FREE_CHECK ? ["/check"] : []), "/terms", "/privacy", "/refunds"];
  return [
    ...pages.map((p) => ({ url: `${PUBLIC_URL}${p}`, lastModified: p === "/blog" && posts[0] ? posts[0].date : undefined })),
    ...posts.map((p) => ({ url: `${PUBLIC_URL}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
