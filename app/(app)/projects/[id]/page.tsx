"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { BrandBars, BrandLineChart, type BrandSeries } from "@/components/app/charts";
import { GetStarted } from "@/components/app/get-started";
import { ActivityCard, AnswersCard, EnginesCard, KpiTabs, OpportunitiesCard, RankTable, type RankRow } from "@/components/app/overview-cards";
import { isScanActive, useProject, useRefreshOnScan } from "@/components/app/project-context";
import { ResponseDrawer } from "@/components/app/response-drawer";
import { Card, ErrorBanner, Skeleton } from "@/components/app/ui";
import { useApi } from "@/lib/api/client";
import type { Dashboard } from "@/lib/api/types";
import { brandColor, YOU_COLOR } from "@/lib/brand";
import { pct } from "@/lib/format";

type TabKey = "mention_rate" | "recommendation_rate" | "share_of_voice";
const TABS: { key: TabKey; label: string; noun: string }[] = [
  { key: "mention_rate", label: "Mentions", noun: "mention rate" },
  { key: "recommendation_rate", label: "Recommendations", noun: "recommendation rate" },
  { key: "share_of_voice", label: "Share of voice", noun: "share of voice" },
];

function OverviewSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading overview">
      <Skeleton className="h-6 w-80" />
      <Skeleton className="h-[92px]" />
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[420px]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Skeleton className="h-[340px]" />
        <Skeleton className="h-[340px]" />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { latestScan, starting, startScan } = useProject();
  const [metric, setMetric] = useState<TabKey>("mention_rate");
  const [openResponse, setOpenResponse] = useState<number | null>(null);
  const { data, error, loading, reload } = useApi<Dashboard>(`/projects/${id}/dashboard`, (d) => (isScanActive(d?.latest_scan) ? 2000 : undefined));
  useRefreshOnScan(reload);

  if (error) return <ErrorBanner message={error.message} />;
  if (loading || !data) return <OverviewSkeleton />;

  const v = data.visibility;
  if (!data.has_data || !v) {
    return <GetStarted projectId={id} counts={data.counts} scan={latestScan ?? data.latest_scan} starting={starting} onStartScan={startScan} />;
  }

  const brand = data.project.brand_name;
  const { label, noun } = TABS.find((t) => t.key === metric)!;
  const rivals = data.competitors.filter((c) => !c.is_you).map((c) => c.name);
  const n = data.trend.length;
  const last = data.trend[n - 1];
  const previous = data.trend[n - 2];

  const series: BrandSeries[] = [
    { name: brand, color: YOU_COLOR, isYou: true, values: data.trend.map((p) => p[metric]) },
    ...rivals.map((name) => ({ name, color: brandColor(name, false, rivals), isYou: false, values: data.trend.map((p) => p.competitors[name]?.[metric] ?? null) })),
  ];

  const rows: RankRow[] = data.competitors
    .map((c) => ({
      name: c.name,
      isYou: c.is_you,
      color: brandColor(c.name, c.is_you, rivals),
      value: c[metric],
      delta: c.is_you ? v.deltas[metric] : last?.competitors[c.name] && previous?.competitors[c.name] ? last.competitors[c.name][metric] - previous.competitors[c.name][metric] : null,
      position: c.average_position,
    }))
    .sort((a, b) => b.value - a.value);

  const you = rows.find((r) => r.isYou)!;
  const leader = rows[0];
  const movers = rows.filter((r) => !r.isYou && r.delta != null).sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  const climbing = movers[0];
  const falling = movers[movers.length - 1];
  const delta = v.deltas[metric];
  const headline =
    delta == null
      ? "First scan complete. Run another to start tracking changes."
      : `${brand}'s ${noun} is ${delta === 0 ? "unchanged" : `${delta > 0 ? "up" : "down"} ${Math.abs(Math.round(delta * 1000) / 10)} pts`} since the previous scan`;

  const footer = [
    { label: leader.isYou ? "You lead" : "Leader", value: leader.isYou ? "You" : leader.name, hint: pct(leader.value) },
    { label: "Gap to leader", value: leader.isYou ? "None" : `${Math.round((leader.value - you.value) * 100)} pts`, hint: `You ${pct(you.value)}` },
    climbing && (climbing.delta ?? 0) > 0
      ? { label: "Climbing fastest", value: climbing.name, hint: `+${Math.round((climbing.delta ?? 0) * 1000) / 10} pts` }
      : { label: "Your rank", value: `${rows.indexOf(you) + 1} of ${rows.length}`, hint: label.toLowerCase() },
    falling && (falling.delta ?? 0) < 0
      ? { label: "Slipping most", value: falling.name, hint: `${Math.round((falling.delta ?? 0) * 1000) / 10} pts` }
      : { label: "Answers analysed", value: String(v.total_responses), hint: "latest scan" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[14px]">
        <span className="font-medium text-ink">Overview</span>
        <span className="text-muted"> · {headline}</span>
      </p>

      <KpiTabs
        tabs={TABS.map((t) => ({
          key: t.key,
          label: t.label,
          value: v[t.key] ?? 0,
          delta: v.deltas[t.key],
          spark: data.trend.map((p) => p[t.key]),
          margin: v.margins?.[t.key],
          noise: v.significant?.[t.key] === false && (v.deltas[t.key] ?? 0) !== 0,
        }))}
        selected={metric}
        onSelect={(key) => setMetric(key as TabKey)}
      />

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Card title={label} subtitle={n > 1 ? `Across ${n} scans` : "Latest scan"} className="flex flex-col">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 pt-4 text-[12px]">
            {series.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1.5 text-ink-2">
                <span className="h-[3px] w-3.5 rounded-full" style={{ background: s.color }} />
                <span className={s.isYou ? "font-medium text-ink" : undefined}>{s.name}</span>
              </span>
            ))}
            {n > 1 && <span className="ml-auto text-faint">Hover the chart</span>}
          </div>
          <div className="flex-1 px-3 py-3">
            {n > 1 ? (
              <BrandLineChart series={series} dates={data.trend.map((p) => p.date)} metricKey={metric} label={label} />
            ) : (
              <div className="px-2 py-3">
                <BrandBars series={series} label={label} />
                <p className="mt-4 text-[12px] text-muted">The trend line appears after your second scan. Weekly scans build it automatically.</p>
              </div>
            )}
          </div>
          <dl className="grid grid-cols-2 divide-x divide-y divide-line border-t border-line sm:grid-cols-4 sm:divide-y-0">
            {footer.map((f) => (
              <div key={f.label} className="px-5 py-3">
                <dt className="text-[11px] text-faint">{f.label}</dt>
                <dd className="mt-0.5 truncate text-[13px] font-medium text-ink">{f.value}</dd>
                <dd className="font-mono text-[11px] text-muted">{f.hint}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <RankTable rows={rows} metricLabel={label} projectId={id} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <OpportunitiesCard items={data.top_opportunities} projectId={id} />
        <div className="grid gap-4">
          <EnginesCard engines={data.engines} averagePosition={v.average_position} />
          <ActivityCard projectId={id} visibility={v} />
        </div>
      </div>

      <AnswersCard answers={data.recent_answers} projectId={id} onOpen={setOpenResponse} />

      <ResponseDrawer projectId={id} responseId={openResponse} onClose={() => setOpenResponse(null)} />
    </div>
  );
}
