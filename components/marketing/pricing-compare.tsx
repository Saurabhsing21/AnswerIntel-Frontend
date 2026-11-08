import { Check, Minus } from "@phosphor-icons/react/ssr";
import { EngineLogos } from "@/components/marketing/engine-logos";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import { COMPARISON, ENGINE_CREDITS, FEATURED, PLANS } from "@/lib/billing/plans";
import type { Engine } from "@/lib/data";
import { WAITLIST_ONLY } from "@/lib/flags";
import { cx } from "@/lib/cx";
import { appHref } from "@/lib/urls";

const grid = "grid grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(150px,1fr))]";

function Value({ value }: { value: boolean | string | Engine[] }) {
  if (Array.isArray(value)) return <EngineLogos engines={value} className="justify-center" />;
  if (value === true) return <Check size={18} weight="bold" className="text-ink" aria-label="Included" />;
  if (value === false) return <Minus size={18} className="text-faint" aria-label="Not included" />;
  return <span className="text-[14px] text-ink">{value}</span>;
}

/** Plan-by-plan breakdown, grouped like the product: discover, measure, act, report. */
export function PricingCompare() {
  return (
    // Scrolls sideways on small screens; on desktop it must not, or the plan header could not stick.
    <div className="overflow-x-auto lg:overflow-visible">
      <div className="min-w-[720px]">
        {/* Plan header stays in view while the long table scrolls past. */}
        <div className={cx(grid, "z-10 border-b border-line-strong bg-page lg:sticky lg:top-[84px]")}>
          <div className="py-4" />
          {PLANS.map((p) => (
            <div key={p.key} className="flex flex-col items-center gap-2 px-3 py-4 text-center">
              <p className="text-[15px] font-medium text-ink">
                {p.name} <span className="font-normal text-muted">· ${p.monthly}/mo</span>
              </p>
              <a
                href={WAITLIST_ONLY ? "/#waitlist" : appHref(`/subscribe?plan=${p.key}&interval=month`)}
                className={cx(
                  "inline-flex h-8 items-center rounded-full px-4 text-[13px] font-medium transition-colors",
                  p.key === FEATURED ? "bg-ink text-white hover:bg-[#2b2b2b]" : "border border-line-strong bg-surface text-ink hover:border-[rgb(0_0_0/0.22)]",
                )}
              >
                {WAITLIST_ONLY ? "Join waitlist" : `Get ${p.name}`}
              </a>
            </div>
          ))}
        </div>

        {COMPARISON.map((group) => (
          <section key={group.title} className="mt-10">
            <h3 className="mb-3 font-display text-[22px] font-semibold tracking-[-0.02em]">{group.title}</h3>
            <div className="overflow-hidden rounded-[18px] border border-line-strong bg-surface">
              {group.rows.map((row, i) => (
                <div key={row.label} className={cx(grid, "items-center", i > 0 && "border-t border-line")}>
                  <div className="px-5 py-3.5">
                    <p className="text-[14px] text-ink">{row.label}</p>
                    {row.hint && <p className="text-[12px] text-muted">{row.hint}</p>}
                  </div>
                  {row.values.map((v, j) => (
                    <div key={j} className={cx("flex h-full items-center justify-center border-l border-line px-3 py-3.5 text-center", PLANS[j].key === FEATURED && "bg-mark-soft/40")}>
                      <Value value={v} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** What one answer costs on each engine, in credits: turns a plan's monthly credits into prompts and engines. */
export function CreditsTable() {
  return (
    <div className="max-w-[640px] overflow-hidden rounded-[18px] border border-line-strong bg-surface">
      <table className="w-full text-left">
        <caption className="sr-only">Credits one answer costs, by AI engine</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">AI engine</th>
            <th scope="col">Credits per answer</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(ENGINE_CREDITS) as Engine[]).map((engine, i) => (
            <tr key={engine} className={cx("text-[14px]", i > 0 && "border-t border-line")}>
              <th scope="row" className="px-5 py-3 font-normal text-ink">
                <span className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sunken text-ink">
                    <EngineIcon engine={engine} size={16} mono />
                  </span>
                  {engineNames[engine]}
                </span>
              </th>
              <td className="px-5 py-3 text-right tabular-nums text-ink">
                {ENGINE_CREDITS[engine]} <span className="text-muted">{ENGINE_CREDITS[engine] === 1 ? "credit" : "credits"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
