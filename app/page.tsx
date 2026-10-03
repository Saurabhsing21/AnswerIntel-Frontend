import { Experiments } from "@/components/marketing/sections/experiments";
import { Faq } from "@/components/marketing/sections/faq";
import { FeaturesBento } from "@/components/marketing/sections/features-bento";
import { Footer } from "@/components/marketing/sections/footer";
import { Hero } from "@/components/marketing/sections/hero";
import { MetricsTabs } from "@/components/marketing/sections/metrics-tabs";
import { Nav } from "@/components/marketing/sections/nav";
import { PromptMarquee } from "@/components/marketing/sections/prompt-marquee";
import { Standing } from "@/components/marketing/sections/standing";
import { WaitlistCta } from "@/components/marketing/sections/waitlist-cta";
import { WhyLosing } from "@/components/marketing/sections/why-losing";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <MetricsTabs />
        <FeaturesBento />
        <Standing />
        <WhyLosing />
        <Experiments />
        <PromptMarquee />
        <WaitlistCta />
        <Faq />
        <div className="h-16 border-t border-line">
          <div className="mx-auto h-full max-w-[1200px] border-x border-line" />
        </div>
      </main>
      <Footer />
    </>
  );
}
