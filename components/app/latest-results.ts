"use client";

import { useApi } from "@/lib/api/client";
import type { Scan, ScanResults } from "@/lib/api/types";

/** Results of the newest scan that produced data (completed or partial). */
export function useLatestResults(projectId: string) {
  const { data: scans } = useApi<Scan[]>(`/projects/${projectId}/scans`);
  // The latest full scan: a re-test only asks one opportunity's prompts, so it never stands in for "latest results".
  const latest = scans?.find((s) => s.kind !== "retest" && (s.status === "completed" || s.status === "partial")) ?? null;
  const { data: results, loading } = useApi<ScanResults>(latest ? `/projects/${projectId}/scans/${latest.id}/results` : null);
  return { scan: latest, results, loading: loading || !scans };
}
