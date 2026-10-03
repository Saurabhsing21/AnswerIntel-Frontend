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
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/marketing/section";
import { BrandMark } from "@/components/product/brand-mark";
import { Mark } from "@/components/ui/mark";
import { brands } from "@/lib/data";
import { cx } from "@/lib/cx";
import { useMediaQuery } from "@/lib/use-media-query";
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

function GapCard({
  gap,
  index,
  active,
  reached,
  pinned,
  planned,
  onTogglePlan,
}: {
  gap: (typeof gaps)[number];
  index: number;
  active: boolean;
  reached: boolean;
  pinned: boolean;
  planned: boolean;
  onTogglePlan: () => void;
}) {
  const reduce = useReducedMotion();
  const Icon = gap.icon;
  const Evidence = evidence[gap.id];
  return (
    <motion.article
      initial={false}
      animate={pinned ? { opacity: active ? 1 : 0.42, scale: active ? 1 : 0.96 } : { opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0 : 0.4, ease }}
      className="flex w-full shrink-0 flex-col overflow-hidden rounded-card border border-line-strong bg-surface shadow-[0_24px_60px_-30px_rgb(0_0_0/0.2)] lg:h-[min(470px,58dvh)] lg:w-[660px]"
    >
      <div className="flex items-start gap-3.5 border-b border-line px-5 py-4 md:px-6">
        <span
          className={cx(
            "grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300",
            active || !pinned ? "bg-ink text-white" : "bg-sunken text-ink-2",
          )}
        >
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-[16px] font-medium text-ink">
            {gap.title}
            <span className="font-mono text-[11px] font-normal text-faint">
              {index + 1}/{gaps.length}
            </span>
          </p>
          <p className="text-[13px] text-muted">{gap.body}</p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 text-[11px] sm:flex">
          <span className={cx("rounded-full px-2 py-0.5 font-medium", gap.impact === "High" ? "bg-[#fdf2f2] text-[#b91c1c]" : "bg-[#fdf6dd] text-[#a16207]")}>
            {gap.impact}
          </span>
          <span className="rounded-full bg-sunken px-2 py-0.5 text-ink-2">{gap.prompts} prompts</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center overflow-hidden p-5 md:p-6">
        {/* Remounts when the card is first reached, so its evidence animates in on scroll. */}
        <Evidence key={reached ? "on" : "off"} reduce={reached ? reduce : true} />
      </div>

      <div className="flex flex-col gap-3 border-t border-line bg-[#fbfbfa] px-5 py-3.5 sm:flex-row sm:items-center md:px-6">
        <p className="text-[13px] text-ink-2">
          <span className="mr-1.5 rounded-[4px] bg-mark px-1 font-medium text-ink">Fix</span>
          {gap.fix}
        </p>
        <button
          type="button"
          aria-pressed={planned}
          onClick={onTogglePlan}
          className={cx(
            "inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors active:scale-[0.98] sm:ml-auto sm:self-auto",
            planned ? "border border-line-strong bg-surface text-ink" : "bg-ink text-white hover:bg-[#2b2b2b]",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={planned ? "y" : "n"}
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {planned ? <Check size={12} weight="bold" /> : <Plus size={12} weight="bold" />}
            </motion.span>
          </AnimatePresence>
          {planned ? "In your plan" : "Add to plan"}
        </button>
      </div>
    </motion.article>
  );
}

// Scroll range (of the pinned section) over which the track pans.
const PAN: [number, number] = [0.06, 0.94];

/**
 * Pinned horizontal scroll on desktop: the section sticks while vertical scroll
 * pans the six diagnoses sideways. Stacks vertically on mobile / reduced motion.
 */
export function WhyLosing() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const pinned = desktop && !reduce;

  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);
  const [reached, setReached] = useState(0);
  const [planned, setPlanned] = useState<Record<string, boolean>>({});

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, PAN, [0, -distance]);
  const fill = useTransform(scrollYProgress, PAN, [0, 1]);

  useEffect(() => {
    const el = track.current;
    if (!pinned || !el) return;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pinned) return;
    const t = Math.min(1, Math.max(0, (v - PAN[0]) / (PAN[1] - PAN[0])));
    const i = Math.round(t * (gaps.length - 1));
    setActive(i);
    setReached((r) => Math.max(r, i));
  });

  return (
    <section
      id="gaps"
      ref={section}
      className="relative"
      style={pinned ? { height: `${gaps.length * 70 + 60}vh` } : undefined}
    >
      <div className={cx(pinned && "sticky top-0 flex h-dvh flex-col justify-center overflow-hidden")}>
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 pt-20 md:px-8 lg:flex-row lg:items-end lg:pt-16">
          <SectionHeading
            className="max-w-[640px]"
            title={
              <>
                Know <Mark>why</Mark> AI picks your competitors
              </>
            }
            muted="Every lost answer is diagnosed, backed by evidence, and turned into a fix. Keep scrolling."
          />
          {pinned && (
            <div className="w-full max-w-[280px] pb-2 lg:ml-auto">
              <div className="flex items-baseline justify-between text-[12px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="font-medium text-ink"
                  >
                    {gaps[active].title}
                  </motion.span>
                </AnimatePresence>
                <span className="font-mono text-muted">
                  {active + 1} of {gaps.length}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e6e6e3]">
                <motion.div className="h-full origin-left rounded-full bg-ink" style={{ scaleX: fill }} />
              </div>
            </div>
          )}
        </div>

        <div className={cx(pinned ? "mt-10" : "mx-auto mt-10 max-w-[1200px] px-5 pb-20 md:px-8")}>
          <motion.div
            ref={track}
            style={pinned ? { x } : undefined}
            className={cx(
              "flex gap-5",
              pinned ? "w-max pr-[20vw] pl-[max(20px,calc((100vw-1200px)/2+32px))]" : "flex-col",
            )}
          >
            {gaps.map((g, i) => (
              <GapCard
                key={g.id}
                gap={g}
                index={i}
                active={!pinned || i === active}
                reached={!pinned || i <= reached}
                pinned={pinned}
                planned={!!planned[g.id]}
                onTogglePlan={() => setPlanned((p) => ({ ...p, [g.id]: !p[g.id] }))}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
