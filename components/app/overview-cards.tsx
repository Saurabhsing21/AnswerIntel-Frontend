"use client";

import { Check, ArrowRight, CalendarCheck, ChartLine, FileText, Flask, Handshake, Target, Wrench } from "@phosphor-icons/react";
import Link from "next/link";
import { BrandTile } from "@/components/app/brand-tile";
import { Sparkline } from "@/components/app/charts";
import { useProject } from "@/components/app/project-context";
import { Card, Delta, EmptyState, ImpactPill, TONE_TILE, VerdictPill, type Tone } from "@/components/app/ui";
import { EngineIcon } from "@/components/product/engine-icon";
import { PositionChip } from "@/components/product/delta";
import { useApi } from "@/lib/api/client";
import type { Dashboard, Experiment, MetricKey, Opportunity, ReportSummary } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { pct, pos, timeAgo } from "@/lib/format";
import { formatHour, WEEKDAYS } from "@/lib/schedule";

const seeAll = "text-[12px] font-medium text-muted transition-colors hover:text-ink";

/* ---------- KPI tabs: the three headline numbers, also the chart's metric switch ---------- */

/** Each headline metric keeps one colour everywhere it appears: tabs, sparklines and the engine bars. */
export const METRIC_COLOR: Partial<Record<MetricKey, string>> = { mention_rate: "#2f6bff", recommendation_rate: "#16a34a", share_of_voice: "#7a5af8" };

/** margin: ± how much the rate can move by chance; noise: the change since last scan is within that. */
export type KpiTab = { key: MetricKey; label: string; value: number; delta: number | null; spark: number[]; margin?: number | null; noise?: boolean; sub?: string };

