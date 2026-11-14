import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// The share card for every page without its own (blog posts have their covers), in the same style as those covers.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SeenLense: see how ChatGPT, Perplexity, Gemini and Claude recommend your brand";

export default async function Image() {
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
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>SeenLense</div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2.5, maxWidth: 1000 }}>
            See how AI recommends you, and who it picks instead
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: "#8a8a8a" }}>
            AI search visibility tracking for ChatGPT, Perplexity, Gemini and Claude · seenlense.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: bricolage, weight: 700, style: "normal" }] },
  );
}
