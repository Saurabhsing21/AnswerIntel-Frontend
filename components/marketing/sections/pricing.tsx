import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/marketing/effects/reveal";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Mark } from "@/components/ui/mark";

export function Pricing() {
  return (
    <Section id="pricing">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Reveal className="max-w-[640px]">
          <SectionHeading
            title={
              <>
                One plan for your <Mark delay={0.3}>whole team</Mark>
              </>
            }
            muted="Every plan asks real AI engines the questions your buyers ask, and tells you what to fix. Pay monthly or yearly, cancel any time."
          />
        </Reveal>
        <a href="/pricing" className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-ink underline decoration-mark decoration-2 underline-offset-4">
          Compare every feature <ArrowRight size={15} />
        </a>
      </div>
      <PricingCards toggleClassName="mt-8" />
    </Section>
  );
}
