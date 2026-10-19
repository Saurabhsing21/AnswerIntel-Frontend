import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/effects/reveal";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { PricingCompare } from "@/components/marketing/pricing-compare";
import { PricingFaq } from "@/components/marketing/pricing-faq";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { Mark } from "@/components/ui/mark";

export const metadata: Metadata = {
  title: "Pricing - SeenLens",
  description: "SeenLens plans from $20 a month: track how ChatGPT, Perplexity and Gemini recommend your brand against competitors.",
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main id="top">
        <Section innerClassName="pt-16 md:pt-24">
          <Reveal className="mx-auto max-w-[760px] text-center">
            <p className="text-[14px] font-medium text-muted">Pricing</p>
            <h1 className="mt-3 text-balance font-display text-[44px] leading-[1] font-semibold tracking-[-0.045em] md:text-[72px]">
              Know where AI <Mark delay={0.3}>sends your buyers</Mark>
            </h1>
            <p className="mx-auto mt-6 max-w-[600px] text-[17px] leading-relaxed text-muted md:text-[18px]">
              Every plan asks real AI engines the questions your buyers ask, measures you against your competitors, and tells you what to fix
              first. One plan per workspace, shared by your whole team.
            </p>
          </Reveal>
          <div className="mt-12">
            <PricingCards toggleClassName="justify-center" />
          </div>
        </Section>

        <Section id="compare">
          <Reveal>
            <SectionHeading title="Compare every feature" muted="Limits and features, plan by plan. Usage limits are per workspace unless noted." className="max-w-[680px]" />
          </Reveal>
          <div className="mt-10">
            <PricingCompare />
          </div>
        </Section>

        <Section innerClassName="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading title="Billing questions" muted="Payments run on Stripe. You get an invoice for every charge." />
          </div>
          <PricingFaq />
        </Section>
      </main>
      <Footer />
    </>
  );
}
