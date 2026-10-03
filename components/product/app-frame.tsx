"use client";

import {
  Calendar,
  ChartLine,
  Export,
  Flask,
  Globe,
  House,
  Lightbulb,
  Link,
  MagnifyingGlass,
  Hash,
  Users,
  Gear,
  UsersThree,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { BrandMark } from "@/components/product/brand-mark";
import { CompetitorTable } from "@/components/product/competitor-table";
import { Delta } from "@/components/product/delta";
import { EngineIcon } from "@/components/product/engine-icon";
import { LineChart } from "@/components/product/line-chart";
import { brands, metricLabels, months, series, you, type Engine, type MetricKey } from "@/lib/data";
import { cx } from "@/lib/cx";

const nav = [
  {
    group: "General",
    items: [
      { label: "Overview", icon: House, active: true },
      { label: "Prompts", icon: Hash },
      { label: "Competitors", icon: Users },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Sources", icon: Link },
      { label: "Opportunities", icon: Lightbulb },
    ],
  },
  {
    group: "Track",
    items: [
      { label: "Experiments", icon: Flask },
      { label: "Reports", icon: ChartLine },
    ],
  },
];

const metrics: MetricKey[] = ["mentions", "recommendations", "sov"];

const opportunities = [
  { impact: "High", title: "Citation gap", evidence: "Kiteline is cited by 7 sources, you by 2", prompts: 5 },
  { impact: "High", title: "Content gap", evidence: "No page answers \"CRM for startups\"", prompts: 6 },
  { impact: "Medium", title: "Comparison gap", evidence: "No Halden vs Kiteline page for AI to quote", prompts: 3 },
];

const recentScans = [
  { date: "Mon, Sep 28", done: 48 },
  { date: "Mon, Sep 21", done: 46 },
  { date: "Mon, Sep 14", done: 48 },
];

const recentAnswers: { engine: Engine; prompt: string; verdict: "Recommended" | "Mentioned" | "Not mentioned"; when: string }[] = [
  { engine: "chatgpt", prompt: "Which CRM should a 10-person startup use?", verdict: "Mentioned", when: "2h ago" },
  { engine: "perplexity", prompt: "Best Kiteline alternatives for small teams", verdict: "Recommended", when: "5h ago" },
  { engine: "gemini", prompt: "Simplest CRM for founder-led sales", verdict: "Recommended", when: "1d ago" },
  { engine: "google", prompt: "Affordable CRM with a good free plan", verdict: "Not mentioned", when: "1d ago" },
];

function last(key: MetricKey) {
  const v = series[key][you.id];
  return { value: v[v.length - 1], delta: v[v.length - 1] - v[v.length - 2] };
}

/** A working mini version of the AnswerIntel dashboard, fed with sample data. */
export function AppFrame() {
  const [metric, setMetric] = useState<MetricKey>("mentions");
  const lines = brands.map((brand) => ({ brand, values: series[metric][brand.id] }));
  const rec = last("recommendations");

  return (
    <div className="overflow-hidden rounded-card border border-line-strong bg-surface text-left shadow-[0_24px_60px_-24px_rgb(0_0_0/0.18)]">
      <div className="grid md:grid-cols-[196px_1fr]">
        <aside className="hidden border-r border-line bg-[#fbfbfb] p-3 md:flex md:flex-col">
          <div className="mb-3 flex items-center gap-2 px-1.5 text-[12px] font-medium">
            <BrandMark brand={you} size={20} />
            Halden workspace
          </div>
          <div className="mb-3 flex items-center gap-2 rounded-[6px] border border-line bg-surface px-2 py-1.5 text-[11px] text-faint">
            <MagnifyingGlass size={12} />
            Quick search
          </div>
          {nav.map((section) => (
            <div key={section.group} className="mb-3">
              <p className="px-2 pb-1 text-[10px] text-faint">{section.group}</p>
              {section.items.map(({ label, icon: Icon, ...rest }) => (
                <div
                  key={label}
                  className={cx(
                    "flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[12px]",
                    "active" in rest
                      ? "bg-mark-soft font-medium text-ink"
                      : "text-ink-2 transition-colors hover:bg-black/[0.03]",
                  )}
                >
                  <Icon size={13} />
                  {label}
                </div>
              ))}
            </div>
          ))}
          <div className="mb-3">
            <p className="px-2 pb-1 text-[10px] text-faint">Recent scans</p>
            {recentScans.map((s) => (
              <div key={s.date} className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[11px] text-ink-2">
                <span
                  className={cx("size-1.5 rounded-full", s.done === 48 ? "bg-up" : "bg-[#eab308]")}
                  aria-label={s.done === 48 ? "Completed" : "Partial"}
                />
                {s.date}
                <span className="ml-auto font-mono text-faint">{s.done}/48</span>
              </div>
            ))}
          </div>
          <div className="mb-3">
            <p className="px-2 pb-1 text-[10px] text-faint">Workspace</p>
            {[
              { label: "Settings", icon: Gear },
              { label: "Team", icon: UsersThree },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[12px] text-ink-2 transition-colors hover:bg-black/[0.03]">
                <Icon size={13} />
                {label}
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-[10px] border border-line bg-surface p-3 text-[11px]">
            <p className="font-medium text-ink">Next scan</p>
            <p className="mt-0.5 text-muted">Monday 06:00, 48 prompts</p>
            <div className="mt-2.5 flex gap-1.5">
              {(["chatgpt", "perplexity", "gemini", "google"] as Engine[]).map((e) => (
                <span key={e} className="grid size-6 place-items-center rounded-full border border-line">
                  <EngineIcon engine={e} size={11} />
                </span>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-line px-3 py-2 text-[11px]">
            {[
              { icon: null, label: "Halden" },
              { icon: Calendar, label: "Last 6 months" },
              { icon: Globe, label: "All engines" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] bg-sunken px-2 py-1 text-ink-2"
              >
                {Icon ? <Icon size={12} /> : <BrandMark brand={you} size={12} />}
                {label}
              </span>
            ))}
            <span className="ml-auto shrink-0 rounded-[6px] border border-dashed border-line-strong px-2 py-1 text-faint">
              Sample data
            </span>
            <span className="hidden shrink-0 items-center gap-1 rounded-[6px] border border-line px-2 py-1 text-ink-2 sm:inline-flex">
              <Export size={12} />
              Export
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-[12px]">
            <span className="text-ink">
              Overview
              <span className="text-muted">
                {" "}
                · Halden&apos;s recommendation rate is up {rec.delta.toFixed(1)} pts this month
              </span>
            </span>
          </div>

          {/* KPI tiles double as the chart's metric switch. */}
          <div
            role="tablist"
            aria-label="Metric"
            className="grid grid-cols-3 gap-2 border-b border-line p-3"
          >
            {metrics.map((key) => {
              const kpi = last(key);
              const selected = metric === key;
              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => setMetric(key)}
                  className={cx(
                    "relative rounded-[10px] px-3 py-2.5 text-left transition-colors",
                    selected ? "" : "hover:bg-black/[0.03]",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="metric-pill"
                      className="absolute inset-0 rounded-[10px] border border-[#c5e35c] bg-mark-soft"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative block text-[11px] text-muted">{metricLabels[key]}</span>
                  <span className="relative mt-0.5 flex items-baseline gap-2">
                    <span className="font-mono text-[18px] tabular-nums text-ink md:text-[20px]">
                      {kpi.value}%
                    </span>
                    <Delta value={kpi.delta} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            <div className="flex flex-col border-line p-4 lg:border-r">
              <ul className="flex flex-wrap gap-x-3.5 gap-y-1 text-[11px] text-muted">
                {brands.map((b) => (
                  <li key={b.id} className={cx("flex items-center gap-1.5", b.you && "font-medium text-ink")}>
                    <span className="h-[3px] w-3 rounded-full" style={{ background: b.color }} />
                    {b.name}
                  </li>
                ))}
                <li className="ml-auto text-faint">Hover the chart</li>
              </ul>
              <div className="mt-3 flex-1">
                <LineChart lines={lines} labels={months} />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="px-4 pt-4 pb-2">
                <p className="text-[12px] font-medium">Competitors</p>
                <p className="text-[11px] text-muted">Click Visibility to re-sort</p>
              </div>
              <CompetitorTable />
            </div>
          </div>

          {/* Lower half of the dashboard: what to do next, and the raw answers behind the numbers. */}
          <div className="grid border-t border-line md:grid-cols-2">
            <div className="border-line p-4 md:border-r">
              <p className="text-[12px] font-medium">Top opportunities</p>
              <ul className="mt-3 space-y-2">
                {opportunities.map((o) => (
                  <li
                    key={o.title}
                    className="flex items-start gap-3 rounded-[10px] border border-line p-3 transition-colors hover:bg-[#fbfbfb]"
                  >
                    <span
                      className={cx(
                        "mt-px shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium",
                        o.impact === "High" ? "bg-[#fdf2f2] text-[#b91c1c]" : "bg-[#fdf6dd] text-[#a16207]",
                      )}
                    >
                      {o.impact}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium text-ink">{o.title}</span>
                      <span className="block text-[11px] text-muted">{o.evidence}</span>
                    </span>
                    <span className="ml-auto shrink-0 text-[11px] whitespace-nowrap text-faint">{o.prompts} prompts</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4">
              <p className="text-[12px] font-medium">Recent AI answers</p>
              <ul className="mt-1.5 divide-y divide-line">
                {recentAnswers.map((r) => (
                  <li key={r.prompt} className="flex items-center gap-3 py-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line">
                      <EngineIcon engine={r.engine} size={13} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-ink-2">{r.prompt}</span>
                    <span
                      className={cx(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        r.verdict === "Recommended"
                          ? "bg-ink text-white"
                          : r.verdict === "Mentioned"                            ? "bg-mark-soft text-ink"
                            : "bg-[#fdf2f2] text-[#b91c1c]",
                      )}
                    >
                      {r.verdict}
                    </span>
                    <span className="w-12 shrink-0 text-right text-[11px] text-faint">{r.when}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
