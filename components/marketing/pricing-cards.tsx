"use client";

import { Check } from "@phosphor-icons/react";
import { useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { FEATURED, type Interval, PLANS } from "@/lib/billing/plans";
import { WAITLIST_ONLY } from "@/lib/flags";
import { cx } from "@/lib/cx";
import { appHref } from "@/lib/urls";

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
            <span className={cx("rounded-full px-1.5 py-px text-[11px] font-medium", value === key ? "bg-mark text-ink" : "bg-mark-soft text-ink")}>Save 20%</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** The three plans as compact cards with a monthly/yearly switch. Buttons start sign-up with the plan chosen. */
export function PricingCards({ toggleClassName }: { toggleClassName?: string }) {
  const [period, setPeriod] = useState<Interval>("month");
  return (
    <>
      <div className={cx("flex", toggleClassName)}>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const dark = plan.key === FEATURED;
          const price = period === "month" ? plan.monthly : plan.yearly / 12;
          return (
            <Reveal key={plan.key} delay={0.06 * i} className="h-full">
              <article
                className={cx(
                  "relative flex h-full flex-col overflow-hidden rounded-[24px] p-6 md:p-7",
                  dark ? "bg-night text-white shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]" : "border border-line-strong bg-surface",
                )}
              >
                {dark && <div aria-hidden className="pointer-events-none absolute -top-28 -right-28 size-64 rounded-full bg-mark/20 blur-3xl" />}
                <header className="relative flex items-center gap-2.5">
                  <h3 className="text-[19px] font-medium">{plan.name}</h3>
                  {dark && <span className="rounded-full bg-mark px-2 py-0.5 text-[11px] font-medium text-ink">Most popular</span>}
                </header>
                <p className="relative mt-2 flex items-baseline gap-1">
                  <span className="font-display text-[42px] leading-none font-semibold tracking-[-0.04em] tabular-nums">${price}</span>
                  <span className={cx("text-[16px]", dark ? "text-white/60" : "text-muted")}>/mo</span>
                </p>
                <p className={cx("relative mt-1.5 text-[13px]", dark ? "text-white/50" : "text-faint")}>
                  {period === "year" ? `$${plan.yearly} billed yearly` : "Billed monthly"}
                </p>

                <p className={cx("relative mt-5 border-t pt-5 text-[14px] leading-snug", dark ? "border-white/10 text-white/65" : "border-line text-muted")}>{plan.audience}</p>
                <a
                  href={WAITLIST_ONLY ? "/#waitlist" : appHref(`/subscribe?plan=${plan.key}&interval=${period}`)}
                  className={cx(
                    "relative mt-5 w-full",
                    dark
                      ? "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-mark pr-4 pl-5 text-[15px] font-medium text-ink transition-[background-color,transform] duration-150 hover:bg-[#cbe85a] active:scale-[0.98]"
                      : buttonClass("secondary"),
                  )}
                >
                  {WAITLIST_ONLY ? "Join waitlist" : "Get started"}
                  <ButtonArrow />
                </a>

                <p className={cx("relative mt-6 text-[13px]", dark ? "text-white/50" : "text-muted")}>This includes:</p>
                <ul className="relative mt-3 space-y-2.5 text-[14px]">
                  {plan.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={15} weight="bold" className={cx("mt-0.5 shrink-0", dark ? "text-mark" : "text-ink")} />
                      <span className={dark ? "text-white/85" : "text-ink-2"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
