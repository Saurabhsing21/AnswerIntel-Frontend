"use client";

import { ChatCircleText, Link, ListNumbers, Smiley, Target } from "@phosphor-icons/react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { EngineIcon } from "@/components/product/engine-icon";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

type Signal = "mention" | "recommendation" | "position" | "sentiment" | "citation";

const signals: { id: Signal; icon: typeof Target; title: string; body: string; reading: string }[] = [
  { id: "mention", icon: ChatCircleText, title: "Mention", body: "Did the AI name you at all?", reading: "Yes, once." },
  {
    id: "recommendation",
    icon: Target,
    title: "Recommendation",
    body: "Did it tell the buyer to pick you? A mention is not a recommendation.",
    reading: "No. It recommended Kiteline and Vantor.",
  },
  { id: "position", icon: ListNumbers, title: "Position", body: "Where you land when it ranks the options.", reading: "Third of three." },
  {
    id: "sentiment",
    icon: Smiley,
    title: "Sentiment",
    body: "The words it uses to describe you.",
    reading: "Mixed: praised for the interface, doubted on reporting.",
  },
  { id: "citation", icon: Link, title: "Citations", body: "The sources it leaned on to answer.", reading: "2 of 3 sources are about competitors." },
];

type Seg = { text: string; signal?: Signal };

// One AI answer, split into segments tagged with the signal each one carries.
const answer: Seg[][] = [
  [{ text: "For a 10-person startup, " }, { text: "I'd recommend Kiteline or Vantor", signal: "recommendation" }, { text: "." }],
  [{ text: "1.", signal: "position" }, { text: " Kiteline: fast setup and a generous free plan. " }, { text: "[1]", signal: "citation" }],
  [{ text: "2.", signal: "position" }, { text: " Vantor: strong automation, pricier as you grow. " }, { text: "[2]", signal: "citation" }],
  [
    { text: "3.", signal: "position" },
    { text: " " },
    { text: "Halden", signal: "mention" },
    { text: ": " },
    { text: "a clean interface founders like", signal: "sentiment" },
    { text: ", though " },
    { text: "reporting is still limited", signal: "sentiment" },
    { text: ". " },
    { text: "[3]", signal: "citation" },
  ],
];

const sources = ["g2.com", "reddit.com", "halden.co"];

const CYCLE_MS = 4200;

export function AnswerAnatomy() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = signals[active].id;

  useEffect(() => {
    if (reduce || paused || !inView) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % signals.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [active, paused, inView, reduce]);

  return (
    <Section id="signals">
      <SectionHeading
        className="max-w-[680px]"
        title="What we read in every AI answer"
        muted="Each answer is broken into five signals. Pick one to see where it hides."
      />

      <div
        ref={ref}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="mt-12 grid gap-4 lg:grid-cols-[1.25fr_1fr]"
      >
        <div className="flex flex-col rounded-card border border-line-strong bg-surface p-6 md:p-9">
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <EngineIcon engine="chatgpt" size={15} />
            ChatGPT
            <span className="ml-auto rounded-full border border-line-strong px-2.5 py-0.5 text-[12px] text-ink-2">
              Which CRM should a 10-person startup use?
            </span>
          </div>
          <div className="mt-6 space-y-3 text-[16px] leading-[1.9] text-ink-2 md:text-[17px]">
            {answer.map((line, li) => (
              <p key={li}>
                {line.map((seg, si) => {
                  if (!seg.signal) return <span key={si}>{seg.text}</span>;
                  const on = seg.signal === current;
                  return (
                    <span key={si} className="relative inline">
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-[-3px] inset-y-[2px] origin-left rounded-[5px] bg-mark"
                        initial={false}
                        animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
                        transition={{ duration: reduce ? 0 : 0.4, ease }}
                      />
                      <span
                        className={cx(
                          "relative transition-colors duration-300",
                          on ? "text-ink" : "underline decoration-line-strong decoration-dotted underline-offset-4",
                        )}
                      >
                        {seg.text}
                      </span>
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
          <div className="mt-auto pt-6">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-[14px] bg-mark-soft px-4 py-3 text-[14px]">
              <span className="font-medium text-ink">{signals[active].title} in this answer:</span>
              <motion.span
                key={current}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className="text-ink-2"
              >
                {signals[active].reading}
              </motion.span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-5 text-[13px] text-muted">
            Sources
            {sources.map((s, i) => (
              <span
                key={s}
                className={cx(
                  "rounded-full px-2.5 py-0.5 transition-colors duration-300",
                  current === "citation" ? "bg-mark text-ink" : "bg-sunken text-ink-2",
                )}
              >
                [{i + 1}] {s}
              </span>
            ))}
          </div>
        </div>

        <div role="tablist" aria-label="Signals" aria-orientation="vertical" className="flex flex-col gap-2">
          {signals.map((s, i) => {
            const selected = i === active;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cx(
                  "group rounded-[16px] border p-4 text-left transition-[background-color,border-color] duration-300 md:p-5",
                  selected ? "border-ink bg-surface" : "border-transparent hover:bg-surface/60",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cx(
                      "grid size-8 place-items-center rounded-full transition-colors duration-300",
                      selected ? "bg-mark text-ink" : "bg-sunken text-muted",
                    )}
                  >
                    <Icon size={16} />
                  </span>
                  <span className={cx("text-[16px] font-medium", selected ? "text-ink" : "text-ink-2")}>{s.title}</span>
                </span>
                <motion.span
                  initial={false}
                  animate={{ height: selected ? "auto" : 0, opacity: selected ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.3, ease }}
                  className="block overflow-hidden"
                >
                  <span className="block pt-3 pl-11 text-[14px] leading-relaxed text-muted">{s.body}</span>
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
