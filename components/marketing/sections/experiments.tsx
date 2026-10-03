"use client";

import { ArrowRight, ArrowsClockwise, ChartBar, Flag } from "@phosphor-icons/react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { EngineIcon } from "@/components/product/engine-icon";
import { Mark } from "@/components/ui/mark";
import type { Engine } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

// Sample weekly rates; the change ships after week 4.
const datasets = {
  recommendation: { label: "Recommendation rate", weeks: [23, 24, 24, 25, 29, 33, 35, 37] },
  mention: { label: "Mention rate", weeks: [41, 42, 41, 43, 47, 52, 55, 58] },
} as const;
type Key = keyof typeof datasets;
const SHIP_AFTER = 4;

type State = { label: string; tone: "absent" | "mentioned" | "recommended" };
const targeted: { prompt: string; engine: Engine; before: State; after: State }[] = [
  {
    prompt: "Best CRM for a 10-person startup?",
    engine: "chatgpt",
    before: { label: "Not mentioned", tone: "absent" },
    after: { label: "Mentioned #3", tone: "mentioned" },
  },
  {
    prompt: "CRM for early-stage startups",
    engine: "perplexity",
    before: { label: "Mentioned #4", tone: "mentioned" },
    after: { label: "Recommended #2", tone: "recommended" },
  },
  {
    prompt: "Simple CRM for small sales teams",
    engine: "gemini",
    before: { label: "Mentioned #3", tone: "mentioned" },
    after: { label: "Recommended #1", tone: "recommended" },
  },
];

function Pill({ s }: { s: State }) {
  return (
    <span
      className={cx(
        "rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        s.tone === "recommended" && "bg-ink text-white",
        s.tone === "mentioned" && "bg-mark text-ink",
        s.tone === "absent" && "bg-sunken text-muted",
      )}
    >
      {s.label}
    </span>
  );
}

function Num({ value, start }: { value: number; start: boolean }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => `${Math.round(v)}%`);
  useEffect(() => {
    if (!start) return;
    const c = animate(mv, value, { duration: reduce ? 0 : 0.9, ease });
    return () => c.stop();
  }, [value, start, mv, reduce]);
  return <motion.span>{text}</motion.span>;
}

const steps = [
  { icon: Flag, title: "Log the change", body: "New page, new positioning, new coverage." },
  { icon: ArrowsClockwise, title: "Keep scanning", body: "The same prompts run every week." },
  { icon: ChartBar, title: "Compare", body: "Before and after, on the prompts you targeted." },
];

