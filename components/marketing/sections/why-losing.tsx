"use client";

import {
  Article,
  Check,
  Compass,
  Gauge,
  Link,
  Plus,
  Scales,
  Wrench,
  X,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { BrandMark } from "@/components/product/brand-mark";
import { Mark } from "@/components/ui/mark";
import { brands } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

const CYCLE_SECONDS = 7;
const byId = Object.fromEntries(brands.map((b) => [b.id, b]));

type GapId = "content" | "citation" | "authority" | "positioning" | "comparison" | "technical";

const gaps: {
  id: GapId;
  icon: typeof Article;
  title: string;
  body: string;
  impact: "High" | "Medium";
  prompts: number;
  fix: string;
}[] = [
  { id: "content", icon: Article, title: "Content gap", body: "They answer the question on their site. You don't.", impact: "High", prompts: 6, fix: "Publish a CRM for startups page that answers the exact question." },
  { id: "citation", icon: Link, title: "Citation gap", body: "Fewer third-party sites mention you.", impact: "High", prompts: 5, fix: "Get listed on the 5 sources AI already cites for Kiteline." },
  { id: "authority", icon: Gauge, title: "Authority gap", body: "The sources AI trusts most rarely cover you.", impact: "Medium", prompts: 4, fix: "Prioritise G2 reviews and the top Reddit thread before smaller blogs." },
  { id: "positioning", icon: Compass, title: "Positioning gap", body: "AI doesn't connect you to the category.", impact: "High", prompts: 7, fix: "Rewrite your homepage headline around CRM for startups and small sales teams." },
  { id: "comparison", icon: Scales, title: "Comparison gap", body: "No comparison pages for AI to quote.", impact: "Medium", prompts: 3, fix: "Publish an honest Halden vs Kiteline page with a feature table." },
  { id: "technical", icon: Wrench, title: "Technical gap", body: "Key pages are hard for AI crawlers to read.", impact: "High", prompts: 4, fix: "Server-render your pricing page and allow GPTBot in robots.txt." },
];

/* ---------- Evidence views: one realistic mini product UI per gap ---------- */

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("flex items-center gap-3 rounded-[10px] px-3 py-2.5", className)}>{children}</div>;
}

function stagger(reduce: boolean | null) {
  return {
    initial: reduce ? false : ("hidden" as const),
    animate: "shown" as const,
    variants: { shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } },
  };
}
const item = { hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0, transition: { duration: 0.3, ease } } };

function ContentEvidence({ reduce }: { reduce: boolean | null }) {
  const pages = [
    { brand: byId.kiteline, url: "kiteline.io/crm-for-startups", cited: 14 },
    { brand: byId.vantor, url: "vantor.app/solutions/startups", cited: 9 },
  ];
  return (
    <motion.div {...stagger(reduce)} className="space-y-1.5">
      <p className="mb-2 text-[12px] text-muted">Pages AI cites for &quot;CRM for startups&quot;</p>
      {pages.map((p) => (
        <motion.div key={p.url} variants={item}>
          <Row className="bg-page">
            <BrandMark brand={p.brand} size={18} />
            <span className="font-mono text-[12px] text-ink-2">{p.url}</span>
            <span className="ml-auto text-[12px] text-ink">Cited {p.cited}x</span>
          </Row>
        </motion.div>
      ))}
      <motion.div variants={item}>
        <Row className="border border-dashed border-[#e5484d]/40 bg-[#fdf3f3]">
          <BrandMark brand={byId.halden} size={18} />
          <span className="font-mono text-[12px] text-[#b42318]">halden.co/...</span>
          <span className="ml-auto text-[12px] font-medium text-[#b42318]">No matching page</span>
        </Row>
      </motion.div>
    </motion.div>
  );
}

