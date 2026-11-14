import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPost, getPosts } from "@/lib/blog";

// The post's cover: shown at the top of the post, on the blog index, and as the share card on social sites.
// Left: the headline and a one-line takeaway. Right: an "at a glance" card with the post's key numbers (front matter `glance`).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Seenlense blog post cover";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

const LIME = "#d7f36b";
const INK = "#141414";

/** The Seenlense mascot head, the same drawing as components/ui/logo.tsx. */
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path d="M19.5 8.2l2.6-3.6" stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="23.4" cy="3.6" r="2.4" fill={LIME} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="16" cy="18" rx="14" ry="12.5" fill={LIME} />
      <rect x="6" y="13.2" width="20" height="8.6" rx="4.3" fill={INK} />
      <rect x="10.6" y="15.4" width="2.4" height="4.2" rx="1.2" fill="#ffffff" />
      <rect x="19" y="15.4" width="2.4" height="4.2" rx="1.2" fill="#ffffff" />
      <ellipse cx="11" cy="9.6" rx="3.2" ry="1.6" fill="#ffffff" fillOpacity="0.45" />
    </svg>
  );
}

/** First sentence of the description, so the cover carries one takeaway rather than a paragraph. */
const takeaway = (text: string) => (text.match(/^.*?[.!?](\s|$)/)?.[0] ?? text).trim();

const monthYear = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  const bricolage = await readFile(path.join(process.cwd(), "assets/fonts/bricolage-grotesque-700.woff"));
  const glance = post?.glance ?? [];
  const headline = post?.cover ?? "Seenlense journal";
  const long = headline.length > 48;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "radial-gradient(circle at 0% 100%, rgba(215,243,107,0.16), rgba(20,20,20,0) 45%), radial-gradient(circle at 100% 0%, rgba(215,243,107,0.10), rgba(20,20,20,0) 40%), #141414",
          color: "#fafafa",
          fontFamily: "Bricolage",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 0 56px 64px", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Mark size={46} />
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>Seenlense</div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: 3, color: LIME, textTransform: "uppercase" }}>
            {post?.category ?? "Guide"}
          </div>
          <div style={{ marginTop: 16, fontSize: long ? 54 : 64, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2.2 }}>{headline}</div>
          {post && (
            <div style={{ marginTop: 22, fontSize: 22, lineHeight: 1.35, color: "#a3a3a3", maxWidth: 560 }}>{takeaway(post.description)}</div>
          )}
          <div style={{ marginTop: 30, display: "flex" }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: INK, background: LIME, borderRadius: 999, padding: "10px 22px" }}>
              {post ? `Updated ${monthYear(post.updated)}` : "seenlense.com/blog"}
            </div>
          </div>
        </div>

        {glance.length === 0 && (
          <div style={{ position: "absolute", top: 150, right: 70, display: "flex", transform: "rotate(-8deg)" }}>
            <Mark size={330} />
          </div>
        )}

        {glance.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 150,
              left: 690,
              width: 600,
              display: "flex",
              flexDirection: "column",
              padding: "28px 30px",
              borderRadius: 24,
              background: "#fafafa",
              color: INK,
              transform: "rotate(-4deg)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>At a glance</div>
              <Mark size={34} />
            </div>
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
              {glance.map((g, i) => (
                <div
                  key={g.label}
                  style={{
                    width: 262,
                    display: "flex",
                    flexDirection: "column",
                    padding: "14px 18px",
                    borderRadius: 16,
                    border: "1px solid #e5e5e5",
                    background: i === 0 ? "#f3fbd2" : "#ffffff",
                  }}
                >
                  <div style={{ fontSize: 16, color: "#737373" }}>{g.label}</div>
                  <div style={{ marginTop: 4, fontSize: g.value.length > 9 ? 30 : 40, fontWeight: 700, letterSpacing: -1.2 }}>{g.value}</div>
                  {g.note && <div style={{ marginTop: 2, fontSize: 15, color: "#737373" }}>{g.note}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: bricolage, weight: 700, style: "normal" }] },
  );
}