export function KpiTabs({ tabs, selected, onSelect }: { tabs: KpiTab[]; selected: MetricKey; onSelect: (key: MetricKey) => void }) {
  return (
    <div role="tablist" aria-label="Metric" className="grid overflow-hidden rounded-[16px] border border-line-strong bg-surface sm:grid-cols-3">
      {tabs.map((t, i) => {
        const on = t.key === selected;
        const color = METRIC_COLOR[t.key] ?? "#171717";
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(t.key)}
            className={cx(
              "flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors",
              i > 0 && "border-t border-line sm:border-t-0 sm:border-l",
              on ? "bg-[#fafaf9]" : "hover:bg-[#fbfbfa]",
            )}
            style={on ? { boxShadow: `inset 0 -2px 0 ${color}` } : undefined}
          >
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[12px] text-muted">
                <span className="size-2 rounded-full" style={{ background: color }} />
                {t.label}
              </span>
              <span className="mt-1.5 flex items-baseline gap-2">
                <span className="font-mono text-[30px] leading-none tracking-tight tabular-nums">{pct(t.value)}</span>
                {t.margin != null && (
                  <span className="font-mono text-[11px] text-faint" title="AI answers vary from run to run. With this many answers, this number can move up or down by this much without anything changing (95% range).">
                    ±{Math.round(t.margin * 100)} pts
                  </span>
                )}
                <Delta value={t.delta} />
              </span>
              {t.sub && <span className="mt-1 block text-[11px] text-muted">{t.sub}</span>}
              {t.noise ? (
                <span className="mt-0.5 block text-[11px] text-faint">Change is within normal run-to-run variation</span>
              ) : t.margin != null && t.delta == null ? (
                <span className="mt-0.5 block text-[11px] text-faint">±{Math.round(t.margin * 100)} pts is normal run-to-run variation</span>
              ) : null}
            </span>
            <Sparkline values={t.spark} color={on ? color : "#a3a3a3"} />
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Ranked competitor table ---------- */

export type RankRow = { name: string; isYou: boolean; color: string; value: number; delta: number | null; position: number | null; website?: string | null };

export function RankTable({ rows, metricLabel, projectId }: { rows: RankRow[]; metricLabel: string; projectId: string }) {
  return (
    <Card
      title="Competitors"
      subtitle={`Ranked by ${metricLabel.toLowerCase()}`}
      action={
        <Link href={`/projects/${projectId}/competitors`} className={seeAll}>
          Head-to-head
        </Link>
      }
      className="flex flex-col"
    >
      <div className="grid grid-cols-[22px_1fr_auto_64px] items-center gap-x-3 border-b border-line px-5 py-2 text-[11px] text-muted">
        <span>#</span>
        <span>Brand</span>
        <span className="text-right">{metricLabel}</span>
        <span className="text-right">Position</span>
      </div>
      <ol className="flex flex-1 flex-col">
        {rows.map((r, i) => (
          <li
            key={r.name}
            className={cx("grid flex-1 grid-cols-[22px_1fr_auto_64px] items-center gap-x-3 border-b border-line px-5 py-2.5 last:border-b-0", r.isYou && "bg-[#f7f7f6]")}
          >
            <span className="font-mono text-[12px] text-faint">{i + 1}</span>
            <span className="flex min-w-0 items-center gap-2.5">
              <BrandTile name={r.name} color={r.color} size={22} website={r.website} />
              <span className="truncate text-[13px] font-medium text-ink">{r.name}</span>
              {r.isYou && <span className="rounded-[4px] bg-mark px-1.5 py-px text-[10px] font-semibold text-ink">You</span>}
            </span>
            <span className="flex items-baseline justify-end gap-2 font-mono tabular-nums">
              <span className="text-[13px] text-ink">{pct(r.value)}</span>
              <span className="w-[62px] text-left">
                <Delta value={r.delta} suffix="" />
              </span>
            </span>
            <span className="flex justify-end">{r.position != null ? <PositionChip value={r.position} /> : <span className="text-faint">-</span>}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/* ---------- By AI engine ---------- */

export function EnginesCard({ engines, averagePosition }: { engines: Dashboard["engines"]; averagePosition: number | null }) {
  return (
    <Card title="By AI engine" subtitle={`Average position ${pos(averagePosition)}`} className="flex flex-col">
      <ul className="flex flex-1 flex-col divide-y divide-line">
        {engines.map((e) => (
          <li key={e.key} className="flex flex-1 flex-col justify-center px-5 py-3.5">
            <div className="flex items-center gap-2.5 text-[13px]">
              <span className="grid size-7 place-items-center rounded-full border border-line">
                <EngineIcon engine={e.key} size={13} />
              </span>
              <span className="font-medium text-ink">{e.name}</span>
              <span className="ml-auto font-mono text-[12px] text-ink">{pct(e.mention_rate)}</span>
              <span className="w-12 text-right text-[11px] text-faint">seen</span>
            </div>
            <div className="mt-2.5 space-y-1.5">
              <div className="h-1.5 rounded-full bg-blue" style={{ width: `${Math.max(2, e.mention_rate * 100)}%` }} />
              <div className="h-1.5 rounded-full bg-up" style={{ width: `${Math.max(2, e.recommendation_rate * 100)}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-faint">
              <span className="text-blue-ink">{pct(e.mention_rate)} seen</span> · <span className="text-up-ink">{pct(e.recommendation_rate)} recommended</span> · {e.responses} answers
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- Top opportunities ---------- */

export const AREA_ICON = { content: FileText, third_party: Handshake, positioning: Target, technical: Wrench } as const;
export const AREA_TONE: Record<keyof typeof AREA_ICON, Tone> = { content: "blue", third_party: "violet", positioning: "amber", technical: "green" };
export const AREA_LABEL = { content: "Content", third_party: "Third-party presence", positioning: "Positioning", technical: "Technical" } as const;

const EFFORT_LABEL: Record<string, string> = { S: "Quick win", M: "A few hours", L: "Bigger project" };

/** This week's 3 actions, with progress: the habit loop that brings people back each week. */
export function ThisWeekCard({ plan, projectId }: { plan: Dashboard["this_week"]; projectId: string }) {
  const total = plan.items.length;
  return (
    <Card
      title="This week's 3 actions"
      subtitle={total ? `${plan.done} of ${total} done` : "Nothing urgent right now"}
      action={<Link href={`/projects/${projectId}/opportunities`} className={seeAll}>All opportunities</Link>}
      className="flex flex-col"
    >
      {total > 0 && (
        <div className="flex gap-1 px-5 pt-3" aria-hidden>
          {plan.items.map((o) => <span key={o.id} className={cx("h-1.5 flex-1 rounded-full", o.status === "completed" ? "bg-up" : o.status === "in_progress" ? "bg-ink" : "bg-sunken")} />)}
        </div>
      )}
      {total ? (
        <ol className="flex flex-1 flex-col divide-y divide-line">
          {plan.items.map((o, i) => {
            const done = o.status === "completed";
            return (
              <li key={o.id} className="flex flex-1">
                <Link href={`/projects/${projectId}/opportunities#opp-${o.id}`} className="group flex w-full items-start gap-3.5 px-5 py-3.5 transition-colors hover:bg-[#fbfbfa]">
                  <span className={cx("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full font-mono text-[11px]", done ? "bg-up text-white" : "bg-sunken text-ink")}>
                    {done ? <Check size={12} weight="bold" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx("block text-[13px] font-medium", done ? "text-muted line-through" : "text-ink")}>{o.title}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted">{o.steps[0] ?? o.recommended_action}</span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <ImpactPill impact={o.impact} />
                      {o.effort && <span className="text-[11px] text-faint">{EFFORT_LABEL[o.effort]}</span>}
                      {o.status === "in_progress" && <span className="text-[11px] font-medium text-ink">In progress</span>}
                    </span>
                  </span>
                  <ArrowRight size={14} className="mt-1 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyState title="No open opportunities" body="AI recommends you wherever your competitors show up. Keep scanning to stay ahead." />
      )}
    </Card>
  );
}

export function OpportunitiesCard({ items, projectId }: { items: Opportunity[]; projectId: string }) {
  return (
    <Card
      title="Top opportunities"
      subtitle="Where AI recommends someone else"
      action={
        <Link href={`/projects/${projectId}/opportunities`} className={seeAll}>
          View all
        </Link>
      }
      className="flex flex-col"
    >
      {items.length ? (
        <ul className="flex flex-1 flex-col divide-y divide-line">
          {items.map((o) => {
            const Icon = o.area ? AREA_ICON[o.area] : Target;
            return (
              <li key={o.id} className="flex flex-1">
                <Link href={`/projects/${projectId}/opportunities#opp-${o.id}`} className="group flex w-full items-center gap-3.5 px-5 py-3 transition-colors hover:bg-[#fbfbfa]">
                  <span className={cx("grid size-9 shrink-0 place-items-center rounded-[10px]", o.area ? TONE_TILE[AREA_TONE[o.area]] : "bg-sunken text-ink-2")}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <ImpactPill impact={o.impact} />
                      {o.area && <span className="text-[11px] text-faint">{AREA_LABEL[o.area]}</span>}
                    </span>
                    <span className="mt-1 block truncate text-[13px] font-medium text-ink">{o.title}</span>
                    <span className="block truncate text-[12px] text-muted">{o.recommended_action}</span>
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No open opportunities" body="AI recommends you wherever your competitors show up. Keep scanning to stay ahead." />
      )}
    </Card>
  );
}

/* ---------- Recent AI answers ---------- */

export function AnswersCard({ answers, projectId, onOpen }: { answers: Dashboard["recent_answers"]; projectId: string; onOpen: (id: number) => void }) {
  return (
    <Card
      title="Recent AI answers"
      subtitle="What the engines said in the latest scan"
      action={
        <Link href={`/projects/${projectId}/prompts`} className={seeAll}>
          All prompts
        </Link>
      }
      className="flex flex-col"
    >
      {/* Two columns on wide screens, so a full-width card never has a long empty right side. */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-line">
        {[answers.slice(0, Math.ceil(answers.length / 2)), answers.slice(Math.ceil(answers.length / 2))].map((column, c) => (
          <ul key={c} className="min-w-0 divide-y divide-line">
            {column.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => onOpen(a.id)} className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[#fbfbfa]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line">
                    <EngineIcon engine={a.engine} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ink">{a.prompt}</span>
                    <span className="block text-[11px] text-faint">
                      {a.engine_name} · {timeAgo(a.created_at)}
                    </span>
                  </span>
                  <VerdictPill verdict={a.verdict} position={a.position} />
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Activity: tracking and reporting at a glance ---------- */

function ActivityRow({ icon: Icon, title, meta, href, action, tone }: { icon: typeof Flask; title: string; meta: string; href: string; action: string; tone: Tone }) {
  return (
    <li className="flex flex-1">
      <Link href={href} className="group flex w-full items-center gap-3.5 px-5 py-3 transition-colors hover:bg-[#fbfbfa]">
        <span className={cx("grid size-9 shrink-0 place-items-center rounded-[10px]", TONE_TILE[tone])}>
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">{title}</span>
          <span className="block truncate text-[12px] text-muted">{meta}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-ink-2 group-hover:text-ink">
          {action}
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}

export function ActivityCard({ projectId, visibility }: { projectId: string; visibility: NonNullable<Dashboard["visibility"]> }) {
  const { schedule } = useProject();
  const experiments = useApi<Experiment[]>(`/projects/${projectId}/experiments`);
  const reports = useApi<ReportSummary[]>(`/projects/${projectId}/reports`);
  const running = experiments.data?.find((e) => e.status === "running");
  const latestReport = reports.data?.[0];
  const base = `/projects/${projectId}`;

  return (
    <Card title="Tracking" subtitle="Experiments, reports and the weekly scan" className="flex flex-col">
      <div className="grid grid-cols-2 divide-x divide-line border-b border-line">
        <div className="px-5 py-3.5">
          <p className="text-[12px] text-muted">Citation rate</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-[20px] leading-none tabular-nums">{pct(visibility.citation_rate)}</span>
            <Delta value={visibility.deltas.citation_rate} />
          </p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-[12px] text-muted">Average position</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-[20px] leading-none tabular-nums">{pos(visibility.average_position)}</span>
            <span className="text-[11px] text-faint">lower is better</span>
          </p>
        </div>
      </div>
      <ul className="flex flex-1 flex-col divide-y divide-line">
        {running ? (
          <ActivityRow icon={Flask} tone="violet" title={running.name} meta={`Running since ${new Date(running.started_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}, baseline ${pct(running.baseline.mention_rate)} mentions`} href={`${base}/opportunities?tab=tracked`} action="Open" />
        ) : (
          <ActivityRow icon={Flask} tone="violet" title="Test a change" meta="Save a baseline, change your site, then re-scan to see the impact." href={`${base}/experiments?new=1`} action="Start" />
        )}
        {latestReport ? (
          <ActivityRow icon={ChartLine} tone="blue" title={`Latest ${latestReport.type} report`} meta={`${timeAgo(latestReport.created_at)}${latestReport.emailed_at ? ", emailed" : ""}`} href={`${base}/reports`} action="Open" />
        ) : (
          <ActivityRow icon={ChartLine} tone="blue" title="Create your first report" meta="A shareable summary for your team, as a PDF or a link." href={`${base}/reports?new=weekly`} action="Create" />
        )}
        {schedule?.enabled ? (
          <ActivityRow icon={CalendarCheck} tone="amber" title="Weekly scan is on" meta={`Every ${WEEKDAYS[schedule.day_of_week]} at ${formatHour(schedule.hour)}`} href={`${base}/settings`} action="Edit" />
        ) : (
          <ActivityRow icon={CalendarCheck} tone="amber" title="Weekly scan is off" meta="Turn it on to track changes without lifting a finger." href={`${base}/settings`} action="Turn on" />
        )}
      </ul>
    </Card>
  );
}
