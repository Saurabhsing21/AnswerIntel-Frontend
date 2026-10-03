"use client";

import { ArrowRight } from "@phosphor-icons/react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { BrandMark } from "@/components/product/brand-mark";
import { EngineIcon } from "@/components/product/engine-icon";
import { Mark } from "@/components/ui/mark";
import { brands, citedSources, competitorRows, rivalWins, series, you } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

const CYCLE_SECONDS = 7;
const rivals = brands.filter((b) => !b.you);

type Metric = { label: string; value: number; max: number; higherIsBetter: boolean; format: (v: number) => string; unit: string };

function latest(metric: "mentions" | "recommendations" | "sov", id: string) {
  const v = series[metric][id];
  return v[v.length - 1];
}

function metricsFor(id: string): Metric[] {
  const row = competitorRows.find((r) => r.brand.id === id)!;
  const pct = (v: number) => `${Math.round(v)}%`;
  return [
    { label: "Mentions", value: latest("mentions", id), max: 100, higherIsBetter: true, format: pct, unit: "pts" },
    { label: "Recommendations", value: latest("recommendations", id), max: 100, higherIsBetter: true, format: pct, unit: "pts" },
    { label: "Share of voice", value: latest("sov", id), max: 50, higherIsBetter: true, format: pct, unit: "pts" },
    { label: "Cited sources", value: citedSources[id], max: 10, higherIsBetter: true, format: (v) => `${Math.round(v)}`, unit: "sources" },
    { label: "Avg. position", value: row.position, max: 5, higherIsBetter: false, format: (v) => `#${v.toFixed(1)}`, unit: "places" },
  ];
}

/** Number that counts from its previous value to the new one. */
function Num({ value, format, className }: { value: number; format: (v: number) => string; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, format);
  useEffect(() => {
    const c = animate(mv, value, { duration: reduce ? 0 : 0.6, ease });
    return () => c.stop();
  }, [value, mv, reduce]);
  return <motion.span className={className}>{text}</motion.span>;
}