export function Experiments() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [key, setKey] = useState<Key>("recommendation");
  const [hover, setHover] = useState<number | null>(null);
  const weeks: readonly number[] = datasets[key].weeks;
  const before = Math.round(weeks.slice(0, SHIP_AFTER).reduce((a, b) => a + b) / SHIP_AFTER);
  const after = weeks[weeks.length - 1];
  const max = Math.max(...weeks) * 1.1;

  return (
    <Section id="experiments" innerClassName="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
      <Reveal className="order-2 min-w-0 lg:order-1">
        <div ref={ref} className="overflow-hidden rounded-card border border-line-strong bg-surface shadow-[0_24px_60px_-30px_rgb(0_0_0/0.2)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3.5 text-[12px]">
            <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-muted">Example experiment</span>
            <span className="font-medium text-ink">Rewrote homepage positioning</span>
            <span className="ml-auto text-muted">12 prompts · 4 weeks</span>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div>
                <p className="text-[12px] text-muted">Before</p>
                <p className="font-mono text-[30px] leading-none tabular-nums text-muted">
                  <Num key={`b-${key}`} value={before} start={inView} />
                </p>
              </div>
              <ArrowRight size={18} className="mb-1.5 text-faint" />
              <div>
                <p className="text-[12px] text-muted">After</p>
                <p className="font-mono text-[30px] leading-none tabular-nums">
                  <Num key={`a-${key}`} value={after} start={inView} />
                </p>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={key}
                  initial={reduce ? false : { opacity: 0, y: 6, scale: 0.95 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: reduce ? 0 : 0.6, ease }}
                  className="mb-0.5 rounded-full bg-mark px-2.5 py-1 font-mono text-[13px] text-ink"
                >
                  +{after - before} pts
                </motion.span>
              </AnimatePresence>
              <div role="tablist" aria-label="Metric" className="ml-auto flex rounded-full bg-sunken p-0.5 text-[12px]">
                {(Object.keys(datasets) as Key[]).map((k) => (
                  <button
                    key={k}
                    role="tab"
                    type="button"
                    aria-selected={key === k}
                    onClick={() => setKey(k)}
                    className={cx("relative rounded-full px-3 py-1 transition-colors", key === k ? "text-ink" : "text-muted hover:text-ink")}
                  >
                    {key === k && (
                      <motion.span layoutId="exp-metric" className="absolute inset-0 rounded-full bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08)]" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                    )}
                    <span className="relative">{k === "recommendation" ? "Recommended" : "Mentioned"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-8 flex h-40 items-end gap-2" onPointerLeave={() => setHover(null)}>
              {weeks.map((v, i) => (
                <div
                  key={i}
                  className="relative flex h-full flex-1 cursor-default items-end"
                  onPointerEnter={() => setHover(i)}
                >
                  <motion.div
                    className={cx(
                      "w-full origin-bottom rounded-t-[6px] transition-colors duration-200",
                      i < SHIP_AFTER ? (hover === i ? "bg-[#c4c4c1]" : "bg-[#dcdcd9]") : hover === i ? "bg-[#3a3a3a]" : "bg-ink",
                    )}
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={{ height: `${(v / max) * 100}%`, ...(inView ? { scaleY: 1 } : {}) }}
                    transition={{ scaleY: { duration: 0.6, delay: 0.1 + i * 0.06, ease }, height: { type: "spring", stiffness: 160, damping: 22 } }}
                  />
                  <AnimatePresence>
                    {hover === i && (
                      <motion.span
                        initial={reduce ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-[8px] bg-night px-2 py-1 text-center text-[11px] whitespace-nowrap text-white shadow-lg"
                        style={{ bottom: `calc(${(v / max) * 100}% + 8px)` }}
                      >
                        <span className="block text-white/55">Week {i + 1}</span>
                        <span className="font-mono">{v}%</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <span className="pointer-events-none absolute -top-3 bottom-0 border-l-2 border-dashed border-ink/25" style={{ left: `calc(${(SHIP_AFTER / weeks.length) * 100}% - 4px)` }}>
                <span className="absolute -top-3 left-2 rounded-full bg-mark px-2 py-0.5 text-[10px] whitespace-nowrap text-ink">Change shipped</span>
              </span>
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-faint">
              <span>Week 1</span>
              <span>{datasets[key].label}, weekly</span>
              <span>Week 8</span>
            </div>
          </div>

          <div className="border-t border-line bg-[#fbfbfa] px-5 py-4">
            <p className="mb-2.5 text-[12px] text-muted">Targeted prompts</p>
            <ul className="space-y-2">
              {targeted.map((t, i) => (
                <li key={t.prompt} className="flex items-center gap-3 rounded-[12px] border border-line bg-surface px-3 py-2.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line">
                    <EngineIcon engine={t.engine} size={11} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{t.prompt}</span>
                  <span className="relative hidden h-[22px] w-[120px] shrink-0 sm:block">
                    {/* Status flips from before to after once the card is in view. */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={inView ? "after" : "before"}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, delay: reduce ? 0 : 0.9 + i * 0.25, ease }}
                        className="absolute right-0"
                      >
                        <Pill s={inView ? t.after : t.before} />
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="hidden text-[11px] text-faint line-through sm:inline">{t.before.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="order-1 lg:order-2">
        <SectionHeading
          title={
            <>
              Prove that your changes <Mark>worked</Mark>
            </>
          }
          muted="Most teams ship a fix and hope. AnswerIntel measures the same prompts before and after, so you know."
        />
        <ul className="mt-8 space-y-5">
          {steps.map(({ icon: Icon, title, body }) => (
            <li key={title} className="group flex gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mark-soft text-ink transition-colors duration-300 group-hover:bg-mark">
                <Icon size={16} />
              </span>
              <span>
                <span className="block text-[16px] font-medium">{title}</span>
                <span className="block text-[15px] leading-relaxed text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