function CitationEvidence({ reduce }: { reduce: boolean | null }) {
  const theirs = ["g2.com", "reddit.com", "techcrunch.com", "producthunt.com", "zapier.com", "saasworthy.com", "capterra.com"];
  const yours = ["g2.com", "producthunt.com"];
  const line = (brand: (typeof brands)[number], list: string[], slots: number) => (
    <div>
      <p className="mb-2 flex items-center gap-2 text-[12px] text-ink-2">
        <BrandMark brand={brand} size={16} /> {brand.name}
        <span className="ml-auto font-mono text-muted">{list.length} sources</span>
      </p>
      <motion.div {...stagger(reduce)} className="flex flex-wrap gap-1.5">
        {list.map((s) => (
          <motion.span key={s} variants={item} className="rounded-full border border-line-strong bg-surface px-2.5 py-1 text-[12px] text-ink-2">
            {s}
          </motion.span>
        ))}
        {Array.from({ length: slots }).map((_, i) => (
          <motion.span key={i} variants={item} className="w-[72px] rounded-full border border-dashed border-line-strong px-2.5 py-1 text-[12px] text-faint">
            missing
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
  return (
    <div className="space-y-5">
      {line(byId.kiteline, theirs, 0)}
      {line(byId.halden, yours, 5)}
    </div>
  );
}

function AuthorityEvidence({ reduce }: { reduce: boolean | null }) {
  const rows = [
    { source: "g2.com", trust: 5, you: true, them: true },
    { source: "reddit.com/r/startups", trust: 5, you: false, them: true },
    { source: "techcrunch.com", trust: 4, you: false, them: true },
    { source: "indie CRM blog", trust: 2, you: true, them: false },
  ];
  return (
    <motion.div {...stagger(reduce)}>
      <div className="grid grid-cols-[1fr_88px_48px_56px] px-3 pb-2 text-[11px] text-muted">
        <span>Source</span>
        <span>AI trust</span>
        <span className="text-center">You</span>
        <span className="text-center">Vantor</span>
      </div>
      {rows.map((r) => (
        <motion.div key={r.source} variants={item} className="grid grid-cols-[1fr_88px_48px_56px] items-center rounded-[10px] px-3 py-2.5 text-[12px] odd:bg-page">
          <span className="text-ink-2">{r.source}</span>
          <span className="flex gap-1" aria-label={`Trust ${r.trust} of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={cx("size-2 rounded-full", i < r.trust ? "bg-ink" : "bg-[#e2e2df]")} />
            ))}
          </span>
          {[r.you, r.them].map((has, i) => (
            <span key={i} className="grid place-items-center">
              {has ? <Check size={13} weight="bold" className="text-ink" /> : <X size={13} className="text-faint" />}
            </span>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

function PositioningEvidence({ reduce }: { reduce: boolean | null }) {
  const terms = [
    { t: "CRM for startups", ok: false },
    { t: "small sales teams", ok: false },
    { t: "simple pipeline", ok: true },
  ];
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[12px] text-muted">Your homepage headline</p>
        <p className="rounded-[12px] bg-page px-4 py-3 font-display text-[18px] tracking-[-0.02em] text-ink">
          The{" "}
          <span className="underline decoration-[#e5484d] decoration-wavy decoration-1 underline-offset-4">
            business software
          </span>{" "}
          that keeps teams in sync.
        </p>
      </div>
      <div>
        <p className="mb-2 text-[12px] text-muted">How AI describes the category</p>
        <motion.div {...stagger(reduce)} className="flex flex-wrap gap-1.5">
          {terms.map((x) => (
            <motion.span
              key={x.t}
              variants={item}
              className={cx(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]",
                x.ok ? "border-line-strong bg-surface text-ink" : "border-dashed border-line-strong text-muted",
              )}
            >
              {x.ok ? <Check size={11} weight="bold" /> : <X size={11} />}
              {x.t}
            </motion.span>
          ))}
        </motion.div>
        <p className="mt-2 text-[12px] text-muted">1 of 3 category terms appear on your site.</p>
      </div>
    </div>
  );
}

function ComparisonEvidence({ reduce }: { reduce: boolean | null }) {
  const pages = [
    { title: "Kiteline vs Vantor", site: "kiteline.io", quoted: true },
    { title: "Vantor vs Kiteline: honest review", site: "vantor.app", quoted: true },
    { title: "Best Kiteline alternatives", site: "norrow.com", quoted: true },
    { title: "Halden vs Kiteline", site: "halden.co", quoted: false },
  ];
  return (
    <motion.div {...stagger(reduce)} className="space-y-1.5">
      <p className="mb-2 text-[12px] text-muted">Comparison pages AI quotes in your category</p>
      {pages.map((p) => (
        <motion.div key={p.title} variants={item}>
          <Row className={p.quoted ? "bg-page" : "border border-dashed border-line-strong"}>
            <Scales size={14} className={p.quoted ? "text-ink-2" : "text-faint"} />
            <span className={cx("text-[13px]", p.quoted ? "text-ink" : "text-muted")}>{p.title}</span>
            <span className="font-mono text-[11px] text-faint">{p.site}</span>
            <span className={cx("ml-auto text-[11px]", p.quoted ? "text-ink-2" : "font-medium text-[#b42318]")}>
              {p.quoted ? "Quoted by AI" : "Does not exist"}
            </span>
          </Row>
        </motion.div>
      ))}
    </motion.div>
  );
}

function TechnicalEvidence({ reduce }: { reduce: boolean | null }) {
  const log = [
    { method: "GET", path: "/robots.txt", status: 200, note: "GPTBot disallowed", bad: true },
    { method: "GET", path: "/features", status: 200, note: "18.2 KB text", bad: false },
    { method: "GET", path: "/pricing", status: 200, note: "0.4 KB, renders client-side", bad: true },
    { method: "GET", path: "/blog/crm-guide", status: 404, note: "Not found", bad: true },
  ];
  return (
    <div className="overflow-hidden rounded-[12px] bg-night p-4 font-mono text-[12px] text-white/80">
      <p className="mb-3 text-white/45">AI crawler fetch log · halden.co</p>
      <motion.div {...stagger(reduce)} className="space-y-1.5">
        {log.map((l) => (
          <motion.div key={l.path} variants={item} className="grid grid-cols-[34px_minmax(0,150px)_36px_1fr] gap-3">
            <span className="text-white/45">{l.method}</span>
            <span className="truncate">{l.path}</span>
            <span className={l.status === 200 ? "text-[#86efac]" : "text-[#fca5a5]"}>{l.status}</span>
            <span className={l.bad ? "text-[#fca5a5]" : "text-white/55"}>{l.note}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

const evidence: Record<GapId, (p: { reduce: boolean | null }) => React.ReactNode> = {
  content: ContentEvidence,
  citation: CitationEvidence,
  authority: AuthorityEvidence,
  positioning: PositioningEvidence,
  comparison: ComparisonEvidence,
  technical: TechnicalEvidence,
};

/** Icon wrapped in a ring that fills over the cycle duration. */
function ProgressRing({ progress, active, children }: { progress: ReturnType<typeof useMotionValue<number>>; active: boolean; children: React.ReactNode }) {
  const dash = useTransform(progress, (p) => `${p * 100} 100`);
  return (
    <span className="relative grid size-10 shrink-0 place-items-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r="18.5" pathLength={100} fill="none" stroke="rgb(0 0 0 / 0.08)" strokeWidth="1.5" />
        {active && (
          <motion.circle cx="20" cy="20" r="18.5" pathLength={100} fill="none" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: dash }} />
        )}
      </svg>
      <span className={cx("grid size-8 place-items-center rounded-full transition-colors duration-300", active ? "bg-ink text-white" : "bg-sunken text-ink-2")}>
        {children}
      </span>
    </span>
  );
}

export function WhyLosing() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [planned, setPlanned] = useState<Record<string, boolean>>({});
  const progress = useMotionValue(0);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const gap = gaps[index];
  const Evidence = evidence[gap.id];

  useEffect(() => {
    progress.set(reduce ? 1 : 0);
    if (reduce) return;
    controls.current = animate(progress, 1, {
      duration: CYCLE_SECONDS,
      ease: "linear",
      onComplete: () => setIndex((i) => (i + 1) % gaps.length),
    });
    return () => controls.current?.stop();
  }, [index, reduce, progress]);

  useEffect(() => {
    if (paused || !inView) controls.current?.pause();
    else controls.current?.play();
  }, [paused, inView, index]);

  return (
    <Section id="gaps">
      <SectionHeading
        className="max-w-[720px]"
        title={
          <>
            Know <Mark>why</Mark> AI picks your competitors
          </>
        }
        muted="Every lost answer is diagnosed, backed by evidence, and turned into a fix."
      />

      <div
        ref={ref}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="mt-12 grid gap-4 lg:grid-cols-[400px_1fr]"
      >
        <div role="tablist" aria-label="Gap types" aria-orientation="vertical" className="flex flex-col gap-1.5">
          {gaps.map((g, i) => {
            const selected = i === index;
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setIndex(i)}
                className={cx(
                  "flex items-center gap-3.5 rounded-[16px] border p-3 text-left transition-[background-color,border-color,box-shadow] duration-300",
                  selected
                    ? "border-line-strong bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]"
                    : "border-transparent hover:bg-surface/70",
                )}
              >
                <ProgressRing progress={progress} active={selected}>
                  <Icon size={16} />
                </ProgressRing>
                <span className="min-w-0">
                  <span className={cx("block text-[15px] font-medium", selected ? "text-ink" : "text-ink-2")}>{g.title}</span>
                  <span className={cx("block truncate text-[13px]", selected ? "text-muted" : "text-faint")}>{g.body}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          aria-label={gap.title}
          className="flex min-h-[460px] flex-col overflow-hidden rounded-card border border-line-strong bg-surface shadow-[0_24px_60px_-30px_rgb(0_0_0/0.2)]"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3.5 text-[12px] md:px-6">
            <span className="text-muted">Diagnosis</span>
            <span className="text-faint">/</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={gap.id} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="font-medium text-ink">
                {gap.title}
              </motion.span>
            </AnimatePresence>
            <span className="ml-auto flex items-center gap-2">
              <span className={cx("rounded-full px-2 py-0.5 font-medium", gap.impact === "High" ? "bg-[#fdf2f2] text-[#b91c1c]" : "bg-[#fdf6dd] text-[#a16207]")}>
                {gap.impact} impact
              </span>
              <span className="rounded-full bg-sunken px-2 py-0.5 text-ink-2">{gap.prompts} prompts affected</span>
            </span>
          </div>

          <div className="relative flex flex-1 flex-col justify-center p-5 md:p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={gap.id}
                initial={reduce ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25, ease }}
              >
                <Evidence reduce={reduce} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3 border-t border-line bg-[#fbfbfa] px-5 py-4 sm:flex-row sm:items-center md:px-6">
            <p className="text-[13px] text-ink-2">
              <span className="mr-1.5 rounded-[4px] bg-mark px-1 font-medium text-ink">Fix</span>
              {gap.fix}
            </p>
            <button
              type="button"
              aria-pressed={!!planned[gap.id]}
              onClick={() => setPlanned((p) => ({ ...p, [gap.id]: !p[gap.id] }))}
              className={cx(
                "inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors active:scale-[0.98] sm:ml-auto sm:self-auto",
                planned[gap.id] ? "border border-line-strong bg-surface text-ink" : "bg-ink text-white hover:bg-[#2b2b2b]",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={planned[gap.id] ? "y" : "n"} initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
                  {planned[gap.id] ? <Check size={12} weight="bold" /> : <Plus size={12} weight="bold" />}
                </motion.span>
              </AnimatePresence>
              {planned[gap.id] ? "In your plan" : "Add to plan"}
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
