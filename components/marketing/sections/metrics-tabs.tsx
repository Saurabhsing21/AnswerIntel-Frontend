"use client";

import { Cursor, Eye, Smiley, Target } from "@phosphor-icons/react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { BrandMark } from "@/components/product/brand-mark";
import { EngineIcon } from "@/components/product/engine-icon";
import { brands } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

const TAB_SECONDS = 6;

type TabId = "recommendation" | "position" | "sentiment";

const tabs: { id: TabId; icon: typeof Eye; title: string; body: string }[] = [
  {
    id: "recommendation",
    icon: Target,
    title: "Mentioned vs. recommended",
    body: "Being named is not the same as being picked. See which answers actually tell buyers to choose you.",
  },
  {
    id: "position",
    icon: Eye,
    title: "Position",
    body: "When AI ranks the options, know where you land and which competitors keep finishing ahead.",
  },
  {
    id: "sentiment",
    icon: Smiley,
    title: "Sentiment",
    body: "Learn how AI describes you, what it praises, and the doubts it repeats to buyers.",
  },
];

const byId = Object.fromEntries(brands.map((b) => [b.id, b]));

const answer = [
  {
    brand: byId.kiteline,
    text: "Fast to set up, generous free plan, and pipelines built for small sales teams.",
    recommended: true,
    sentiment: { label: "Positive", tone: "good" },
  },
  {
    brand: byId.vantor,
    text: "Strong automation and reporting, though pricing climbs quickly as you grow.",
    recommended: true,
    sentiment: { label: "Mixed", tone: "mid" },
  },
  {
    brand: byId.halden,
    text: "A newer option some founders like for its clean interface.",
    recommended: false,
    sentiment: { label: "Neutral", tone: "mid" },
  },
] as const;

const tooltip: Record<TabId, { label: string; value: string }[]> = {
  recommendation: [
    { label: "Mentioned", value: "Yes" },
    { label: "Recommended", value: "No" },
  ],
  position: [
    { label: "This answer", value: "#3" },
    { label: "Avg. position", value: "2.9" },
  ],
  sentiment: [
    { label: "Sentiment", value: "82" },
    { label: "Doubt", value: "Unproven" },
  ],
};

function Badge({ tab, item }: { tab: TabId; item: (typeof answer)[number] }) {
  if (tab === "recommendation") {
    return (
      <span
        className={cx(
          "rounded-[5px] px-1.5 py-px text-[10px] font-medium",
          item.recommended ? "bg-[#e9f7ee] text-[#15803d]" : "bg-sunken text-muted",
        )}
      >
        {item.recommended ? "Recommended" : "Mentioned only"}
      </span>
    );
  }
  if (tab === "sentiment") {
    return (
      <span
        className={cx(
          "rounded-[5px] px-1.5 py-px text-[10px] font-medium",
          item.sentiment.tone === "good" ? "bg-[#e9f7ee] text-[#15803d]" : "bg-[#fdf6dd] text-[#a16207]",
        )}
      >
        {item.sentiment.label}
      </span>
    );
  }
  return null;
}

