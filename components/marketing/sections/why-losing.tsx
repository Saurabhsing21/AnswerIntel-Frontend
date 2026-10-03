"use client";

import {
  Article,
  CaretDown,
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
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { BrandMark } from "@/components/product/brand-mark";
import { EngineIcon } from "@/components/product/engine-icon";
import { Mark } from "@/components/ui/mark";
import { brands, you } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

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

/* ---------------- Diagnosis report ---------------- */

// How much of the lost answer each gap explains, and the expected lift of fixing it.
const detail: Record<GapId, { share: number; lift: number; summary: string; short: string }> = {
  citation: { share: 31, lift: 6, summary: "Kiteline is cited by 7 sources, you by 2", short: "Get listed on 5 cited sources" },
  content: { share: 24, lift: 5, summary: "No page answers “CRM for startups”", short: "Publish a CRM for startups page" },
  positioning: { share: 19, lift: 4, summary: "1 of 3 category terms on your homepage", short: "Rewrite the homepage headline" },
  comparison: { share: 12, lift: 2, summary: "No Halden vs Kiteline page to quote", short: "Publish a comparison page" },
  authority: { share: 9, lift: 2, summary: "Missing from r/startups and TechCrunch", short: "Win the top Reddit thread" },
  technical: { share: 5, lift: 1, summary: "Pricing page is empty to crawlers", short: "Server-render pricing" },
};

const ranked = [...gaps].sort((a, b) => detail[b.id].share - detail[a.id].share);
// Monochrome by rank; the highlighted gap turns lime.
const shades = ["#171717", "#3d3d3d", "#666664", "#8f8f8c", "#b8b8b5", "#d6d6d3"];
const BASE_RATE = 38;
const AUTOPLAY_MS = 5500;

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    const c = animate(mv, value, { duration: reduce ? 0 : 0.5, ease });
    return () => c.stop();
  }, [value, mv, reduce]);
  return <motion.span>{text}</motion.span>;
}

