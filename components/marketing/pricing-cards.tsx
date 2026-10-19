"use client";

import { Check } from "@phosphor-icons/react";
import { useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { FEATURED, type Interval, PLANS } from "@/lib/billing/plans";
import { cx } from "@/lib/cx";

export function PeriodToggle({ value, onChange }: { value: Interval; onChange: (v: Interval) => void }) {
  return (
    <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full border border-line-strong bg-surface p-1 text-[14px]">
      {(["month", "year"] as const).map((key) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={cx("inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition-colors", value === key ? "bg-ink text-white" : "text-muted hover:text-ink")}
        >
          {key === "month" ? "Monthly" : "Yearly"}
          {key === "year" && (
            <span className={cx("rounded-full px-1.5 py-px text-[11px] font-medium", value === key ? "bg-mark text-ink" : "bg-mark-soft text-ink")}>2 months free</span>
          )}
        </button>
      ))}
    </div>
  );
}

function List({ title, items, dark }: { title: string; items: readonly string[]; dark: boolean }) {
  return (
    <div>
      <p className={cx("text-[12px] font-medium tracking-[0.06em] uppercase", dark ? "text-white/45" : "text-faint")}>{title}</p>
      <ul className="mt-3.5 space-y-3 text-[15px]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className={cx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", dark ? "bg-mark text-ink" : "bg-sunken text-ink")}>
              <Check size={11} weight="bold" />
            </span>
            <span className={dark ? "text-white/85" : "text-ink-2"}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The three plans as long cards with a monthly/yearly switch. Buttons start sign-up with the plan chosen. */
export function PricingCards({ toggleClassName }: { toggleClassName?: string }) {
  const [period, setPeriod] = useState<Interval>("month");
  return (
    <>
      <div className={cx("flex", toggleClassName)}>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const dark = plan.key === FEATURED;
          const price = period === "month" ? plan.monthly : Math.round((plan.yearly / 12) * 100) / 100;
          return (
            <Reveal key={plan.key} delay={0.06 * i} className="h-full">
              <article
                className={cx(
                  "relative flex h-full flex-col overflow-hidden rounded-[28px] p-7 md:p-8",
                  dark ? "bg-night text-white shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]" : "border border-line-strong bg-surface",
                )}
              >
                {dark && <div aria-hidden className="pointer-events-none absolute -top-28 -right-28 size-72 rounded-full bg-mark/20 blur-3xl" />}
                <header className="relative flex items-center gap-2.5">
                  <h3 className="font-display text-[24px] font-semibold tracking-[-0.03em]">{plan.name}</h3>
                  {dark && <span className="rounded-full bg-mark px-2.5 py-0.5 text-[12px] font-medium text-ink">Most popular</span>}
                </header>
                <p className={cx("relative mt-2 min-h-[48px] text-[15px] leading-snug", dark ? "text-white/60" : "text-muted")}>{plan.audience}</p>

                <div className="relative mt-6 flex items-end gap-2">
                  <span className="font-display text-[56px] leading-[0.9] font-semibold tracking-[-0.05em] tabular-nums">${price}</span>
                  <span className={cx("pb-1 text-[14px] leading-tight", dark ? "text-white/60" : "text-muted")}>
                    per month
                    <br />
                    {period === "year" ? `$${plan.yearly} billed yearly` : "billed monthly"}
                  </span>
                </div>

                <a
                  href={`/register?plan=${plan.key}&interval=${period}`}
                  className={cx(
                    "relative mt-7 w-full",
                    dark
                      ? "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-mark pr-4 pl-5 text-[15px] font-medium text-ink transition-[background-color,transform] duration-150 hover:bg-[#cbe85a] active:scale-[0.98]"
                      : buttonClass("secondary"),
                  )}
                >
                  Get {plan.name}
                  <ButtonArrow />
                </a>

                <div className={cx("relative mt-8 space-y-8 border-t pt-8", dark ? "border-white/10" : "border-line")}>
                  <List title="Usage" items={plan.limits} dark={dark} />
                  <List title="Features" items={plan.features} dark={dark} />
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
