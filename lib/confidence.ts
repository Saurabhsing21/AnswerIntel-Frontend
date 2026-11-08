import type { Retest } from "@/lib/api/types";

/** How a re-test reads to the user. "too_early" is not a failure: the fix stays open until a re-test clearly shows it worked. */
export function retestVerdictLabel(verdict: Retest["verdict"]): { label: string; tone: "up" | "flat" | "down" } | null {
  if (verdict === "better") return { label: "Better, beyond normal variation", tone: "up" };
  if (verdict === "too_early") return { label: "No real change yet", tone: "flat" };
  if (verdict === "worse") return { label: "Worse", tone: "down" };
  return null;
}

const MAX_LABEL = 60;

/** A cited page as short link text: domain and path, no scheme, www, query or trailing slash. */
export function pageLabel(url: string): string {
  try {
    const u = new URL(url);
    const text = `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`;
    return text.length > MAX_LABEL ? `${text.slice(0, MAX_LABEL - 1)}…` : text;
  } catch {
    return url;
  }
}
