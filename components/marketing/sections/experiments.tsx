"use client";

import { ArrowRight, Flag, ArrowsClockwise, ChartBar } from "@phosphor-icons/react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { ease } from "@/lib/motion";
import { cx } from "@/lib/cx";

// Sample weekly recommendation rate; the change ships after week 4.
const weeks = [23, 24, 24, 25, 29, 33, 35, 37];
const SHIP_AFTER = 4;

function CountUp({ to, start }: { to: number; start: boolean }) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!start || reduce) return;
    const controls = animate(0, to, { duration: 1.1, ease, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [start, to, reduce]);
  return <>{value}</>;
}

const steps = [
  { icon: Flag, title: "Log the change", body: "New page, new positioning, new coverage." },
  { icon: ArrowsClockwise, title: "Keep scanning", body: "The same prompts run every week." },
  { icon: ChartBar, title: "Compare", body: "Before and after, on the prompts you targeted." },
];

export function Experiments() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const before = Math.round(weeks.slice(0, SHIP_AFTER).reduce((a, b) => a + b) / SHIP_AFTER);
  const after = weeks[weeks.length - 1];

  return (
    <Section id="experiments" innerClassName="grid gap-12 py-20 md:py-28 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <Reveal className="order-2 lg:order-1">
        <div ref={ref} className="rounded-card border border-line-strong bg-surface p-5 md:p-7">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="rounded-[5px] border border-dashed border-line-strong px-1.5 py-px text-muted">
              Example experiment
            </span>
            <span className="ml-auto text-muted">CRM for startups · 12 prompts</span>
          </div>
          <p className="mt-3 text-[17px] font-medium tracking-[-0.02em]">Rewrote homepage positioning</p>

          <div className="mt-5 flex items-end gap-6">
            <div>
              <p className="text-[12px] text-muted">Before</p>
              <p className="font-mono text-[28px] tabular-nums text-muted">
                <CountUp to={before} start={inView} />%
              </p>
            </div>
            <ArrowRight size={18} className="mb-3 text-faint" />
            <div>
              <p className="text-[12px] text-muted">After 4 weeks</p>
              <p className="font-mono text-[28px] tabular-nums">
                <CountUp to={after} start={inView} />%
              </p>
            </div>
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 1.1, ease }}
              className="mb-2 ml-auto rounded-[6px] bg-[#e9f7ee] px-2 py-1 font-mono text-[13px] text-[#15803d]"
            >
              +{after - before} pts
            </motion.span>
          </div>

          <div className="relative mt-6 flex h-36 items-end gap-2" aria-hidden>
            {weeks.map((v, i) => (
              <motion.div
                key={i}
                className={cx("flex-1 origin-bottom rounded-t-[4px]", i < SHIP_AFTER ? "bg-[#dcdcdc]" : "bg-ink")}
                style={{ height: `${(v / 40) * 100}%` }}
                initial={reduce ? false : { scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease }}
              />
            ))}
            <span
              className="absolute -top-2 bottom-0 border-l border-dashed border-ink/40"
              style={{ left: `calc(${(SHIP_AFTER / weeks.length) * 100}% - 4px)` }}
            >
              <span className="absolute -top-4 left-1 text-[10px] whitespace-nowrap text-muted">Change shipped</span>
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted">Weekly recommendation rate</p>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="order-1 lg:order-2">
        <SectionHeading title="Prove that your changes worked" />
        <p className="mt-4 text-[17px] leading-relaxed text-muted">
          Most teams ship a fix and hope. AnswerIntel measures the same prompts before and after, so you know.
        </p>
        <ul className="mt-8 space-y-5">
          {steps.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-line-strong bg-surface text-ink-2">
                <Icon size={15} />
              </span>
              <span>
                <span className="block text-[15px] font-medium">{title}</span>
                <span className="block text-[15px] text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
