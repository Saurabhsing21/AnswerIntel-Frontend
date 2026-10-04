"use client";

import { Lightbulb } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, EmptyState, ErrorBanner, ImpactPill, PageHeader, Skeleton } from "@/components/app/ui";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Opportunity } from "@/lib/api/types";
import { cx } from "@/lib/cx";

const STATUSES: { key: Opportunity["status"]; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Done" },
  { key: "dismissed", label: "Dismissed" },
];
const TYPE_LABELS: Record<string, string> = {
  COMPETITOR_GAP: "Competitor gap",
  CITATION_GAP: "Citation gap",
  CONTENT_GAP: "Content gap",
  POSITIONING_GAP: "Positioning gap",
  COMPARISON_GAP: "Comparison gap",
};

export default function OpportunitiesPage() {
  const { id } = useParams<{ id: string }>();
  const { data, setData, loading } = useApi<Opportunity[]>(`/projects/${id}/opportunities`);
  const [filter, setFilter] = useState<"active" | Opportunity["status"]>("active");
  const [error, setError] = useState("");

  async function setStatus(o: Opportunity, status: Opportunity["status"]) {
    try {
      const updated = await api<Opportunity>(`/projects/${id}/opportunities/${o.id}`, { method: "PATCH", json: { status } });
      setData((all) => (all ?? []).map((x) => (x.id === o.id ? updated : x)));
    } catch (e) {
      setError((e as ApiError).message);
    }
  }

  const rows = (data ?? []).filter((o) => (filter === "active" ? o.status === "open" || o.status === "in_progress" : o.status === filter));
  const tabs = [{ key: "active" as const, label: "To do" }, ...STATUSES.slice(2)];

  return (
    <>
      <PageHeader title="Opportunities" description="Gaps found in your latest scan, ranked by impact, each backed by the prompts and sources that show it." />
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      <div className="mb-4 flex gap-1" role="tablist" aria-label="Status">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={filter === t.key} onClick={() => setFilter(t.key)}
            className={cx("rounded-full px-3 py-1 text-[12px] transition-colors", filter === t.key ? "bg-ink text-white" : "text-ink-2 hover:bg-sunken")}>
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : !rows.length ? (
        <Card><EmptyState icon={<Lightbulb size={28} />} title={data?.length ? "Nothing here" : "No opportunities yet"} body={data?.length ? "Try another status." : "Run a scan to find where AI picks competitors over you."} /></Card>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => (
            <Card key={o.id} className={cx(o.status === "dismissed" && "opacity-60")}>
              <div id={`opp-${o.id}`} className="scroll-mt-24 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <ImpactPill impact={o.impact} />
                  <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{TYPE_LABELS[o.type] ?? o.type}</span>
                  <span className="text-[11px] text-faint">{Math.round(o.confidence * 100)}% confidence</span>
                  <label className="ml-auto">
                    <span className="sr-only">Status</span>
                    <select value={o.status} onChange={(e) => setStatus(o, e.target.value as Opportunity["status"])}
                      className="h-8 rounded-full border border-line-strong bg-surface px-3 text-[12px] outline-none focus:border-ink">
                      {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </label>
                </div>
                <h2 className="mt-3 text-[16px] font-medium">{o.title}</h2>
                <p className="mt-1 text-[13px] text-muted">{o.description}</p>
                <div className="mt-4 rounded-[12px] bg-page px-4 py-3 text-[13px]">
                  <span className="font-medium">Suggested action: </span>{o.recommended_action}
                </div>
                {(o.evidence.prompts?.length || o.evidence.domains?.length) ? (
                  <details className="mt-3 text-[13px]">
                    <summary className="cursor-pointer text-muted hover:text-ink">
                      Evidence: {o.evidence.prompts ? `${o.evidence.prompts.length} prompts` : `${o.evidence.domains!.length} sources`}
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {o.evidence.prompts?.map((p) => <li key={p} className="rounded-[8px] border border-line px-3 py-1.5">{p}</li>)}
                      {o.evidence.domains?.map((d) => <li key={d.domain} className="flex rounded-[8px] border border-line px-3 py-1.5">{d.domain}<span className="ml-auto font-mono text-muted">{d.citations} citations</span></li>)}
                    </ul>
                  </details>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
