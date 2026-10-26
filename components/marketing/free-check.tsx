"use client";

import { ArrowClockwise, Check, CircleNotch, Link as LinkIcon, Quotes } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EngineIcon } from "@/components/product/engine-icon";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { Mark } from "@/components/ui/mark";
import type { Engine, FreeCheck } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { appHref } from "@/lib/urls";
import { ease } from "@/lib/motion";

type Result = NonNullable<FreeCheck["result"]>;
type Answer = Result["prompts"][number]["answers"][number];

/** A worked example for the form state, so people see what they get before typing. Clearly labelled as one. */
const EXAMPLE: FreeCheck = {
  id: "example",
  status: "done",
  brand_name: "Halden",
  website: "halden.co",
  category: "CRM software",
  country: "United States",
  result: {
    prompts: [
      {
        text: "What is the best CRM for a small sales team?",
        answers: [
          { engine: "chatgpt", engine_name: "ChatGPT", mentioned: true, recommended: true, position: 2, evidence: "For a team under ten people, Halden is the simplest option to set up." },
          { engine: "perplexity", engine_name: "Perplexity", mentioned: false, recommended: false, position: null, evidence: null },
        ],
      },
      {
        text: "Which CRM is easiest to learn?",
        answers: [
          { engine: "chatgpt", engine_name: "ChatGPT", mentioned: true, recommended: false, position: null, evidence: null },
          { engine: "perplexity", engine_name: "Perplexity", mentioned: true, recommended: true, position: 1, evidence: null },
        ],
      },
    ],
    summary: { answers: 4, mentioned: 3, recommended: 2, engines: ["ChatGPT", "Perplexity"] },
    top_sources: [],
    simulated: false,
  },
};

const STEPS = ["Writing five buyer questions", "Asking ChatGPT with web search", "Asking Perplexity", "Reading every answer"];

function verdictOf(a: Answer) {
  return a.recommended ? "recommended" : a.mentioned ? "mentioned" : "absent";
}

function Verdict({ a, compact }: { a: Answer; compact?: boolean }) {
  const v = verdictOf(a);
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium",
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]",
        v === "recommended" && "bg-up-soft text-up-ink",
        v === "mentioned" && "bg-blue-soft text-blue-ink",
        v === "absent" && "border border-dashed border-line-strong text-muted",
      )}
    >
      {v === "recommended" ? "Recommended" : v === "mentioned" ? "Mentioned" : "Not mentioned"}
      {a.position != null && <span className="font-mono opacity-70">#{a.position}</span>}
    </span>
  );
}

function engineTotals(r: Result) {
  const totals = new Map<Engine, { name: string; total: number; recommended: number; mentioned: number }>();
  for (const p of r.prompts) {
    for (const a of p.answers) {
      const t = totals.get(a.engine) ?? { name: a.engine_name, total: 0, recommended: 0, mentioned: 0 };
      t.total += 1;
      t.recommended += Number(a.recommended);
      t.mentioned += Number(a.mentioned);
      totals.set(a.engine, t);
    }
  }
  return [...totals.entries()];
}

function headline(check: FreeCheck, r: Result) {
  const { answers, mentioned, recommended } = r.summary;
  if (recommended > 0) return `AI recommends ${check.brand_name} in ${recommended} of ${answers} answers.`;
  if (mentioned > 0) return `AI mentions ${check.brand_name} in ${mentioned} of ${answers} answers, but never recommends it.`;
  return `AI does not mention ${check.brand_name} in any of ${answers} answers.`;
}

/* ---------- Score panel (used by the example and the real result) ---------- */

