import { Experiments } from "@/components/marketing/sections/experiments";
import { Faq } from "@/components/marketing/sections/faq";
import { FeaturesBento } from "@/components/marketing/sections/features-bento";
import { Footer } from "@/components/marketing/sections/footer";
import { HeadToHead } from "@/components/marketing/sections/head-to-head";
import { Hero } from "@/components/marketing/sections/hero";
import { Nav } from "@/components/marketing/sections/nav";
import { PromptLibrary } from "@/components/marketing/sections/prompt-library";
import { Scan } from "@/components/marketing/sections/scan";
import { WaitlistCta } from "@/components/marketing/sections/waitlist-cta";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Scan />
        <FeaturesBento />
        <HeadToHead />
        <PromptLibrary />
        <Experiments />
        <WaitlistCta />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
