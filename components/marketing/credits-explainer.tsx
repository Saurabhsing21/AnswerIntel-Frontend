import { Globe } from "@phosphor-icons/react/ssr";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import { ENGINE_CREDITS, FEATURED, PLANS, RUNS_PER_MONTH, WEB_SEARCH_ENGINES, creditsFor } from "@/lib/billing/plans";
import type { Engine } from "@/lib/data";
import { cx } from "@/lib/cx";
import { formatCredits } from "@/lib/format";

/** Engines grouped by what one answer costs, dearest first: 1.25, 1, 0.5, 0.25. */
const TIERS = [...new Set(Object.values(ENGINE_CREDITS))]
  .sort((a, b) => b - a)
  .map((price) => ({ price, engines: (Object.keys(ENGINE_CREDITS) as Engine[]).filter((e) => creditsFor(e) === price) }));
/** The plan examples leave out Pro's memory-only extras: they are optional, and most teams track the main four. */
const exampleEngines = (engines: Engine[]) => engines.filter((e) => WEB_SEARCH_ENGINES.includes(e) || e === "claude");

/** "How credits work": what one answer costs, by price tier, then what each plan's month of credits buys. */
export function CreditsExplainer() {
  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-line-strong bg-surface p-6 shadow-[0_1px_0_rgb(0_0_0/0.02),0_24px_48px_-32px_rgb(0_0_0/0.18)] md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <p className="font-display text-[32px] leading-[1.05] font-semibold tracking-[-0.04em] md:text-[44px]">
            <span className="rounded-[10px] bg-mark px-2">1 credit</span> = 1 ChatGPT Search answer
          </p>
          <p className="flex items-center gap-2 text-[14px] text-muted">
            <Globe size={15} weight="bold" aria-hidden className="text-ink" /> searches the live web
          </p>
        </div>

        <ul aria-label="Credits per answer, by AI engine" className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line">
          {TIERS.map((tier) => (
            <li key={tier.price} className="lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <p className="font-display text-[48px] leading-none font-semibold tracking-[-0.045em] tabular-nums">{formatCredits(tier.price)}</p>
              <p className="mt-2 text-[13px] text-muted">{tier.price === 1 ? "credit" : "credits"} per answer</p>
              <ul className="mt-6 space-y-3">
                {tier.engines.map((e) => (
                  <li key={e} className="flex items-center gap-2.5 text-[14px] text-ink-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[#0d0d0d] ring-1 ring-line">
                      <EngineIcon engine={e} size={14} />
                    </span>
                    <span className="min-w-0 leading-tight">{engineNames[e]}</span>
                    {WEB_SEARCH_ENGINES.includes(e) && (
                      <Globe size={13} weight="bold" className="shrink-0 text-muted">
                        <title>Searches the live web</title>
                      </Globe>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative overflow-hidden rounded-[28px] bg-night p-6 text-white md:p-10">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-80 -translate-x-1/2 rounded-full bg-mark/12 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <h3 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.03em] md:text-[32px]">What a month of credits buys</h3>
          <p className="flex items-center gap-5 text-[13px] text-white/55">
            <span className="flex items-center gap-2"><span aria-hidden className="h-1.5 w-4 rounded-full bg-mark" />Weekly tracking</span>
            <span className="flex items-center gap-2"><span aria-hidden className="h-1.5 w-4 rounded-full bg-white/25" />Yours to spend</span>
          </p>
        </div>

        <ul className="relative mt-10 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/10">
          {PLANS.map((plan) => {
            const engines = exampleEngines(plan.engines);
            const perScan = plan.prompts * engines.reduce((sum, e) => sum + creditsFor(e), 0);
            const weekly = Math.min(plan.credits, perScan * RUNS_PER_MONTH);
            const extra = Math.floor((plan.credits - weekly) / perScan);
            return (
              <li key={plan.key} className="md:px-8 md:first:pl-0 md:last:pr-0">
                <p className="flex items-center gap-2 text-[14px] text-white/60">
                  <span className={cx("font-medium", plan.key === FEATURED ? "text-mark" : "text-white")}>{plan.name}</span>
                  <span aria-hidden>·</span> ${plan.monthly}/mo
                </p>
                <p className="mt-4 font-display text-[48px] leading-none font-semibold tracking-[-0.045em] tabular-nums">
                  {plan.credits.toLocaleString("en-US")}
                </p>
                <div aria-hidden className="mt-6 flex h-1.5 gap-1">
                  <span className="rounded-full bg-mark" style={{ width: `${(weekly / plan.credits) * 100}%` }} />
                  <span className="flex-1 rounded-full bg-white/20" />
                </div>
                <p className="mt-4 text-[14px] leading-snug text-white/65">
                  {plan.prompts} prompts × {engines.length} engines weekly, {extra > 0 ? `plus about ${extra} extra ${extra === 1 ? "scan" : "scans"}` : "plus room for re-tests"}.
                </p>
              </li>
            );
          })}
        </ul>
        <p className="relative mt-8 text-[13px] text-white/40">
          Credits count over any 30 days. Pro&apos;s example uses its four main engines.
        </p>
      </section>
    </div>
  );
}
