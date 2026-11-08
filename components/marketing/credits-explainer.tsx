"use client";

import { useState } from "react";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import { ENGINE_CREDITS, type PaidPlan, PLANS, RUNS_PER_MONTH, WEB_SEARCH_ENGINES, creditsFor } from "@/lib/billing/plans";
import type { Engine } from "@/lib/data";
import { cx } from "@/lib/cx";
import { formatCredits } from "@/lib/format";

const MAX_WEIGHT = Math.max(...Object.values(ENGINE_CREDITS));
const ENGINES = Object.keys(ENGINE_CREDITS) as Engine[];
const GROUPS = [
  { title: "Searches the live web", engines: ENGINES.filter((e) => WEB_SEARCH_ENGINES.includes(e)) },
  { title: "Answers from memory", engines: ENGINES.filter((e) => !WEB_SEARCH_ENGINES.includes(e)) },
];
/** The example leaves out the memory-only extras on Pro: they are optional, and most teams track the main four. */
const exampleEngines = (engines: Engine[]) => engines.filter((e) => WEB_SEARCH_ENGINES.includes(e) || e === "claude");

/** "How credits work": what a month of credits buys on each plan (left) and what one answer costs per engine (right). */
export function CreditsExplainer() {
  const [key, setKey] = useState<PaidPlan>("growth");
  const plan = PLANS.find((p) => p.key === key) ?? PLANS[0];
  const engines = exampleEngines(plan.engines);
  const perScan = plan.prompts * engines.reduce((sum, e) => sum + creditsFor(e), 0);
  const weekly = Math.min(plan.credits, perScan * RUNS_PER_MONTH);
  const spare = plan.credits - weekly;
  const extraScans = Math.floor(spare / perScan);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
      <article className="flex flex-col rounded-[24px] border border-line-strong bg-surface p-6 md:p-8">
        <div role="radiogroup" aria-label="Plan" className="inline-flex self-start rounded-full border border-line-strong bg-sunken p-1 text-[14px]">
          {PLANS.map((p) => (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={p.key === key}
              onClick={() => setKey(p.key)}
              className={cx("rounded-full px-4 py-1.5 transition-colors", p.key === key ? "bg-ink text-white" : "text-muted hover:text-ink")}
            >
              {p.name}
            </button>
          ))}
        </div>

        <p className="mt-8 flex items-baseline gap-2">
          <span className="font-display text-[56px] leading-none font-semibold tracking-[-0.045em] tabular-nums">{plan.credits.toLocaleString("en-US")}</span>
          <span className="text-[16px] text-muted">credits a month</span>
        </p>

        <div aria-hidden className="mt-6 flex h-3 overflow-hidden rounded-full bg-sunken">
          <span className="h-full bg-mark-strong transition-[width] duration-500" style={{ width: `${(weekly / plan.credits) * 100}%` }} />
          <span className="h-full bg-mark transition-[width] duration-500" style={{ width: `${(spare / plan.credits) * 100}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[13px] text-muted">
          <span className="flex items-center gap-2"><span aria-hidden className="size-2 rounded-full bg-mark-strong" />Weekly tracking ≈ {formatCredits(Math.round(weekly))}</span>
          <span className="flex items-center gap-2"><span aria-hidden className="size-2 rounded-full bg-mark" />Left for scans you start ≈ {formatCredits(Math.round(spare))}</span>
        </div>

        <dl className="mt-8 space-y-3 border-t border-line pt-6 text-[14px]">
          <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-muted">One full scan</dt>
            <dd className="text-right tabular-nums text-ink">
              {plan.prompts} prompts × {formatCredits(perScan / plan.prompts)} = <strong className="font-medium">{formatCredits(perScan)} credits</strong>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Weekly, for a month</dt>
            <dd className="tabular-nums text-ink">× {RUNS_PER_MONTH} runs</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Extra full scans</dt>
            <dd className="text-right tabular-nums text-ink">{extraScans > 0 ? `about ${extraScans} more` : "room for re-tests and smaller scans"}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center gap-3 pt-8">
          <ul aria-label="Engines in this example" className="flex -space-x-1.5">
            {engines.map((e) => (
              <li key={e} title={engineNames[e]} className="grid size-8 place-items-center rounded-full bg-white text-[#0d0d0d] ring-2 ring-surface">
                <EngineIcon engine={e} size={15} />
                <span className="sr-only">{engineNames[e]}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-snug text-faint">
            Example: every prompt on {engines.length === 2 ? "both engines" : `these ${engines.length} engines`}, tracked weekly.
          </p>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-[24px] bg-night p-6 text-white md:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-28 -right-28 size-64 rounded-full bg-mark/15 blur-3xl" />
        <h3 className="relative text-[19px] font-medium">What one answer costs</h3>
        <p className="relative mt-1.5 text-[14px] leading-snug text-white/55">
          1 credit = 1 ChatGPT Search answer. Engines that search the web cost more, because every search is a paid call.
        </p>

        {GROUPS.map((group) => (
          <section key={group.title} className="relative mt-7">
            <h4 className="text-[12px] font-medium tracking-[0.08em] text-white/45 uppercase">{group.title}</h4>
            <ul className="mt-3 space-y-3.5">
              {group.engines.map((e) => (
                <li key={e} className="grid grid-cols-[2rem_minmax(0,7.5rem)_1fr_3rem] items-center gap-3 text-[14px]">
                  <span className="grid size-8 place-items-center rounded-full bg-white text-[#0d0d0d]">
                    <EngineIcon engine={e} size={16} />
                  </span>
                  <span className="truncate text-white/85">{engineNames[e]}</span>
                  <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-mark" style={{ width: `${(creditsFor(e) / MAX_WEIGHT) * 100}%` }} />
                  </span>
                  <span className="text-right font-display text-[17px] font-semibold tracking-[-0.02em] tabular-nums">
                    {formatCredits(creditsFor(e))}
                    <span className="sr-only"> {creditsFor(e) === 1 ? "credit" : "credits"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="relative mt-8 border-t border-white/10 pt-5 text-[13px] text-white/50">
          Credits count over any 30 days, so a scan frees its credits a month after it ran.
        </p>
      </article>
    </div>
  );
}
