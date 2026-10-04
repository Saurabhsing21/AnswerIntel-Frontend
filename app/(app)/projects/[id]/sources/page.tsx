"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, EmptyState, PageHeader, Skeleton } from "@/components/app/ui";
import { useApi } from "@/lib/api/client";
import type { Source } from "@/lib/api/types";
import { SOURCE_LABELS } from "@/lib/format";
import { cx } from "@/lib/cx";

const GROUPS = [
  { key: "all", label: "All sources" },
  { key: "competitors", label: "Only with competitors" },
  { key: "both", label: "With both" },
  { key: "you", label: "Only with you" },
] as const;

export default function SourcesPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useApi<{ scan_id: number | null; sources: Source[] }>(`/projects/${id}/citations`);
  const [group, setGroup] = useState<(typeof GROUPS)[number]["key"]>("all");
  const sources = (data?.sources ?? []).filter((s) => group === "all" || s.group === group);
  const counts = Object.fromEntries(GROUPS.map((g) => [g.key, g.key === "all" ? data?.sources.length ?? 0 : (data?.sources ?? []).filter((s) => s.group === g.key).length]));

  return (
    <>
      <PageHeader title="Sources" description="The sites AI cites when it answers your buyers, and whether they show up next to you or your competitors." />
      <Card>
        <div className="flex gap-1 overflow-x-auto border-b border-line p-3" role="tablist" aria-label="Source group">
          {GROUPS.map((g) => (
            <button key={g.key} type="button" role="tab" aria-selected={group === g.key} onClick={() => setGroup(g.key)}
              className={cx("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] transition-colors", group === g.key ? "bg-ink text-white" : "text-ink-2 hover:bg-sunken")}>
              {g.label}
              <span className={cx("font-mono text-[11px]", group === g.key ? "text-white/60" : "text-faint")}>{counts[g.key]}</span>
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !sources.length ? (
          <EmptyState title="No sources here" body={data?.scan_id ? "Try another filter." : "Run a scan to see which sources AI cites."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="text-[11px] text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-2 font-normal">Source</th>
                  <th className="py-2 font-normal">Type</th>
                  <th className="py-2 font-normal">Citations</th>
                  <th className="py-2 font-normal">With you</th>
                  <th className="py-2 pr-5 font-normal">Recommending competitors</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.domain} className="border-b border-line last:border-0">
                    <td className="px-5 py-2.5">
                      <a href={s.urls[0]} target="_blank" rel="noreferrer noopener" className="font-medium underline-offset-2 hover:underline">{s.domain}</a>
                      {s.owner && <span className="ml-2 text-[11px] text-muted">{s.is_brand_owned ? "your site" : s.owner}</span>}
                    </td>
                    <td className="py-2.5"><span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{SOURCE_LABELS[s.source_type] ?? s.source_type}</span></td>
                    <td className="py-2.5 font-mono tabular-nums">{s.citations}</td>
                    <td className="py-2.5 font-mono tabular-nums">{s.with_you || <span className="text-faint">0</span>}</td>
                    <td className="py-2.5 pr-5">
                      <span className="flex flex-wrap gap-1">
                        {s.with_competitors.length ? s.with_competitors.map((c) => (
                          <span key={c.name} className="rounded-full border border-line-strong px-2 py-0.5 text-[11px]">{c.name} <span className="font-mono text-muted">{c.count}</span></span>
                        )) : <span className="text-faint">-</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
