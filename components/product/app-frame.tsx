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
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { BrandMark } from "@/components/product/brand-mark";
import { CompetitorTable } from "@/components/product/competitor-table";
import { Delta } from "@/components/product/delta";
import { LineChart } from "@/components/product/line-chart";
import { brands, metricLabels, months, series, you, type MetricKey } from "@/lib/data";
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
        <aside className="hidden border-r border-line bg-[#fbfbfb] p-3 md:block">
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
                      ? "bg-sunken font-medium text-ink"
                      : "text-ink-2 transition-colors hover:bg-black/[0.03]",
                  )}
                >
                  <Icon size={13} />
                  {label}
                </div>
              ))}
            </div>
          ))}
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
            <span className="ml-auto hidden items-center gap-1.5 text-muted lg:flex">
              Recommended in {rec.value}% of answers <Delta value={rec.delta} />
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            <div className="border-line p-4 lg:border-r">
              <div
                role="tablist"
                aria-label="Metric"
                className="mb-3 inline-flex rounded-[8px] bg-sunken p-0.5 text-[11px]"
              >
                {metrics.map((key) => (
                  <button
                    key={key}
                    role="tab"
                    type="button"
                    aria-selected={metric === key}
                    onClick={() => setMetric(key)}
                    className={cx(
                      "relative rounded-[6px] px-2.5 py-1 transition-colors",
                      metric === key ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {metric === key && (
                      <motion.span
                        layoutId="metric-pill"
                        className="absolute inset-0 rounded-[6px] bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08)]"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span className="relative">{metricLabels[key]}</span>
                  </button>
                ))}
              </div>
              <LineChart lines={lines} labels={months} />
            </div>
            <div className="hidden md:block">
              <div className="px-4 pt-4 pb-2">
                <p className="text-[12px] font-medium">Competitors</p>
                <p className="text-[11px] text-muted">Click Visibility to re-sort</p>
              </div>
              <CompetitorTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
