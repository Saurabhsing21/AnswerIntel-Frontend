import { Check } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/marketing/effects/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { buttonClass } from "@/components/ui/button";
import { PLANS, TRIAL_DAYS } from "@/lib/billing/plans";
import { cx } from "@/lib/cx";

export function Pricing() {
  return (
    <Section id="pricing">
      <Reveal>
        <SectionHeading
          title="Simple pricing per workspace"
          muted={`Start with a ${TRIAL_DAYS}-day free trial with every Pro feature, no card needed. Your whole team shares one plan.`}
          className="max-w-[680px]"
        />
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PLANS.map((plan, i) => {
          const featured = plan.key === "pro";
          return (
            <Reveal key={plan.key} delay={0.08 * i}>
              <div className={cx("flex h-full flex-col rounded-card border p-6 md:p-8", featured ? "border-ink bg-surface shadow-[0_30px_60px_-30px_rgb(0_0_0/0.3)]" : "border-line-strong bg-surface")}>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em]">{plan.name}</h3>
                  {featured && <span className="rounded-full bg-mark px-2 py-0.5 text-[11px] font-medium text-ink">Most popular</span>}
                </div>
                <p className="mt-1 text-[14px] text-muted">{plan.blurb}</p>
                <p className="mt-6 font-display text-[44px] font-semibold leading-none tracking-[-0.04em]">
                  ${plan.monthly}
                  <span className="text-[15px] font-normal tracking-normal text-muted"> / month</span>
                </p>
                <p className="mt-2 text-[13px] text-muted">or ${plan.yearly} a year, two months free</p>
                <ul className="mt-6 mb-8 space-y-2 text-[14px] text-ink-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={15} weight="bold" className="mt-0.5 shrink-0 text-up" /> {f}
                    </li>
                  ))}
                </ul>
                {/* Launching to the waitlist first; point this at /register once sign-ups open. */}
                <a href="#waitlist" className={cx(buttonClass(featured ? "primary" : "secondary"), "mt-auto w-full")}>
                  Join the waitlist
                </a>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