function ChatScene({ tab }: { tab: TabId }) {
  const reduce = useReducedMotion();
  const t = (delay: number) => ({ duration: 0.45, delay: reduce ? 0 : delay, ease });
  const hidden = reduce ? false : undefined;

  return (
    <motion.div
      key={tab}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col justify-center gap-4 p-5 md:p-8"
    >
      <motion.div
        initial={hidden ?? { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.1)}
        className="ml-auto max-w-[80%] rounded-[12px] border border-line bg-surface px-3.5 py-2 text-[13px] text-ink-2 shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
      >
        Which CRM should a 10-person startup use?
      </motion.div>

      <motion.div
        initial={hidden ?? { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.45)}
        className="rounded-[12px] border border-line bg-surface p-4 text-[13px] shadow-[0_8px_30px_-12px_rgb(0_0_0/0.12)]"
      >
        <p className="mb-3 flex items-center gap-2 text-[12px] text-muted">
          <EngineIcon engine="chatgpt" size={14} />
          For a small team, these are the strongest options:
        </p>
        <ol className="space-y-3">
          {answer.map((item, i) => (
            <motion.li
              key={item.brand.id}
              initial={hidden ?? { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(0.8 + i * 0.3)}
              className="relative"
            >
              <p className="mb-1 flex flex-wrap items-center gap-2 font-medium text-ink">
                <span
                  className={cx(
                    "font-mono text-[11px] transition-colors",
                    tab === "position" ? "text-ink" : "text-faint",
                  )}
                >
                  {i + 1}.
                </span>
                <BrandMark brand={item.brand} size={16} />
                {item.brand.name}
                <motion.span
                  initial={hidden ?? { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={t(1.9 + i * 0.12)}
                >
                  <Badge tab={tab} item={item} />
                </motion.span>
                {item.brand.you && (
                  // Inline, so the tooltip sits on the brand row and never covers answer text.
                  <span className="relative ml-1 inline-flex">
                    <motion.span
                      aria-hidden
                      className="absolute top-3 -left-3 z-10 text-ink"
                      initial={reduce ? false : { x: 120, y: 60, opacity: 0 }}
                      animate={{ x: 0, y: 0, opacity: 1 }}
                      transition={{ duration: 0.9, delay: reduce ? 0 : 2.3, ease }}
                    >
                      <Cursor size={16} weight="fill" />
                    </motion.span>
                    <motion.span
                      initial={reduce ? false : { opacity: 0, x: -4, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={t(3.1)}
                      className="inline-flex items-center gap-3 rounded-[8px] bg-night px-2.5 py-1 text-[11px] font-normal text-white shadow-[0_8px_20px_rgb(0_0_0/0.18)]"
                    >
                      {tooltip[tab].map((row) => (
                        <span key={row.label}>
                          <span className="text-white/55">{row.label}</span>{" "}
                          <span className="font-mono">{row.value}</span>
                        </span>
                      ))}
                    </motion.span>
                  </span>
                )}
              </p>
              <p className="pl-6 leading-relaxed text-muted">{item.text}</p>

            </motion.li>
          ))}
        </ol>
        <motion.div
          initial={hidden ?? { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={t(1.9)}
          className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3 text-[11px] text-muted"
        >
          Sources
          {["g2.com", "reddit.com", "kiteline.io", "techcrunch.com"].map((s) => (
            <span key={s} className="rounded-[5px] bg-sunken px-1.5 py-0.5 text-ink-2">
              {s}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function MetricsTabs() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const progress = useMotionValue(0);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  // Each tab runs a progress line; when it fills, advance to the next tab.
  useEffect(() => {
    progress.set(0);
    if (reduce) return;
    controls.current = animate(progress, 1, {
      duration: TAB_SECONDS,
      ease: "linear",
      onComplete: () => setActive((a) => (a + 1) % tabs.length),
    });
    return () => controls.current?.stop();
  }, [active, reduce, progress]);

  useEffect(() => {
    if (paused || !inView) controls.current?.pause();
    else controls.current?.play();
  }, [paused, inView, active]);

  return (
    <Section id="metrics" innerClassName="py-20 md:py-28">
      <SectionHeading
        className="mx-auto max-w-[920px] text-center"
        title="See exactly what AI tells your buyers"
        muted="Three numbers decide who gets picked."
      />

      <div
        ref={ref}
        className="mt-12 grid overflow-hidden rounded-card border border-line-strong bg-[#fbfbfb] md:mt-16 lg:grid-cols-[400px_1fr]"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <div role="tablist" aria-label="Metrics" className="flex flex-col gap-1.5 p-1.5">
          {tabs.map((tab, i) => {
            const selected = i === active;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setActive(i)}
                className={cx(
                  "relative rounded-[10px] p-5 text-left transition-[background-color,box-shadow] duration-300 md:p-7",
                  selected
                    ? "bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.06),0_0_0_1px_rgb(0_0_0/0.05)]"
                    : "hover:bg-black/[0.02]",
                )}
              >
                <span className="absolute top-6 bottom-6 left-4 w-px bg-line-strong md:left-5">
                  {selected && (
                    <motion.span
                      className="absolute inset-0 origin-top bg-ink"
                      style={{ scaleY: reduce ? 1 : progress }}
                    />
                  )}
                </span>
                <span className="block pl-4">
                  <span
                    className={cx(
                      "flex items-center gap-2 text-[16px] font-medium transition-colors",
                      selected ? "text-ink" : "text-muted",
                    )}
                  >
                    <Icon size={17} />
                    {tab.title}
                  </span>
                  <span
                    className={cx(
                      "mt-2 block text-[15px] leading-relaxed transition-colors",
                      selected ? "text-ink-2" : "text-faint",
                    )}
                  >
                    {tab.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          aria-label={tabs[active].title}
          className="relative min-h-[420px] border-t border-line [background-image:radial-gradient(rgb(0_0_0/0.06)_0.8px,transparent_1px)] [background-size:14px_14px] lg:border-t-0 lg:border-l"
        >
          <AnimatePresence mode="wait">
            <ChatScene key={tabs[active].id} tab={tabs[active].id} />
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
