import { AnswerAnatomy } from "@/components/marketing/sections/answer-anatomy";
import { DashboardShowcase } from "@/components/marketing/sections/dashboard-showcase";
import { Experiments } from "@/components/marketing/sections/experiments";
import { Faq } from "@/components/marketing/sections/faq";
import { FeaturesBento } from "@/components/marketing/sections/features-bento";
import { Footer } from "@/components/marketing/sections/footer";
import { HeadToHead } from "@/components/marketing/sections/head-to-head";
import { Hero } from "@/components/marketing/sections/hero";
import { Nav } from "@/components/marketing/sections/nav";
import { PromptLibrary } from "@/components/marketing/sections/prompt-library";
import { WaitlistCta } from "@/components/marketing/sections/waitlist-cta";
import { WhyLosing } from "@/components/marketing/sections/why-losing";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <DashboardShowcase />
        <AnswerAnatomy />
        <FeaturesBento />
        <HeadToHead />
        <WhyLosing />
        <PromptLibrary />
        <Experiments />
        <WaitlistCta />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
