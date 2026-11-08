import { Brain, Globe } from "@phosphor-icons/react/ssr";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import { ENGINE_CREDITS, FEATURED, PLANS, RUNS_PER_MONTH, WEB_SEARCH_ENGINES, creditsFor } from "@/lib/billing/plans";
import type { Engine } from "@/lib/data";
import { cx } from "@/lib/cx";
import { formatCredits } from "@/lib/format";

/** Engines from dearest to cheapest, so the tiles read as a price list. */
const ENGINES = (Object.keys(ENGINE_CREDITS) as Engine[]).sort((a, b) => creditsFor(b) - creditsFor(a));
/** The plan examples leave out Pro's memory-only extras: they are optional, and most teams track the main four. */
const exampleEngines = (engines: Engine[]) => engines.filter((e) => WEB_SEARCH_ENGINES.includes(e) || e === "claude");

/** A price drawn as quarter-credit coins: 1.25 credits is five coins, 0.25 is one. */
function Coins({ credits }: { credits: number }) {
  return (
    <span aria-hidden className="flex gap-1">
      {Array.from({ length: Math.round(credits * 4) }, (_, i) => (
        <span key={i} className="size-2.5 rounded-full bg-mark-strong" />
      ))}
    </span>
  );
}

function EngineTile({ engine }: { engine: Engine }) {
  const web = WEB_SEARCH_ENGINES.includes(engine);
  const credits = creditsFor(engine);
  return (
    <li className="flex flex-col rounded-[18px] border border-line-strong bg-surface p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-white text-[#0d0d0d] ring-1 ring-line">
          <EngineIcon engine={engine} size={18} />
        </span>
        <span
          title={web ? "Searches the live web" : "Answers from memory"}
          className={cx("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium sm:py-0.5", web ? "bg-mark-soft text-ink" : "bg-sunken text-muted")}
        >
          {web ? <Globe size={12} weight="bold" aria-hidden /> : <Brain size={12} weight="bold" aria-hidden />}
          <span className="sr-only sm:not-sr-only">{web ? "Live web" : "From memory"}</span>
        </span>
      </div>
      <p className="mt-4 truncate text-[14px] text-ink-2">{engineNames[engine]}</p>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="font-display text-[26px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
          {formatCredits(credits)}
          <span className="ml-1 font-sans text-[13px] font-normal tracking-normal text-muted">{credits === 1 ? "credit" : "credits"}</span>
        </span>
        <Coins credits={credits} />
      </div>
    </li>
  );
}

/** "How credits work": the price of one answer per engine, then what each plan's month of credits buys. */
export function CreditsExplainer() {
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-line-strong bg-sunken/60 p-5 md:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
          <div>
            <p className="text-[12px] font-medium tracking-[0.08em] text-muted uppercase">What one answer costs</p>
            <p className="mt-4 font-display text-[34px] leading-[1.05] font-semibold tracking-[-0.04em] md:text-[46px]">
              <span className="rounded-[10px] bg-mark px-2">1 credit</span> = 1 ChatGPT Search answer
            </p>
          </div>
          <p className="max-w-[44ch] text-[15px] leading-relaxed text-muted">
            Engines that search the live web cost more, because every search is a paid call. Engines that answer from memory cost a quarter of a credit.
          </p>
        </div>
        <ul aria-label="Credits per answer, by AI engine" className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {ENGINES.map((engine) => (
            <EngineTile key={engine} engine={engine} />
          ))}
          <li aria-hidden className="flex flex-col justify-between gap-4 rounded-[18px] border border-dashed border-line-strong p-3.5 text-[13px] leading-snug text-muted sm:p-4">
            <Coins credits={0.25} />
            <span>Each dot is a quarter of a credit. Four dots make one ChatGPT Search answer.</span>
          </li>
        </ul>
      </section>

      <section className="relative overflow-hidden rounded-[24px] bg-night p-6 text-white md:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/3 size-72 rounded-full bg-mark/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <div>
            <p className="text-[12px] font-medium tracking-[0.08em] text-white/45 uppercase">What a month buys</p>
            <h3 className="mt-2 text-[22px] font-medium tracking-[-0.01em]">Weekly tracking first, the rest is yours to spend</h3>
          </div>
          <p className="flex items-center gap-4 text-[13px] text-white/55">
            <span className="flex items-center gap-2"><span aria-hidden className="size-2 rounded-full bg-mark" />Weekly tracking</span>
            <span className="flex items-center gap-2"><span aria-hidden className="size-2 rounded-full bg-white/35" />Scans you start</span>
          </p>
        </div>

        <ul className="relative mt-8 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const engines = exampleEngines(plan.engines);
            const perScan = plan.prompts * engines.reduce((sum, e) => sum + creditsFor(e), 0);
            const weekly = Math.min(plan.credits, perScan * RUNS_PER_MONTH);
            const extra = Math.floor((plan.credits - weekly) / perScan);
            const featured = plan.key === FEATURED;
            return (
              <li key={plan.key} className={cx("flex flex-col rounded-[18px] p-5", featured ? "bg-white/[0.07] ring-1 ring-mark/40" : "bg-white/[0.04] ring-1 ring-white/10")}>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium">{plan.name}</span>
                  <span className="text-[13px] text-white/50">${plan.monthly}/mo</span>
                </div>
                <p className="mt-4 font-display text-[40px] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                  {plan.credits.toLocaleString("en-US")}
                  <span className="ml-1.5 font-sans text-[14px] font-normal tracking-normal text-white/55">credits</span>
                </p>
                <div aria-hidden className="mt-5 flex h-2 gap-1">
                  <span className="rounded-full bg-mark" style={{ width: `${(weekly / plan.credits) * 100}%` }} />
                  <span className="flex-1 rounded-full bg-white/25" />
                </div>
                <p className="mt-4 text-[14px] leading-snug text-white/75">
                  {plan.prompts} prompts on {engines.length === 2 ? "both engines" : `${engines.length} engines`} every week ({formatCredits(perScan)} credits a scan), then{" "}
                  {extra > 0 ? `room for about ${extra} more full ${extra === 1 ? "scan" : "scans"}.` : "room for re-tests and smaller scans."}
                </p>
                <ul aria-label="Engines in this example" className="mt-auto flex -space-x-1.5 pt-5">
                  {engines.map((e) => (
                    <li key={e} title={engineNames[e]} className="grid size-7 place-items-center rounded-full bg-white text-[#0d0d0d] ring-2 ring-night">
                      <EngineIcon engine={e} size={14} />
                      <span className="sr-only">{engineNames[e]}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
        <p className="relative mt-6 text-[13px] text-white/45">
          Credits count over any 30 days, so a scan frees its credits a month after it ran.{" "}
          {RUNS_PER_MONTH} weekly runs a month. Pro&apos;s example uses its four main engines.
        </p>
      </section>
    </div>
  );
}
