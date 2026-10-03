"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { BrandMark } from "@/components/product/brand-mark";
import { EngineIcon } from "@/components/product/engine-icon";
import { brands, citedSources, competitorRows, rivalWins, series, you } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

const rivals = brands.filter((b) => !b.you);

function latest(metric: "mentions" | "recommendations" | "sov", id: string) {
  const v = series[metric][id];
  return v[v.length - 1];
}

function metricsFor(id: string) {
  const row = competitorRows.find((r) => r.brand.id === id)!;
  return [
    { label: "Mentions", value: latest("mentions", id), max: 100, unit: "%", higherIsBetter: true },
    { label: "Recommendations", value: latest("recommendations", id), max: 100, unit: "%", higherIsBetter: true },
    { label: "Share of voice", value: latest("sov", id), max: 50, unit: "%", higherIsBetter: true },
    { label: "Cited sources", value: citedSources[id], max: 10, unit: "", higherIsBetter: true },
    { label: "Avg. position", value: row.position, max: 5, unit: "", higherIsBetter: false },
  ];
}

export function HeadToHead() {
  const reduce = useReducedMotion();
  const [rivalId, setRivalId] = useState(rivals[0].id);
  const rival = rivals.find((r) => r.id === rivalId)!;
  const mine = metricsFor(you.id);
  const theirs = metricsFor(rivalId);

  return (
    <Section id="competitors">
      <SectionHeading
        className="max-w-[680px]"
        title="Go head-to-head with any rival"
        muted="Pick a competitor and see exactly where they beat you, and on which prompts."
      />

      <div role="tablist" aria-label="Competitor" className="mt-10 flex flex-wrap gap-2">
        {rivals.map((r) => {
          const selected = r.id === rivalId;
          return (
            <button
              key={r.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setRivalId(r.id)}
              className={cx(
                "relative flex items-center gap-2 rounded-full border px-3.5 py-2 text-[14px] transition-colors",
                selected ? "border-ink text-white" : "border-line-strong bg-surface text-ink-2 hover:border-[rgb(0_0_0/0.25)]",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="rival-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <BrandMark brand={r} size={16} />
                {r.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-card border border-line-strong bg-surface p-5 md:p-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pb-4 text-[13px] font-medium">
            <span className="flex items-center gap-2">
              <BrandMark brand={you} size={18} /> {you.name} (you)
            </span>
            <span className="text-faint">vs</span>
            <span className="flex items-center justify-end gap-2">
              {rival.name} <BrandMark brand={rival} size={18} />
            </span>
          </div>
          <ul className="divide-y divide-line">
            {mine.map((m, i) => {
              const t = theirs[i];
              const youWin = m.higherIsBetter ? m.value > t.value : m.value < t.value;
              const fmt = (v: number) => (m.label === "Avg. position" ? `#${v.toFixed(1)}` : `${v}${m.unit}`);
              const width = (v: number) =>
                m.higherIsBetter ? Math.min(v / m.max, 1) : Math.min((m.max - v + 1) / m.max, 1);
              return (
                <li key={m.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3.5">
                  <span className="flex items-center justify-end gap-2.5">
                    <span className={cx("font-mono text-[13px] tabular-nums", youWin ? "text-ink" : "text-muted")}>
                      {fmt(m.value)}
                    </span>
                    <motion.span
                      className={cx("h-2.5 origin-right rounded-full", youWin ? "bg-mark" : "bg-[#d9d9d6]")}
                      style={{ width: "70%" }}
                      initial={false}
                      animate={{ scaleX: width(m.value) }}
                      transition={{ duration: reduce ? 0 : 0.5, ease }}
                    />
                  </span>
                  <span className="w-[110px] text-center text-[12px] text-muted md:w-[128px]">{m.label}</span>
                  <span className="flex items-center gap-2.5">
                    <motion.span
                      className={cx("h-2.5 origin-left rounded-full", !youWin ? "bg-ink" : "bg-[#d9d9d6]")}
                      style={{ width: "70%" }}
                      initial={false}
                      animate={{ scaleX: width(t.value) }}
                      transition={{ duration: reduce ? 0 : 0.5, ease }}
                    />
                    <span className={cx("font-mono text-[13px] tabular-nums", !youWin ? "text-ink" : "text-muted")}>
                      {fmt(t.value)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[12px] text-muted">Sample data. Lime marks where you lead.</p>
        </div>

        <div className="flex flex-col rounded-card bg-night p-5 text-white md:p-8">
          <p className="text-[13px] text-white/55">Prompts {rival.name} wins</p>
          <motion.ul
            key={rivalId}
            initial={reduce ? false : "hidden"}
            animate="shown"
            variants={{ shown: { transition: { staggerChildren: 0.06 } } }}
            className="mt-4 space-y-2"
          >
            {rivalWins[rivalId].map((w) => (
              <motion.li
                key={w.prompt}
                variants={{ hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.3, ease }}
                className="flex items-start gap-3 rounded-[14px] bg-white/[0.06] p-3.5 text-[14px] leading-snug"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-ink">
                  <EngineIcon engine={w.engine} size={12} />
                </span>
                {w.prompt}
              </motion.li>
            ))}
          </motion.ul>
          <p className="mt-auto pt-5 text-[13px] leading-relaxed text-white/55">
            Each one links to the answer, the sources cited, and the gap behind it.
          </p>
        </div>
      </div>
    </Section>
  );
}
