import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPost, getPosts } from "@/lib/blog";

// The post's cover: shown at the top of the post, on the blog index, and as the share card on social sites.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Seenlense blog post cover";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  // The site's display font (Bricolage Grotesque, OFL), so covers match the page headings.
  const bricolage = await readFile(path.join(process.cwd(), "assets/fonts/bricolage-grotesque-700.woff"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          background: "radial-gradient(circle at 88% 12%, rgba(215,243,107,0.22), rgba(20,20,20,0) 42%), #141414",
          color: "#fafafa",
          fontFamily: "Bricolage",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#262626", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 24, height: 24, borderRadius: 999, border: "3px solid #fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 9, height: 9, borderRadius: 999, background: "#d7f36b" }} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>Seenlense</div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex" }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#141414", background: "#d7f36b", borderRadius: 999, padding: "8px 20px" }}>
              {post?.category ?? "Guide"}
            </div>
          </div>
          <div style={{ marginTop: 28, fontSize: 72, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2.5, maxWidth: 1000 }}>
            {post?.title ?? "Seenlense journal"}
          </div>
          <div style={{ marginTop: 28, fontSize: 24, color: "#8a8a8a" }}>seenlense.com/blog</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: bricolage, weight: 700, style: "normal" }] },
  );
}
