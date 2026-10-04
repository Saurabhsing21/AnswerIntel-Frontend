"use client";

import { ArrowRight, ChartLine } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { EngineIcon } from "@/components/product/engine-icon";
import { ResponseDrawer } from "@/components/app/response-drawer";
import { isActive, ScanBanner } from "@/components/app/scan-banner";
import { TrendChart } from "@/components/app/trend-chart";
import { Card, Delta, EmptyState, ErrorBanner, ImpactPill, PageHeader, Skeleton, VerdictPill } from "@/components/app/ui";
import { useApi } from "@/lib/api/client";
import type { Dashboard, MetricKey } from "@/lib/api/types";
import { pct, pos, timeAgo } from "@/lib/format";
import { cx } from "@/lib/cx";

const KPIS: { key: MetricKey; label: string; help: string }[] = [
  { key: "mention_rate", label: "AI visibility", help: "Answers that mention you" },
  { key: "recommendation_rate", label: "Recommendation rate", help: "Answers that tell buyers to pick you" },
  { key: "share_of_voice", label: "Share of voice", help: "Your share of all recommendations" },
  { key: "citation_rate", label: "Citation rate", help: "Answers citing your own site" },
];

export default function OverviewPage() {
  const { id } = useParams<{ id: string }>();
  const [openResponse, setOpenResponse] = useState<number | null>(null);
  const { data, error, loading, reload } = useApi<Dashboard>(`/projects/${id}/dashboard`, (d) => (isActive(d?.latest_scan) ? 2000 : undefined));
  const scanning = isActive(data?.latest_scan);

  if (error) return <ErrorBanner message={error.message} />;
  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const v = data.visibility;
  return (
    <>
      <PageHeader title={data.project.brand_name} description={`${data.project.category} · ${data.project.country} · ${data.counts.active_prompts} prompts · ${data.counts.competitors} competitors`} />
      <ScanBanner projectId={id} scan={data.latest_scan} onStarted={reload} />

      {!data.has_data ? (
        <Card>
          {scanning ? (
            <EmptyState icon={<ChartLine size={28} />} title="Your AI visibility report is being prepared" body="Answers are being collected and analyzed. This page updates on its own." />
          ) : (
            <EmptyState icon={<ChartLine size={28} />} title="No data yet" body="Run a scan to measure how ChatGPT, Perplexity and Gemini talk about you." />
          )}
        </Card>
      ) : (
        v && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {KPIS.map((k) => (
                <div key={k.key} className="rounded-[16px] border border-line-strong bg-surface p-4">
                  <p className="text-[12px] text-muted">{k.label}</p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-[28px] tabular-nums tracking-tight">{pct(v[k.key])}</span>
                    <Delta value={v.deltas[k.key]} />
                  </p>
                  <p className="mt-1 text-[12px] text-faint">{k.help}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              <Card title="Visibility trend" subtitle={`${data.trend.length} scan${data.trend.length === 1 ? "" : "s"}`}>
                <TrendChart trend={data.trend} />
              </Card>
              <Card title="By AI engine" subtitle={`Average position ${pos(v.average_position)}`}>
                <ul className="space-y-4 p-5">
                  {data.engines.map((e) => (
                    <li key={e.key}>
                      <div className="flex items-center gap-2 text-[13px]">
                        <EngineIcon engine={e.key} size={14} />
                        <span className="font-medium">{e.name}</span>
                        <span className="ml-auto font-mono text-[12px] text-muted">{pct(e.mention_rate)} seen</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 rounded-full bg-[#d9d9d6]" style={{ width: `${Math.max(2, e.mention_rate * 100)}%` }} />
                        <div className="h-1.5 rounded-full bg-ink" style={{ width: `${Math.max(2, e.recommendation_rate * 100)}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-faint">{pct(e.recommendation_rate)} recommended · {e.responses} answers</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card title="You vs competitors" subtitle="Latest scan" action={<Link href={`/projects/${id}/competitors`} className="text-[12px] text-muted hover:text-ink">Head-to-head</Link>}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[13px]">
                  <thead className="text-[11px] text-muted">
                    <tr className="border-b border-line">
                      <th className="px-5 py-2 font-normal">Brand</th>
                      <th className="py-2 font-normal">Mentions</th>
                      <th className="py-2 font-normal">Recommendations</th>
                      <th className="py-2 font-normal">Share of voice</th>
                      <th className="py-2 pr-5 font-normal">Avg. position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.competitors.map((c) => (
                      <tr key={c.name} className={cx("border-b border-line last:border-0", c.is_you && "bg-[#f7f7f6]")}>
                        <td className="px-5 py-2.5 font-medium">
                          {c.name}
                          {c.is_you && <span className="ml-2 rounded-[4px] bg-ink px-1 py-px text-[9px] font-medium text-white">You</span>}
                        </td>
                        <td className="py-2.5 font-mono tabular-nums">{pct(c.mention_rate)}</td>
                        <td className="py-2.5 font-mono tabular-nums">{pct(c.recommendation_rate)}</td>
                        <td className="py-2.5">
                          <span className="flex items-center gap-2">
                            <span className={cx("h-1.5 rounded-full", c.is_you ? "bg-ink" : "bg-[#bdbdb9]")} style={{ width: `${Math.max(2, c.share_of_voice * 120)}px` }} />
                            <span className="font-mono tabular-nums">{pct(c.share_of_voice)}</span>
                          </span>
                        </td>
                        <td className="py-2.5 pr-5 font-mono tabular-nums">{pos(c.average_position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="Top opportunities" action={<Link href={`/projects/${id}/opportunities`} className="text-[12px] text-muted hover:text-ink">View all</Link>}>
                {data.top_opportunities.length ? (
                  <ul className="divide-y divide-line">
                    {data.top_opportunities.map((o) => (
                      <li key={o.id}>
                        <Link href={`/projects/${id}/opportunities#opp-${o.id}`} className="group flex items-start gap-3 px-5 py-3.5 hover:bg-[#fbfbfa]">
                          <div className="min-w-0 flex-1">
                            <ImpactPill impact={o.impact} />
                            <p className="mt-1.5 text-[14px] font-medium text-ink">{o.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">{o.recommended_action}</p>
                          </div>
                          <ArrowRight size={14} className="mt-1 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="No open opportunities" body="Nice. AI recommends you wherever your competitors show up." />
                )}
              </Card>

              <Card title="Recent AI answers" action={<Link href={`/projects/${id}/prompts`} className="text-[12px] text-muted hover:text-ink">All prompts</Link>}>
                <ul className="divide-y divide-line">
                  {data.recent_answers.map((a) => (
                    <li key={a.id}>
                      <button type="button" onClick={() => setOpenResponse(a.id)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#fbfbfa]">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line">
                          <EngineIcon engine={a.engine} size={13} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-ink">{a.prompt}</span>
                          <span className="block text-[11px] text-faint">{a.engine_name} · {timeAgo(a.created_at)}</span>
                        </span>
                        <VerdictPill verdict={a.verdict} position={a.position} />
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )
      )}
      <ResponseDrawer projectId={id} responseId={openResponse} onClose={() => setOpenResponse(null)} />
    </>
  );
}