export function HeadToHead() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  // Bars grow from zero the first time the section scrolls into view.
  const seen = useInView(ref, { once: true, amount: 0.35 });
  const [index, setIndex] = useState(0);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  // One winning prompt is always expanded so its reason is visible at rest.
  const [openWin, setOpenWin] = useState(0);
  const progress = useMotionValue(0);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  const rival = rivals[index];
  const mine = metricsFor(you.id);
  const theirs = metricsFor(rival.id);
  const wins = mine.map((m, i) => (m.higherIsBetter ? m.value > theirs[i].value : m.value < theirs[i].value));
  const youLead = wins.filter(Boolean).length;

  // Same rhythm as the v1 tab cycler: a progress line fills, then the next rival.
  useEffect(() => {
    progress.set(0);
    if (reduce) return;
    controls.current = animate(progress, 1, {
      duration: CYCLE_SECONDS,
      ease: "linear",
      onComplete: () => {
        setIndex((i) => (i + 1) % rivals.length);
        setOpenWin(0);
      },
    });
    return () => controls.current?.stop();
  }, [index, reduce, progress]);

  // Reasons step through the winning prompts as the progress line fills.
  useMotionValueEvent(progress, "change", (v) => {
    const n = rivalWins[rival.id].length;
    setOpenWin(Math.min(n - 1, Math.floor(v * n)));
  });

  useEffect(() => {
    // Plays whenever visible; hovering never pauses, so scrolling past with the pointer resting on it still animates.
    if (!inView) controls.current?.pause();
    else controls.current?.play();
  }, [inView, index]);

  return (
    <Section id="competitors">
      <SectionHeading
        className="max-w-[680px]"
        title={
          <>
            Go <Mark>head-to-head</Mark> with any rival
          </>
        }
        muted="Pick a competitor and see exactly where they beat you, and on which prompts."
      />

      <div ref={ref}>
        <div role="tablist" aria-label="Competitor" className="mt-10 flex flex-wrap gap-2">
          {rivals.map((r, i) => {
            const selected = i === index;
            return (
              <button
                key={r.id}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => {
                  setIndex(i);
                  setOpenWin(0);
                }}
                className={cx(
                  "relative flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-[14px] transition-colors",
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
                {selected && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-4 bottom-1 h-[2px] origin-left rounded-full bg-mark"
                    style={{ scaleX: reduce ? 1 : progress }}
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
          <div className="flex flex-col rounded-card border border-line-strong bg-surface p-5 md:p-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[13px] font-medium">
              <span className="flex items-center gap-2">
                <BrandMark brand={you} size={18} /> {you.name} (you)
              </span>
              <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-muted">vs</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={rival.id}
                  initial={reduce ? false : { opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-end gap-2"
                >
                  {rival.name} <BrandMark brand={rival} size={18} />
                </motion.span>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={rival.id}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease }}
                className="mt-4 rounded-[12px] bg-page px-3.5 py-2.5 text-[13px] text-ink-2"
              >
                {youLead === 0 ? (
                  <>
                    {rival.name} leads on <strong className="font-semibold text-ink">all 5</strong> metrics. Start with the
                    prompts on the right.
                  </>
                ) : (
                  <>
                    You lead on{" "}
                    <span className="rounded-[4px] bg-mark px-1 font-semibold text-ink">
                      {youLead} of 5
                    </span>{" "}
                    metrics against {rival.name}.
                  </>
                )}
              </motion.p>
            </AnimatePresence>

            <ul className="mt-3 divide-y divide-line">
              {mine.map((m, i) => {
                const t = theirs[i];
                const youWin = wins[i];
                const width = (v: number) =>
                  m.higherIsBetter ? Math.min(v / m.max, 1) : Math.min((m.max - v + 1) / m.max, 1);
                const gap = Math.abs(m.value - t.value);
                const gapText = m.label === "Avg. position" ? gap.toFixed(1) : Math.round(gap);
                return (
                  <li
                    key={m.label}
                    onPointerEnter={() => setHoverRow(i)}
                    onPointerLeave={() => setHoverRow(null)}
                    className={cx(
                      "relative -mx-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[10px] px-2 py-3.5 transition-colors",
                      hoverRow === i && "bg-page",
                    )}
                  >
                    <span className="flex items-center justify-end gap-2.5">
                      <Num value={m.value} format={m.format} className={cx("font-mono text-[13px] tabular-nums", youWin ? "text-ink" : "text-muted")} />
                      <motion.span
                        className={cx("h-2.5 origin-right rounded-full transition-colors duration-300", youWin ? "bg-mark" : "bg-[#d9d9d6]")}
                        style={{ width: "70%" }}
                        initial={false}
                        animate={{ scaleX: seen ? width(m.value) : 0 }}
                        transition={{ type: "spring", stiffness: 140, damping: 20, delay: reduce ? 0 : i * 0.06 }}
                      />
                    </span>
                    <span className="grid w-[120px] place-items-center text-center text-[12px] text-muted md:w-[136px]">
                      {/* The label slot swaps to the gap on hover, so nothing overlaps. */}
                      <AnimatePresence mode="wait" initial={false}>
                        {hoverRow === i ? (
                          <motion.span
                            key="gap"
                            initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.15 }}
                            className={cx(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
                              gap === 0 ? "bg-sunken text-ink" : youWin ? "bg-mark text-ink" : "bg-night text-white",
                            )}
                          >
                            {gap === 0 ? "Tied" : `${youWin ? "Ahead" : "Behind"} by ${gapText} ${m.unit}`}
                          </motion.span>
                        ) : (
                          <motion.span key="label" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                            {m.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span className="flex items-center gap-2.5">
                      <motion.span
                        className={cx("h-2.5 origin-left rounded-full transition-colors duration-300", !youWin ? "bg-ink" : "bg-[#d9d9d6]")}
                        style={{ width: "70%" }}
                        initial={false}
                        animate={{ scaleX: seen ? width(t.value) : 0 }}
                        transition={{ type: "spring", stiffness: 140, damping: 20, delay: reduce ? 0 : i * 0.06 }}
                      />
                      <Num value={t.value} format={m.format} className={cx("font-mono text-[13px] tabular-nums", !youWin ? "text-ink" : "text-muted")} />
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-auto pt-4 text-[12px] text-muted">
              Sample data. <span className="rounded-[3px] bg-mark px-1 text-ink">Lime</span> marks where you lead. Hover a row for the gap.
            </p>
          </div>

          <div className="flex flex-col rounded-card border border-line-strong bg-surface p-5 md:p-8">
            <div className="flex items-center text-[13px]">
              <span className="font-medium text-ink">Prompts {rival.name} wins</span>
              <span className="ml-auto rounded-full bg-mark px-2 py-0.5 font-medium text-ink">
                {rivalWins[rival.id].length} to fix
              </span>
            </div>
            <motion.ul
              key={rival.id}
              initial={reduce ? false : "hidden"}
              animate="shown"
              variants={{ shown: { transition: { staggerChildren: 0.07 } } }}
              className="mt-4 space-y-2"
            >
              {rivalWins[rival.id].map((w, wi) => (
                <motion.li
                  key={w.prompt}
                  tabIndex={0}
                  onPointerEnter={() => setOpenWin(wi)}
                  onFocus={() => setOpenWin(wi)}
                  variants={{ hidden: { opacity: 0, y: 8 }, shown: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.3, ease }}
                  className={cx(
                    "group rounded-[14px] border p-3.5 text-[14px] leading-snug text-ink transition-[background-color,border-color,box-shadow] duration-300 outline-none",
                    openWin === wi ? "border-line-strong bg-surface shadow-[0_8px_24px_-14px_rgb(0_0_0/0.18)]" : "border-transparent bg-page hover:bg-sunken",
                  )}
                >
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink">
                      <EngineIcon engine={w.engine} size={12} />
                    </span>
                    <span className="flex-1">{w.prompt}</span>
                    <ArrowRight
                      size={14}
                      className={cx(
                        "mt-1 shrink-0 text-ink transition-[opacity,transform] duration-200",
                        openWin === wi ? "translate-x-0.5 opacity-100" : "opacity-0",
                      )}
                    />
                  </span>
                  <span
                    className={cx(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      openWin === wi ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <span className="overflow-hidden">
                      <span className="mt-2 ml-9 block border-l-[3px] border-mark pl-3 text-[13px] text-ink-2">{w.why}</span>
                    </span>
                  </span>
                </motion.li>
              ))}
            </motion.ul>
            <p className="mt-auto pt-5 text-[13px] leading-relaxed text-muted">
              Hover a prompt to see why they win it. Each one becomes an opportunity.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
