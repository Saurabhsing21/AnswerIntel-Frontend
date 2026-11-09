import type { Metadata } from "next";
import { JsonLd } from "@/components/blog/json-ld";
import { Experiments } from "@/components/marketing/sections/experiments";
import { Faq } from "@/components/marketing/sections/faq";
import { FeaturesBento } from "@/components/marketing/sections/features-bento";
import { Footer } from "@/components/marketing/sections/footer";
import { HeadToHead } from "@/components/marketing/sections/head-to-head";
import { Hero } from "@/components/marketing/sections/hero";
import { Nav } from "@/components/marketing/sections/nav";
import { Pricing } from "@/components/marketing/sections/pricing";
import { PromptLibrary } from "@/components/marketing/sections/prompt-library";
import { Scan } from "@/components/marketing/sections/scan";
import { WaitlistCta } from "@/components/marketing/sections/waitlist-cta";
import { PLANS } from "@/lib/billing/plans";
import { faqs } from "@/lib/data";
import { PUBLIC_URL } from "@/lib/urls";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Who we are, what the product costs and the FAQ, in the form search engines and AI assistants read.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${PUBLIC_URL}/#organization`,
      name: "SeenLense",
      url: PUBLIC_URL,
      email: "saurabh@seenlense.com",
      logo: `${PUBLIC_URL}/icon.svg`,
      founder: { "@type": "Person", name: "Saurabh Singh" },
    },
    { "@type": "WebSite", "@id": `${PUBLIC_URL}/#website`, name: "SeenLense", url: PUBLIC_URL, publisher: { "@id": `${PUBLIC_URL}/#organization` } },
    {
      "@type": "SoftwareApplication",
      name: "SeenLense",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: PUBLIC_URL,
      description: "AI search visibility tracking: see how ChatGPT, Perplexity and Gemini mention and recommend your brand against competitors, and what to fix.",
      publisher: { "@id": `${PUBLIC_URL}/#organization` },
      offers: PLANS.map((p) => ({ "@type": "Offer", name: p.name, price: p.monthly, priceCurrency: "USD", url: `${PUBLIC_URL}/pricing` })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={structuredData} />
      <Nav />
      <main id="top">
        <Hero />
        <Scan />
        <FeaturesBento />
        <HeadToHead />
        <PromptLibrary />
        <Experiments />
        <Pricing />
        <WaitlistCta />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
