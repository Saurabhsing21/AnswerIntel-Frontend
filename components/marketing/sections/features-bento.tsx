"use client";

import { Check, Plus, Sparkle, SquaresFour } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { BrandMark } from "@/components/product/brand-mark";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import { brands, type Engine } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";
import { siG2, siProducthunt, siReddit, siTechcrunch } from "simple-icons";

const byId = Object.fromEntries(brands.map((b) => [b.id, b]));

function Card({
  title,
  body,
  className,
  surface = "plain",
  children,
}: {
  title: string;
  body: string;
  className?: string;
  surface?: "plain" | "dots" | "sunken";
  children: React.ReactNode;
}) {
  return (
    <article
      className={cx(
        "group relative flex min-h-[380px] flex-col overflow-hidden rounded-card border border-line-strong",
        surface === "plain" && "bg-surface",
        surface === "sunken" && "bg-sunken",
        surface === "dots" &&
          "bg-[#fbfbfb] [background-image:radial-gradient(rgb(0_0_0/0.07)_0.8px,transparent_1px)] [background-size:12px_12px]",
        className,
      )}
    >
      <div className="p-6 md:p-8">
        <h3 className="text-[18px] font-medium tracking-[-0.02em]">{title}</h3>
        <p className="mt-1.5 max-w-[340px] text-[15px] leading-relaxed text-muted">{body}</p>
      </div>
      <div className="relative mt-auto flex-1 px-6 pb-6 md:px-8 md:pb-8">{children}</div>
    </article>
  );
}

function MiniPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "rounded-[12px] border border-line-strong bg-surface text-[12px] shadow-[0_12px_32px_-16px_rgb(0_0_0/0.18)] transition-transform duration-300 ease-out",
        className,
      )}
    >
      {children}
    </div>
  );
}

const generated = [
  { text: "Best CRM for a seed-stage startup?", tag: "Buyer intent", tone: "bg-[#eef4ff] text-[#1d4ed8]" },
  { text: "Kiteline alternatives for small teams", tag: "Alternative", tone: "bg-[#fdf2f2] text-[#b91c1c]" },
  { text: "Vantor vs Kiteline for founders", tag: "Comparison", tone: "bg-[#fdf6dd] text-[#a16207]" },
];

function DiscoverPrompts() {
  const reduce = useReducedMotion();
  return (
    <MiniPanel className="group-hover:-translate-y-1">
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5 font-medium">
        <Sparkle size={13} weight="fill" className="text-ink" />
        Prompt discovery
        <span className="ml-auto font-normal text-muted">CRM software · US · 4 competitors</span>
      </div>
      <ul className="divide-y divide-line">
        {generated.map((p, i) => (
          <motion.li
            key={p.text}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, delay: 0.25 + i * 0.18, ease }}
            className="flex items-center gap-3 px-3.5 py-2.5"
          >
            <span className="text-ink-2">{p.text}</span>
            <span className={cx("ml-auto shrink-0 rounded-[5px] px-1.5 py-px text-[10px] font-medium", p.tone)}>
              {p.tag}
            </span>
          </motion.li>
        ))}
        <li className="px-3.5 py-2.5 text-faint">+ 44 more prompts ready to review</li>
      </ul>
    </MiniPanel>
  );
}

