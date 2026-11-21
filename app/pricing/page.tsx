import type { Metadata } from "next";
import { headers } from "next/headers";
import { JsonLd } from "@/components/blog/json-ld";
import { Reveal } from "@/components/marketing/effects/reveal";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { CreditsExplainer } from "@/components/marketing/credits-explainer";
import { PricingCompare } from "@/components/marketing/pricing-compare";
import { PricingFaq } from "@/components/marketing/pricing-faq";
import { PricingPeriod } from "@/components/marketing/pricing-period";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { Mark } from "@/components/ui/mark";
import { PLANS, PRICING_FAQ } from "@/lib/billing/plans";
import { PUBLIC_URL } from "@/lib/urls";

export const metadata: Metadata = {
  title: "AI Visibility Tracker Pricing, From $20/Month | Seenlense",
  description: "AI visibility tracking from $20 a month: track how ChatGPT, Perplexity and Gemini recommend your brand against competitors. One free scan, no card.",
  alternates: { canonical: "/pricing" },
};

// Plans with monthly and yearly prices, and the billing FAQ, in the form search engines and AI assistants read.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Seenlense",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${PUBLIC_URL}/pricing`,
      publisher: { "@id": `${PUBLIC_URL}/#organization` },
      offers: PLANS.flatMap((p) => [
        { "@type": "Offer", name: `${p.name} (monthly)`, price: p.monthly, priceCurrency: "USD", url: `${PUBLIC_URL}/pricing`, priceSpecification: { "@type": "UnitPriceSpecification", price: p.monthly, priceCurrency: "USD", billingDuration: "P1M" } },
        { "@type": "Offer", name: `${p.name} (yearly)`, price: p.yearly, priceCurrency: "USD", url: `${PUBLIC_URL}/pricing`, priceSpecification: { "@type": "UnitPriceSpecification", price: p.yearly, priceCurrency: "USD", billingDuration: "P1Y" } },
      ]),
    },
    {
      "@type": "FAQPage",
      mainEntity: PRICING_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const { subscribe } = await searchParams; // sent here by the app when the workspace has no plan yet
  // Vercel's geo header picks the visitor's local prices; without it Paddle works the country out from their IP.
  const country = (await headers()).get("x-vercel-ip-country") ?? undefined;
  return (
    <>
      <JsonLd data={structuredData} />
      <Nav />
      <main id="top">
        <PricingPeriod>
          {/* Compact on purpose: all three prices should be visible without scrolling. */}
          <Section innerClassName="md:pt-10">
            <Reveal className="mx-auto max-w-[720px] text-center">
              {subscribe && (
                <p role="status" className="mx-auto mb-6 w-fit rounded-full border border-line-strong bg-surface px-4 py-2 text-[14px] text-ink-2">
                  You&apos;re signed in. Choose a plan to open your dashboard.
                </p>
              )}
              <h1 className="text-balance font-display text-[38px] leading-[1.02] font-semibold tracking-[-0.04em] md:text-[54px]">
                Pricing for <Mark delay={0.3}>every stage</Mark>
              </h1>
              <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-muted">
                See how ChatGPT, Perplexity, Claude and Gemini recommend your brand, and what to fix first. One plan per workspace, shared by your team.
              </p>
            </Reveal>
            <div className="mt-8">
              <PricingCards toggleClassName="justify-center" country={country} />
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
        </PricingPeriod>

        <Section id="credits">
          <Reveal>
            <SectionHeading title="How credits work" muted="Every plan comes with a monthly pool of credits. Each AI answer a scan collects spends a little of it, more for engines that search the live web." className="max-w-[680px]" />
          </Reveal>
          <div className="mt-10">
            <CreditsExplainer />
          </div>
        </Section>

        <Section innerClassName="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading title="Billing questions" muted="Payments run on Paddle, our reseller and merchant of record. Every charge comes with an invoice." />
          </div>
          <PricingFaq />
        </Section>
      </main>
      <Footer />
    </>
  );
}