export function WhyLosing() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  const inView = useInView(ref, { amount: 0.3 });
  const [open, setOpen] = useState<GapId>(ranked[0].id);
  const [hover, setHover] = useState<GapId | null>(null);
  const [userDriven, setUserDriven] = useState(false);
  const [plan, setPlan] = useState<GapId[]>(["citation"]);

  // Autoplay walks down the ranked list until the visitor takes over.
  useEffect(() => {
    if (reduce || userDriven || !inView) return;
    const t = setTimeout(() => {
      const i = ranked.findIndex((g) => g.id === open);
      setOpen(ranked[(i + 1) % ranked.length].id);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [open, reduce, userDriven, inView]);

  const focus = hover ?? open;
  const lift = plan.reduce((n, id) => n + detail[id].lift, 0);
  const togglePlan = (id: GapId) => {
    setUserDriven(true);
    setPlan((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const select = (id: GapId) => {
    setUserDriven(true);
    setOpen(id);
  };

  return (
    <Section id="gaps">
      <SectionHeading
        className="max-w-[720px]"
        title={
          <>
            Know <Mark>why</Mark> AI picks your competitors
          </>
        }
        muted="Every lost answer is broken down into causes, ranked by impact, and turned into a plan."
      />

      <div ref={ref} className="mt-12 grid items-start gap-4 lg:grid-cols-[1.65fr_1fr]">
        {/* Diagnosis report */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={seen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="overflow-hidden rounded-card border border-line-strong bg-surface shadow-[0_24px_60px_-30px_rgb(0_0_0/0.2)]"
        >
          <div className="border-b border-line p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
              <span className="rounded-full bg-sunken px-2 py-0.5 text-ink-2">Lost prompt</span>
              <EngineIcon engine="chatgpt" size={13} />
              ChatGPT, this week
            </div>
            <p className="mt-3 font-display text-[22px] leading-snug tracking-[-0.02em] text-ink md:text-[24px]">
              &ldquo;Which CRM should a 10-person startup use?&rdquo;
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
              <span className="flex items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-ink">
                <BrandMark brand={byId.kiteline} size={14} /> Kiteline recommended #1
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-2.5 py-1 text-muted">
                <BrandMark brand={you} size={14} /> {you.name} not mentioned
              </span>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-[12px] text-muted">
                <span>Why you lost it</span>
                <span>Share of the gap</span>
              </div>
              <div className="flex h-3 gap-[3px]" onPointerLeave={() => setHover(null)}>
                {ranked.map((g, i) => {
                  const on = focus === g.id;
                  return (
                    <motion.button
                      key={g.id}
                      type="button"
                      aria-label={`${g.title}: ${detail[g.id].share}% of the gap`}
                      onPointerEnter={() => setHover(g.id)}
                      onClick={() => select(g.id)}
                      className="h-full origin-left rounded-full transition-colors duration-200"
                      style={{ width: `${detail[g.id].share}%`, background: on ? "var(--color-mark)" : shades[i] }}
                      initial={reduce ? false : { scaleX: 0 }}
                      animate={seen ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.5, delay: reduce ? 0 : 0.25 + i * 0.08, ease }}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex text-[11px]">
                {ranked.map((g) => (
                  <span
                    key={g.id}
                    className={cx("truncate pr-1 transition-colors", focus === g.id ? "font-medium text-ink" : "text-faint")}
                    style={{ width: `${detail[g.id].share}%` }}
                  >
                    {detail[g.id].share >= 9 ? `${detail[g.id].share}%` : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ul onPointerLeave={() => setHover(null)}>
            {ranked.map((g, i) => {
              const isOpen = open === g.id;
              const Icon = g.icon;
              const Evidence = evidence[g.id];
              const inPlan = plan.includes(g.id);
              return (
                <motion.li
                  key={g.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={seen ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: reduce ? 0 : 0.5 + i * 0.06, ease }}
                  onPointerEnter={() => setHover(g.id)}
                  className={cx("border-b border-line last:border-0 transition-colors", focus === g.id && !isOpen && "bg-[#fbfbfa]")}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => select(isOpen ? ranked[(i + 1) % ranked.length].id : g.id)}
                    className="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-5 py-3.5 text-left md:px-6"
                  >
                    <span
                      className={cx(
                        "grid size-8 place-items-center rounded-full transition-colors duration-300",
                        focus === g.id ? "bg-mark text-ink" : "bg-sunken text-ink-2",
                      )}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium text-ink">{g.title}</span>
                      <span className="block truncate text-[12px] text-muted">{detail[g.id].summary}</span>
                    </span>
                    <span className="font-mono text-[13px] tabular-nums text-ink">{detail[g.id].share}%</span>
                    <CaretDown size={13} className={cx("text-faint transition-transform duration-300", isOpen && "rotate-180 text-ink")} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 md:px-6 md:pl-[68px]">
                          <Evidence reduce={reduce} />
                          <div className="mt-4 flex flex-col gap-3 rounded-[12px] bg-page px-4 py-3 sm:flex-row sm:items-center">
                            <p className="text-[13px] text-ink-2">
                              <span className="mr-1.5 rounded-[4px] bg-mark px-1 font-medium text-ink">Fix</span>
                              {g.fix}
                            </p>
                            <button
                              type="button"
                              aria-pressed={inPlan}
                              onClick={() => togglePlan(g.id)}
                              className={cx(
                                "inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors active:scale-[0.98] sm:ml-auto sm:self-auto",
                                inPlan ? "border border-line-strong bg-surface text-ink" : "bg-ink text-white hover:bg-[#2b2b2b]",
                              )}
                            >
                              {inPlan ? <Check size={12} weight="bold" /> : <Plus size={12} weight="bold" />}
                              {inPlan ? "In your plan" : `Add to plan, +${detail[g.id].lift} pts`}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* Fix plan */}
        <motion.aside
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={seen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.15, ease }}
          className="rounded-card border border-line-strong bg-surface p-5 md:p-6 lg:sticky lg:top-24"
          aria-label="Fix plan"
        >
          <div className="flex items-center">
            <p className="text-[15px] font-medium text-ink">Fix plan</p>
            <span className="ml-auto rounded-full bg-sunken px-2 py-0.5 font-mono text-[11px] text-ink-2">
              {plan.length}/{ranked.length}
            </span>
          </div>

          <div className="mt-5 rounded-[14px] bg-page p-4">
            <p className="text-[12px] text-muted">Projected recommendation rate</p>
            <p className="mt-1 flex items-baseline gap-2 font-mono tabular-nums">
              <span className="text-[18px] text-muted">{BASE_RATE}%</span>
              <span className="text-faint">→</span>
              <span className="rounded-[6px] bg-mark px-1.5 text-[28px] leading-tight text-ink">
                <Counter value={BASE_RATE + lift} suffix="%" />
              </span>
            </p>
            <p className="mt-1 text-[12px] text-muted">
              <Counter value={lift} /> pts from {plan.length} {plan.length === 1 ? "fix" : "fixes"}, sample estimate
            </p>
          </div>

          <ul className="mt-4 space-y-2">
            <AnimatePresence initial={false}>
              {ranked
                .filter((g) => plan.includes(g.id))
                .map((g) => {
                  const Icon = g.icon;
                  return (
                    <motion.li
                      key={g.id}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, x: 16, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 16, transition: { duration: 0.18 } }}
                      transition={{ duration: 0.3, ease }}
                      className="group flex items-center gap-3 rounded-[12px] border border-line px-3 py-2.5"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-ink-2">
                        <Icon size={13} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{detail[g.id].short}</span>
                      <span className="font-mono text-[12px] text-ink">+{detail[g.id].lift}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${g.title} from plan`}
                        onClick={() => togglePlan(g.id)}
                        className="grid size-6 place-items-center rounded-full text-faint transition-colors hover:bg-sunken hover:text-ink"
                      >
                        <X size={11} weight="bold" />
                      </button>
                    </motion.li>
                  );
                })}
            </AnimatePresence>
          </ul>
          {plan.length === 0 && (
            <p className="mt-4 rounded-[12px] border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-muted">
              Add fixes from the diagnosis to build your plan.
            </p>
          )}
          {plan.length < ranked.length && (
            <button
              type="button"
              onClick={() => {
                setUserDriven(true);
                setPlan(ranked.map((g) => g.id));
              }}
              className="mt-3 w-full rounded-full border border-line-strong py-2 text-[13px] text-ink-2 transition-colors hover:border-[rgb(0_0_0/0.25)] hover:text-ink"
            >
              Add all fixes
            </button>
          )}
        </motion.aside>
      </div>
    </Section>
  );
}
