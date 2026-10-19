"use client";

import { Check, CreditCard, LockKey, Receipt } from "@phosphor-icons/react";
import { useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { Mark } from "@/components/ui/mark";
import { type Interval, PLANS } from "@/lib/billing/plans";
import { cx } from "@/lib/cx";

const ASSURANCES = [
  { icon: CreditCard, text: "Change plan or cancel any time" },
  { icon: Receipt, text: "Invoices for every payment" },
  { icon: LockKey, text: "Secure checkout by Stripe" },
];

function PeriodToggle({ value, onChange }: { value: Interval; onChange: (v: Interval) => void }) {
  return (
    <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full border border-line-strong bg-surface p-1 text-[14px]">
      {(["month", "year"] as const).map((key) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={cx(
            "inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition-colors",
            value === key ? "bg-ink text-white" : "text-muted hover:text-ink",
          )}
        >
          {key === "month" ? "Monthly" : "Yearly"}
          {key === "year" && (
            <span className={cx("rounded-full px-1.5 py-px text-[11px] font-medium", value === key ? "bg-mark text-ink" : "bg-mark-soft text-ink")}>
              2 months free
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Pricing() {
  const [period, setPeriod] = useState<Interval>("month");

  return (
    <Section id="pricing">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Reveal className="max-w-[620px]">
          <SectionHeading
            title={
              <>
                One plan for your <Mark delay={0.3}>whole team</Mark>
              </>
            }
            muted="Every plan asks ChatGPT, Perplexity and Gemini the questions your buyers ask, and tells you what to fix."
          />
        </Reveal>
        <Reveal delay={0.05}>
          <PeriodToggle value={period} onChange={setPeriod} />
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PLANS.map((plan, i) => {
          const pro = plan.key === "pro";
          const price = period === "month" ? plan.monthly : Math.round(plan.yearly / 12);
          return (
            <Reveal key={plan.key} delay={0.08 * i} className="h-full">
              <article
                className={cx(
                  "relative flex h-full flex-col overflow-hidden rounded-[28px] p-7 md:p-9",
                  pro ? "bg-night text-white shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]" : "border border-line-strong bg-surface",
                )}
              >
                {pro && <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-mark/20 blur-3xl" />}
                <header className="relative flex items-center gap-2.5">
                  <h3 className="font-display text-[24px] font-semibold tracking-[-0.03em]">{plan.name}</h3>
                  {pro && <span className="rounded-full bg-mark px-2.5 py-0.5 text-[12px] font-medium text-ink">Most popular</span>}
                </header>
                <p className={cx("relative mt-1.5 text-[15px]", pro ? "text-white/60" : "text-muted")}>{plan.blurb}</p>

                <div className="relative mt-8 flex items-end gap-2">
                  <span className="font-display text-[60px] leading-[0.9] font-semibold tracking-[-0.05em] tabular-nums">${price}</span>
                  <span className={cx("pb-1 text-[14px] leading-tight", pro ? "text-white/60" : "text-muted")}>
                    per month
                    <br />
                    {period === "year" ? `$${plan.yearly} billed yearly` : "billed monthly"}
                  </span>
                </div>

                <a
                  href={`/register?plan=${plan.key}&interval=${period}`}
                  className={cx(
                    "relative mt-8 w-full",
                    pro
                      ? "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-mark pr-4 pl-5 text-[15px] font-medium text-ink transition-[background-color,transform] duration-150 hover:bg-[#cbe85a] active:scale-[0.98]"
                      : buttonClass("secondary"),
                  )}
                >
                  Get {plan.name}
                  <ButtonArrow />
                </a>

                <ul className={cx("relative mt-8 space-y-3 border-t pt-8 text-[15px]", pro ? "border-white/10" : "border-line")}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span className={cx("grid size-5 shrink-0 place-items-center rounded-full", pro ? "bg-mark text-ink" : "bg-sunken text-ink")}>
                        <Check size={11} weight="bold" />
                      </span>
                      <span className={pro ? "text-white/85" : "text-ink-2"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.1}>
        <ul className="mt-6 flex flex-col gap-3 rounded-[20px] border border-line-strong bg-surface px-6 py-4 text-[14px] text-ink-2 sm:flex-row sm:items-center sm:justify-between">
          {ASSURANCES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5">
              <Icon size={18} className="shrink-0 text-muted" />
              {text}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
