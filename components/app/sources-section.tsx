"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useRefreshOnScan } from "@/components/app/project-context";
import { Card, EmptyState, Segmented, Skeleton } from "@/components/app/ui";
import { useApi } from "@/lib/api/client";
import type { Source } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { BrandTile } from "@/components/app/brand-tile";
import { askUpgrade, ProBadge } from "@/components/app/pro-lock";
import { brandColor } from "@/lib/brand";
import { SOURCE_COLORS, SOURCE_LABELS } from "@/lib/format";

const colorOf = (type: string) => SOURCE_COLORS[type] ?? SOURCE_COLORS.other;

/** Citations by source type, as one stacked bar: where AI gets its answers for this market. */
function SourceMix({ sources }: { sources: Source[] }) {
  const byType = new Map<string, number>();
  for (const s of sources) byType.set(s.source_type, (byType.get(s.source_type) ?? 0) + s.citations);
  const total = [...byType.values()].reduce((a, b) => a + b, 0) || 1;
  const rows = [...byType].sort((a, b) => b[1] - a[1]);
  return (
    <Card title="Where AI gets its answers" subtitle="Share of all citations in the latest scan, by type of site" className="mb-4">
      <div className="space-y-4 p-5">
        <div className="flex h-3 overflow-hidden rounded-full bg-sunken" role="img" aria-label={rows.map(([t, n]) => `${SOURCE_LABELS[t] ?? t} ${Math.round((n / total) * 100)}%`).join(", ")}>
          {rows.map(([t, n]) => <span key={t} className="h-full border-r-2 border-surface last:border-0" style={{ width: `${(n / total) * 100}%`, background: colorOf(t) }} />)}
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
          {rows.map(([t, n]) => (
            <li key={t} className="flex items-center gap-2 text-[12px]">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: colorOf(t) }} />
              <span className="truncate text-ink-2">{SOURCE_LABELS[t] ?? t}</span>
              <span className="ml-auto font-mono tabular-nums text-ink">{Math.round((n / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

const GROUPS = [
  { key: "all", label: "All sources" },
  { key: "competitors", label: "Only with competitors" },
  { key: "both", label: "With both" },
  { key: "you", label: "Only with you" },
] as const;

/** The sites AI cites, and whether you or your competitors appear next to them. Part of the Competitors page. */
export function SourcesSection() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, reload } = useApi<{ scan_id: number | null; sources: Source[] }>(`/projects/${id}/citations`);
  useRefreshOnScan(reload);
  const [group, setGroup] = useState<(typeof GROUPS)[number]["key"]>("all");
  const all = data?.sources ?? [];
  const sources = all.filter((s) => group === "all" || s.group === group);
  const counts = Object.fromEntries(GROUPS.map((g) => [g.key, g.key === "all" ? all.length : all.filter((s) => s.group === g.key).length]));
  const maxCitations = Math.max(1, ...all.map((s) => s.citations));
  const totalCitations = all.reduce((sum, s) => sum + s.citations, 0);
  const rivals = [...new Set(all.flatMap((s) => s.with_competitors.map((c) => c.name)))];

  return (
    <>
      <div id="sources" className="mt-8 mb-4 scroll-mt-24">
        <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em]">Sources AI cites</h2>
        <p className="mt-0.5 text-[13px] text-muted">
          {all.length} sites, {totalCitations} citations. {counts.competitors ? `${counts.competitors} cite only your competitors: get listed there first.` : "Where you and your competitors show up."}
        </p>
      </div>
      {all.length > 0 && <SourceMix sources={all} />}
      <Card>
        <div className="overflow-x-auto border-b border-line p-3">
          <Segmented label="Source group" value={group} onChange={setGroup} options={GROUPS.map((g) => ({ key: g.key, label: g.label, count: counts[g.key] }))} />
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
                  <th className="py-2 font-normal">Includes you</th>
                  <th className="py-2 pr-5 font-normal">Recommending competitors</th>
                </tr>
              </thead>
              <tbody>
                {sources.filter((s) => !s.locked).map((s) => (
                  <tr key={s.domain} className={cx("border-b border-line transition-colors last:border-0 hover:bg-[#fbfbfa]", s.is_brand_owned && "bg-mark-soft/30")}>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <BrandTile name={s.domain} color={colorOf(s.source_type)} size={32} website={s.domain} />
                        <span className="min-w-0">
                          <a href={s.urls[0]} target="_blank" rel="noreferrer noopener" className="block truncate font-medium underline-offset-2 hover:underline">{s.domain}</a>
                          <span className="block text-[11px] text-muted">{s.is_brand_owned ? "Your website" : s.owner ?? `${s.urls.length} page${s.urls.length === 1 ? "" : "s"} cited`}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: `${colorOf(s.source_type)}1f`, color: colorOf(s.source_type) }}>
                        {SOURCE_LABELS[s.source_type] ?? s.source_type}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-2">
                        <span className="w-8 font-mono tabular-nums">{s.citations}</span>
                        <span className="h-2 w-24 overflow-hidden rounded-full bg-sunken">
                          <span className="block h-full rounded-full" style={{ width: `${Math.max(4, (s.citations / maxCitations) * 100)}%`, background: colorOf(s.source_type) }} />
                        </span>
                      </span>
                    </td>
                    <td className="py-3">
                      {s.with_you ? (
                        <span className="flex items-center gap-2" title={`${s.with_you} of ${s.citations} citations are in answers that mention you`}>
                          <span className="h-2 w-16 overflow-hidden rounded-full bg-sunken">
                            <span className="block h-full rounded-full bg-mark-strong" style={{ width: `${Math.round((s.with_you / s.citations) * 100)}%` }} />
                          </span>
                          <span className="font-mono text-[12px] tabular-nums text-ink">{Math.round((s.with_you / s.citations) * 100)}%</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-down-soft px-2 py-0.5 text-[11px] font-medium text-down-ink">Missing</span>
                      )}
                    </td>
                    <td className="py-3 pr-5">
                      <span className="flex flex-wrap gap-1">
                        {s.with_competitors.length ? s.with_competitors.map((c) => (
                          <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[11px]">
                            <span className="size-2 rounded-full" style={{ background: brandColor(c.name, false, rivals) }} />
                            {c.name} <span className="font-mono text-muted">{c.count}</span>
                          </span>
                        )) : <span className="text-faint">-</span>}
                      </span>
                    </td>
                  </tr>
                ))}
                {sources.some((s) => s.locked) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => askUpgrade("Every source AI cites, with who it recommends, is on paid plans.")}
                        className="flex w-full items-center gap-3 rounded-[12px] border border-dashed border-line-strong px-4 py-3 text-left text-[13px] text-muted transition-colors hover:border-ink"
                      >
                        <span className="flex gap-1.5" aria-hidden>
                          {(sources.some((s) => s.preview) ? sources.filter((s) => s.preview) : sources.filter((s) => s.locked).slice(0, 3)).map((s, i) =>
                            s.preview ? (
                              // eslint-disable-next-line @next/next/no-img-element -- an 8px data URI, no optimisation to gain
                              <img key={i} src={s.preview} alt="" className="size-7 rounded-[8px] border border-line bg-white object-cover blur-[2.5px]" />
                            ) : (
                              <span key={i} className="size-7 rounded-[8px] bg-sunken" />
                            ),
                          )}
                        </span>
                        Upgrade to see {sources.filter((s) => s.locked).length} more sources AI cites
                        <ProBadge className="ml-auto" />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
