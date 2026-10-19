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
        {/* Compact on purpose: all three prices should be visible without scrolling. */}
        <Section innerClassName="md:pt-10">
          <Reveal className="mx-auto max-w-[720px] text-center">
            <h1 className="text-balance font-display text-[38px] leading-[1.02] font-semibold tracking-[-0.04em] md:text-[54px]">
              Pricing for <Mark delay={0.3}>every stage</Mark>
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-muted">
              See how ChatGPT, Perplexity, Gemini and Google AI recommend your brand, and what to fix first. One plan per workspace, shared by your team.
            </p>
            <a href="/check" className="mt-3 inline-block text-[14px] font-medium text-ink underline decoration-mark decoration-2 underline-offset-4">
              Not sure yet? Run a free check
            </a>
          </Reveal>
          <div className="mt-8">
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