function PickPrompts() {
  return (
    <div className="relative h-full min-h-[180px] [perspective:900px]">
      <MiniPanel className="absolute inset-x-2 top-6 rotate-[-4deg] p-4 opacity-60 group-hover:rotate-[-6deg]">
        <p className="text-muted">How do small sales teams track deals?</p>
      </MiniPanel>
      <MiniPanel className="absolute inset-x-0 top-0 rotate-[2deg] p-4 group-hover:rotate-[0deg] group-hover:-translate-y-1">
        <p className="font-medium text-ink">What is the best CRM for a 10-person startup?</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-[5px] bg-[#e9f7ee] px-1.5 py-px text-[10px] font-medium text-[#15803d]">
            High value
          </span>
          <span className="rounded-[5px] bg-sunken px-1.5 py-px text-[10px] text-muted">Commercial</span>
          <span className="ml-auto font-mono text-[11px] text-ink">Importance 0.91</span>
        </div>
      </MiniPanel>
    </div>
  );
}

function AddCompetitors() {
  const [tracking, setTracking] = useState<Record<string, boolean>>({ kiteline: true, vantor: false });
  const reduce = useReducedMotion();
  return (
    <MiniPanel>
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5 font-medium">
        <SquaresFour size={13} />
        Competitors
        <span className="font-normal text-muted">
          ({Object.values(tracking).filter(Boolean).length}/5)
        </span>
      </div>
      <ul className="divide-y divide-line">
        {(["kiteline", "vantor"] as const).map((id) => {
          const on = tracking[id];
          return (
            <li key={id} className="flex items-center gap-2.5 px-3.5 py-3">
              <BrandMark brand={byId[id]} size={22} />
              <span>
                <span className="block font-medium text-ink">{byId[id].name}</span>
                <span className="block text-[11px] text-muted">{byId[id].domain}</span>
              </span>
              <motion.button
                type="button"
                layout={!reduce}
                onClick={() => setTracking((t) => ({ ...t, [id]: !t[id] }))}
                aria-pressed={on}
                className={cx(
                  "ml-auto inline-flex items-center gap-1 rounded-[7px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                  on ? "border border-line-strong bg-surface text-ink" : "bg-ink text-white hover:bg-[#2b2b2b]",
                )}
                transition={{ duration: 0.25, ease }}
              >
                {on ? <Check size={11} weight="bold" /> : <Plus size={11} weight="bold" />}
                {on ? "Tracking" : "Track"}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </MiniPanel>
  );
}

const engineList: { engine: Engine; available: boolean }[] = [
  { engine: "chatgpt", available: true },
  { engine: "perplexity", available: true },
  { engine: "gemini", available: true },
  { engine: "google", available: true },
  { engine: "claude", available: false },
  { engine: "copilot", available: false },
];

function ChooseEngines() {
  const [on, setOn] = useState<Record<string, boolean>>({ chatgpt: true, perplexity: true, gemini: true, google: false });
  return (
    <MiniPanel className="max-w-[360px]">
      <div className="flex items-center border-b border-line px-3.5 py-2.5 font-medium">
        AI engines
        <span className="ml-auto font-normal text-muted">Scans weekly</span>
      </div>
      <ul className="p-1.5">
        {engineList.map(({ engine, available }) => (
          <li key={engine}>
            <label
              className={cx(
                "flex items-center gap-2.5 rounded-[7px] px-2 py-1.5 transition-colors",
                available ? "cursor-pointer hover:bg-sunken" : "opacity-45",
              )}
            >
              <input
                type="checkbox"
                className="peer sr-only"
                disabled={!available}
                checked={!!on[engine]}
                onChange={() => setOn((s) => ({ ...s, [engine]: !s[engine] }))}
              />
              <span
                aria-hidden
                className={cx(
                  "grid size-4 place-items-center rounded-[4px] border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0a5fcc]",
                  on[engine] ? "border-ink bg-ink text-white" : "border-line-strong bg-surface",
                )}
              >
                {on[engine] && <Check size={10} weight="bold" />}
              </span>
              <span className="text-ink">{engineNames[engine]}</span>
              <span className="ml-auto flex items-center gap-2">
                {!available && <span className="text-[10px] text-muted">Soon</span>}
                <EngineIcon engine={engine} size={14} />
              </span>
            </label>
          </li>
        ))}
      </ul>
    </MiniPanel>
  );
}

const sources = [
  { icon: siReddit, name: "reddit.com", you: false, them: true },
  { icon: siG2, name: "g2.com", you: true, them: true },
  { icon: siTechcrunch, name: "techcrunch.com", you: false, them: true },
  { icon: siProducthunt, name: "producthunt.com", you: true, them: false },
];

function KeySources() {
  return (
    <MiniPanel>
      <div className="grid grid-cols-[1fr_64px_64px] border-b border-line px-3.5 py-2.5 text-[11px] text-muted">
        <span>Cited source</span>
        <span className="flex items-center justify-center gap-1">
          <BrandMark brand={byId.halden} size={12} /> You
        </span>
        <span className="flex items-center justify-center gap-1">
          <BrandMark brand={byId.kiteline} size={12} /> Kiteline
        </span>
      </div>
      <ul>
        {sources.map((s) => (
          <li
            key={s.name}
            className="grid grid-cols-[1fr_64px_64px] items-center px-3.5 py-2.5 transition-colors hover:bg-[#fbfbfb]"
          >
            <span className="flex items-center gap-2 text-ink">
              <svg viewBox="0 0 24 24" width={13} height={13} fill={`#${s.icon.hex}`} aria-hidden>
                <path d={s.icon.path} />
              </svg>
              {s.name}
            </span>
            {[s.you, s.them].map((has, i) => (
              <span key={i} className="text-center">
                {has ? (
                  <Check size={13} weight="bold" className="mx-auto text-up" aria-label="Cited" />
                ) : (
                  <span className="text-faint" aria-label="Not cited">-</span>
                )}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </MiniPanel>
  );
}

const actions = [
  "Publish a CRM for startups page",
  "Pitch 3 startup tool roundups",
  "Answer the top Reddit thread",
];

function ActOnInsights() {
  const [done, setDone] = useState<boolean[]>([true, false, false]);
  return (
    <MiniPanel className="group-hover:-translate-y-1">
      <div className="p-3.5">
        <span className="rounded-[5px] bg-[#fdf2f2] px-1.5 py-px text-[10px] font-medium text-[#b91c1c]">
          High impact
        </span>
        <p className="mt-2 font-medium text-ink">Citation gap on startup CRM prompts</p>
        <p className="mt-1 text-muted">Kiteline is cited by 7 recurring sources. You are cited by 2.</p>
      </div>
      <ul className="border-t border-line p-1.5">
        {actions.map((a, i) => (
          <li key={a}>
            <button
              type="button"
              aria-pressed={done[i]}
              onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
              className="flex w-full items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-left transition-colors hover:bg-sunken"
            >
              <span
                className={cx(
                  "grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
                  done[i] ? "border-ink bg-ink text-white" : "border-line-strong",
                )}
              >
                {done[i] && <Check size={9} weight="bold" />}
              </span>
              <span
                className={cx(
                  "relative transition-colors",
                  done[i] ? "text-faint" : "text-ink",
                )}
              >
                {a}
                <span
                  aria-hidden
                  className={cx(
                    "absolute top-1/2 left-0 h-px w-full origin-left bg-faint transition-transform duration-300",
                    done[i] ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </MiniPanel>
  );
}

export function FeaturesBento() {
  return (
    <Section id="how-it-works" innerClassName="py-20 md:py-28">
      <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-line-strong bg-surface px-2 py-1 text-[13px] text-ink-2">
        <Sparkle size={13} />
        How it works
      </span>
      <SectionHeading className="mt-5 max-w-[640px]" title="From first prompt to a clear plan" />
      <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-muted">
        Set up once in minutes. AnswerIntel keeps asking, measuring, and telling you what to fix.
      </p>

      <div className="mt-12 grid gap-3 lg:grid-cols-12">
        <Card
          className="lg:col-span-7"
          title="Discover the questions buyers ask"
          body="We turn your category, market, and competitors into 30 to 50 realistic prompts."
        >
          <DiscoverPrompts />
        </Card>
        <Card
          className="lg:col-span-5"
          surface="dots"
          title="Focus on prompts that sell"
          body="Every prompt is scored for buying intent, so you track what moves revenue."
        >
          <PickPrompts />
        </Card>
        <Card
          className="lg:col-span-5"
          title="Add the competitors that matter"
          body="Track up to five rivals and see every answer where they beat you."
        >
          <AddCompetitors />
        </Card>
        <Card
          className="lg:col-span-7"
          surface="sunken"
          title="Pick the AI engines to scan"
          body="ChatGPT, Perplexity, Gemini, and Google AI Overviews, all from one place."
        >
          <ChooseEngines />
        </Card>
        <Card
          className="lg:col-span-7"
          surface="dots"
          title="Find the sources AI trusts"
          body="See which sites AI cites in your category, and where only your competitors appear."
        >
          <KeySources />
        </Card>
        <Card
          className="lg:col-span-5"
          title="Act on clear next steps"
          body="Every gap becomes a short list of actions, ranked by impact."
        >
          <ActOnInsights />
        </Card>
      </div>
    </Section>
  );
}
