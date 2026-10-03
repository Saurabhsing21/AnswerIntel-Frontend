"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { BrandMark } from "@/components/product/brand-mark";
import { competitorRows } from "@/lib/data";
import { cx } from "@/lib/cx";

// Axes: visibility 0-100 (x), sentiment 50-100 (y).
const xPct = (v: number) => v;
const yPct = (s: number) => 100 - ((s - 50) / 50) * 100;

const quadrants = [
  { label: "Hidden gems", className: "top-3 left-3" },
  { label: "Leaders", className: "top-3 right-3 text-right" },
  { label: "Laggards", className: "bottom-3 left-3" },
  { label: "Controversial", className: "bottom-3 right-3 text-right" },
];

export function Standing() {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);

  return (
    <Section id="standing" innerClassName="grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.35fr] lg:items-center">
      <Reveal>
        <SectionHeading title="Know where you stand against every rival" />
        <p className="mt-4 max-w-[440px] text-[17px] leading-relaxed text-muted">
          Visibility shows how often AI brings you up. Sentiment shows how it talks about you. Together they
          show whether you are leading, overlooked, or losing trust.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-card border border-line-strong bg-surface p-4 md:p-6">
          <div className="flex text-[11px] text-muted">
            <span>Sentiment</span>
            <span className="ml-auto rounded-[5px] border border-dashed border-line-strong px-1.5">Sample data</span>
          </div>
          <div
            className="relative mt-2 aspect-[4/3] rounded-[10px] bg-[#fbfbfb] [background-image:linear-gradient(rgb(0_0_0/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.05)_1px,transparent_1px)] [background-size:25%_25%]"
            role="img"
            aria-label="Sample chart of five brands by visibility and sentiment. Kiteline and Halden are leaders; Pellucid is a laggard."
          >
            <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
            <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
            {quadrants.map((q) => (
              <span key={q.label} className={cx("absolute text-[11px] font-medium text-faint", q.className)}>
                {q.label}
              </span>
            ))}
            {competitorRows.map((row, i) => (
              <motion.button
                key={row.brand.id}
                type="button"
                aria-label={`${row.brand.name}: visibility ${row.visibility}%, sentiment ${row.sentiment}`}
                onPointerEnter={() => setHover(row.brand.id)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(row.brand.id)}
                onBlur={() => setHover(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[6px]"
                initial={reduce ? false : { left: "50%", top: "50%", opacity: 0, scale: 0.6 }}
                whileInView={{
                  left: `${xPct(row.visibility)}%`,
                  top: `${yPct(row.sentiment)}%`,
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.2 + i * 0.08 }}
                style={reduce ? { left: `${xPct(row.visibility)}%`, top: `${yPct(row.sentiment)}%` } : undefined}
              >
                <span
                  className={cx(
                    "block rounded-[7px] p-0.5 transition-transform duration-200",
                    row.brand.you ? "ring-2 ring-ink ring-offset-2" : "",
                    hover === row.brand.id && "scale-125",
                  )}
                >
                  <BrandMark brand={row.brand} size={22} />
                </span>
                {hover === row.brand.id && (
                  <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-[8px] bg-night px-2.5 py-1.5 text-left text-[11px] whitespace-nowrap text-white shadow-lg">
                    <span className="block font-medium">{row.brand.name}</span>
                    <span className="text-white/60">
                      {row.visibility}% visible · {row.sentiment} sentiment
                    </span>
                  </span>
                )}
              </motion.button>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">Visibility</p>
        </div>
      </Reveal>
    </Section>
  );
}