function ScorePanel({ check, example }: { check: FreeCheck; example?: boolean }) {
  const r = check.result!;
  const share = r.summary.answers ? r.summary.recommended / r.summary.answers : 0;
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-night p-6 text-white md:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-mark/20 blur-3xl" />
      <p className="relative text-[13px] text-white/55">{example ? "Example result" : `${check.website} · ${check.category}`}</p>
      <div className="relative mt-4 flex items-end gap-3">
        <span className="font-display text-[64px] leading-[0.85] font-semibold tracking-[-0.05em] tabular-nums md:text-[76px]">
          {r.summary.recommended}
          <span className="text-white/35">/{r.summary.answers}</span>
        </span>
        <span className="pb-1 text-[14px] leading-tight text-white/65">
          answers
          <br />
          recommend you
        </span>
      </div>
      <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-mark" style={{ width: `${Math.max(share * 100, 2)}%` }} />
      </div>
      <p className="relative mt-5 text-[16px] leading-snug text-white/90">{headline(check, r)}</p>
      <ul className="relative mt-5 space-y-2.5 border-t border-white/10 pt-5">
        {engineTotals(r).map(([engine, t]) => (
          <li key={engine} className="flex items-center gap-3 text-[14px]">
            <span className="grid size-7 place-items-center rounded-full bg-white/10">
              <EngineIcon engine={engine} size={13} mono />
            </span>
            <span className="text-white/85">{t.name}</span>
            <span className="ml-auto text-[13px] text-white/60 tabular-nums">
              <span className="text-mark">{t.recommended}</span> recommended, {t.mentioned} mentioned
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Form: the check reads as the question it answers ---------- */

function InlineField({ name, label, placeholder, defaultValue, maxLength }: { name: string; label: string; placeholder: string; defaultValue?: string; maxLength: number }) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <input
      name={name}
      aria-label={label}
      required={name !== "country"}
      maxLength={maxLength}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      style={{ width: `${Math.max((value || placeholder).length, 3) * 1.08 + 1.2}ch` }} // grows with the text
      className="mx-1 inline-block max-w-full rounded-[8px] border-b-2 border-ink/70 bg-mark-soft px-1.5 font-semibold text-ink outline-none transition-colors placeholder:font-medium placeholder:text-ink/35 focus:border-ink focus:bg-mark"
    />
  );
}

function CheckForm({ onStart, error }: { onStart: (body: Record<string, string>) => Promise<void>; error: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      <div>
        <h1 className="text-balance font-display text-[40px] leading-[1.05] font-semibold tracking-[-0.04em] md:text-[56px]">
          Does AI <Mark delay={0.3}>recommend you?</Mark>
        </h1>
        <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-muted">
          A free, one-minute check on ChatGPT and Perplexity, with live web search. No account.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            await onStart(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
            setBusy(false);
          }}
          className="mt-8 rounded-[24px] border border-line-strong bg-surface p-6 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.25)] md:p-7"
        >
          <p className="text-[20px] leading-[2] text-ink-2 md:text-[22px]">
            Is
            <InlineField name="brand_name" label="Brand name" placeholder="your brand" maxLength={120} />
            at
            <InlineField name="website" label="Website" placeholder="yoursite.com" maxLength={300} />
            recommended when people ask AI about
            <InlineField name="category" label="What you sell" placeholder="CRM software" maxLength={120} />
            in
            <InlineField name="country" label="Market" placeholder="United States" defaultValue="United States" maxLength={80} />?
          </p>
          {error && (
            <p role="alert" className="mt-4 rounded-[12px] bg-down-soft px-4 py-3 text-[14px] text-down-ink">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-5">
            <button type="submit" disabled={busy} className={buttonClass("primary")}>
              {busy && <CircleNotch size={16} className="animate-spin" />}
              Run free check
              <ButtonArrow />
            </button>
            <span className="flex items-center gap-1.5 text-[13px] text-muted">
              {(["chatgpt", "perplexity"] as const).map((e) => (
                <span key={e} className="grid size-6 place-items-center rounded-full border border-line">
                  <EngineIcon engine={e} size={11} />
                </span>
              ))}
              5 questions on 2 engines
            </span>
          </div>
        </form>
      </div>

      <div className="lg:pt-3">
        <ScorePanel check={EXAMPLE} example />
        <div className="mt-3 rounded-[20px] border border-line-strong bg-surface p-5">
          <p className="text-[14px] text-ink">&ldquo;{EXAMPLE.result!.prompts[0].text}&rdquo;</p>
          <p className="mt-3 flex gap-2 rounded-[12px] bg-mark-soft/60 px-3 py-2.5 text-[13px] text-ink-2">
            <Quotes size={14} weight="fill" className="mt-0.5 shrink-0 text-ink/40" />
            {EXAMPLE.result!.prompts[0].answers[0].evidence}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Waiting ---------- */

function Waiting({ check }: { check: FreeCheck }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  // The steps run in this order on the server; the timing is an estimate, the result itself arrives by polling.
  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 6000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
      <div>
        <h1 className="font-display text-[34px] leading-[1.05] font-semibold tracking-[-0.035em] md:text-[44px]">Checking {check.brand_name}</h1>
        <p className="mt-3 text-[16px] text-muted">
          {check.category} in {check.country}. Usually under a minute, keep this page open.
        </p>
        <ol className="mt-8 space-y-4">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3 text-[16px]">
              <span
                className={cx(
                  "grid size-7 shrink-0 place-items-center rounded-full transition-colors",
                  i < step ? "bg-ink text-white" : i === step ? "bg-mark text-ink" : "border border-line-strong text-faint",
                )}
              >
                {i < step ? <Check size={13} weight="bold" /> : i === step ? <CircleNotch size={13} className={reduce ? "" : "animate-spin"} /> : null}
              </span>
              <span className={i <= step ? "text-ink" : "text-faint"}>{label}</span>
            </li>
          ))}
        </ol>
      </div>
      <div aria-hidden className="space-y-3">
        <div className="h-[260px] animate-pulse rounded-[24px] bg-night/90" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[64px] animate-pulse rounded-[16px] bg-sunken" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Result ---------- */

function ResultView({ check, onReset }: { check: FreeCheck; onReset: () => void }) {
  const reduce = useReducedMotion();
  const r = check.result!;
  const engines = engineTotals(r).map(([engine, t]) => ({ engine, name: t.name }));
  const enter = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: i * 0.08, ease } };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <h1 className="font-display text-[34px] leading-[1.05] font-semibold tracking-[-0.035em] md:text-[44px]">{check.brand_name} in AI answers</h1>
        <button type="button" onClick={onReset} className="mb-1 inline-flex items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-ink md:ml-auto">
          <ArrowClockwise size={14} /> Check another brand
        </button>
      </div>
      {r.simulated && (
        <p className="rounded-[12px] border border-dashed border-line-strong px-4 py-2.5 text-[13px] text-muted">
          Sample answers: this server has no AI key, so the engines were simulated.
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.35fr]">
        <motion.div {...enter(0)} className="space-y-4 lg:sticky lg:top-24">
          <ScorePanel check={check} />
          <div className="rounded-[24px] border border-line-strong bg-surface p-6">
            <p className="text-[17px] font-medium text-ink">This was 5 questions, once.</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
              SeenLens tracks up to 160 questions on ChatGPT, Perplexity, Gemini and Google AI every week, against your competitors, and tells you what to fix.
            </p>
            <a href={appHref(`/register?${new URLSearchParams({ brand: check.brand_name, website: check.website, category: check.category, country: check.country })}`)} className={cx(buttonClass("primary"), "mt-5 w-full")}>
              Run your free full scan
              <ButtonArrow />
            </a>
            <a href="/pricing" className="mt-3 block text-center text-[13px] font-medium text-muted hover:text-ink">See plans</a>
          </div>
        </motion.div>

        <motion.div {...enter(1)} className="overflow-hidden rounded-[24px] border border-line-strong bg-surface">
          <div className="hidden grid-cols-[1fr_auto] items-center gap-4 border-b border-line bg-[#fafaf9] px-5 py-3 text-[12px] text-muted md:grid">
            <span>Question buyers ask</span>
            <span className="flex gap-6 pr-1">
              {engines.map((e) => (
                <span key={e.engine} className="flex w-[104px] items-center justify-center gap-1.5">
                  <EngineIcon engine={e.engine} size={12} /> {e.name}
                </span>
              ))}
            </span>
          </div>
          <ul>
            {r.prompts.map((p, i) => {
              const quote = p.answers.find((a) => a.evidence)?.evidence;
              return (
                <li key={p.text} className={cx("px-5 py-4", i > 0 && "border-t border-line")}>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center md:gap-4">
                    <p className="text-[15px] leading-snug text-ink">{p.text}</p>
                    <span className="flex flex-wrap gap-2 md:flex-nowrap md:gap-6">
                      {engines.map((e) => {
                        const a = p.answers.find((x) => x.engine === e.engine);
                        return (
                          <span key={e.engine} className="flex items-center gap-1.5 md:w-[104px] md:justify-center">
                            <span className="md:hidden">
                              <EngineIcon engine={e.engine} size={12} />
                            </span>
                            {a ? <Verdict a={a} compact /> : <span className="text-[12px] text-faint">No answer</span>}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                  {quote && (
                    <p className="mt-3 flex gap-2 rounded-[12px] bg-mark-soft/60 px-3 py-2.5 text-[13px] leading-relaxed text-ink-2">
                      <Quotes size={14} weight="fill" className="mt-0.5 shrink-0 text-ink/40" />
                      {quote}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          {r.why && r.why.length > 0 && (
            <div className="border-t border-line px-5 py-4">
              <p className="text-[13px] text-muted">Why AI may be missing you</p>
              <ul className="mt-2.5 space-y-2.5">
                {r.why.map((w) => (
                  <li key={w.code} className="text-[13px]">
                    <span className="font-medium text-ink">{w.title}.</span> <span className="text-ink-2">{w.action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {r.top_sources.length > 0 && (
            <div className="border-t border-line px-5 py-4">
              <p className="text-[13px] text-muted">Sources the AI cited</p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {r.top_sources.map((s) => (
                  <li key={s.domain} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-[12px] text-ink-2">
                    <LinkIcon size={12} /> {s.domain}
                    {s.count > 1 && <span className="text-faint">×{s.count}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Controller ---------- */

export function FreeCheckFlow() {
  const [check, setCheck] = useState<FreeCheck | null>(null);
  const [error, setError] = useState("");
  const pending = check && (check.status === "queued" || check.status === "running");

  // The check runs in the background on the server; poll until it finishes.
  useEffect(() => {
    if (!pending || !check) return;
    const t = window.setInterval(async () => {
      const res = await fetch(`/api/free-check/${check.id}`).catch(() => null);
      if (res?.ok) setCheck(await res.json());
    }, 2000);
    return () => window.clearInterval(t);
  }, [pending, check]);

  async function start(body: Record<string, string>) {
    setError("");
    try {
      const res = await fetch("/api/free-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Something went wrong. Please try again.");
      setCheck(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (check?.status === "done" && check.result) return <ResultView check={check} onReset={() => setCheck(null)} />;
  if (pending) return <Waiting check={check} />;
  return <CheckForm onStart={start} error={error || (check?.status === "failed" ? "The check could not finish. Please try again." : "")} />;
}
