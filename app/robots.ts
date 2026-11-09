import type { MetadataRoute } from "next";
import { PUBLIC_URL } from "@/lib/urls";

// Every crawler is welcome on the public site, AI ones included (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot,
// Google-Extended): being read by them is the point. The dashboard and the API are private.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/projects", "/workspaces", "/account", "/subscribe"] },
    sitemap: `${PUBLIC_URL}/sitemap.xml`,
    host: PUBLIC_URL,
  };
}
