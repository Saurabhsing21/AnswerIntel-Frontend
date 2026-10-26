export const pct = (v: number | null | undefined) => (v == null ? "-" : `${Math.round(v * 100)}%`);

export const pts = (v: number | null | undefined) =>
  v == null ? null : `${v > 0 ? "+" : ""}${Math.round(v * 1000) / 10} pts`;

export const pos = (v: number | null | undefined) => (v == null ? "-" : `#${v.toFixed(1)}`);

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "";
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export const REPORT_LABELS = { weekly: "Weekly report", monthly: "Monthly report", manual: "Report" } as const;

export const CATEGORY_LABELS: Record<string, string> = {
  CATEGORY: "Category",
  COMPARISON: "Comparison",
  ALTERNATIVE: "Alternatives",
  USE_CASE: "Use case",
  PROBLEM: "Problem",
  BUYER_INTENT: "Buyer intent",
  COMPETITOR: "Competitor",
};

/** One colour per source type, used for its pill, bar and tile everywhere sources appear. */
export const SOURCE_COLORS: Record<string, string> = {
  brand_website: "#84a52a",
  competitor_website: "#e5484d",
  review_site: "#e59a0b",
  reddit: "#ff5700",
  news: "#2f6bff",
  blog: "#7a5af8",
  directory: "#0e9f9a",
  social: "#db2777",
  comparison: "#0891b2",
  documentation: "#64748b",
  other: "#a3a3a3",
};

export const SOURCE_LABELS: Record<string, string> = {
  brand_website: "Your website",
  competitor_website: "Competitor site",
  review_site: "Review site",
  reddit: "Reddit",
  news: "News",
  blog: "Blog",
  directory: "Directory",
  social: "Social",
  comparison: "Comparison",
  documentation: "Docs",
  other: "Other",
};
