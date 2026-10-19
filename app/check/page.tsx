import type { Metadata } from "next";
import { FreeCheckFlow } from "@/components/marketing/free-check";
import { Section } from "@/components/marketing/section";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";

export const metadata: Metadata = {
  title: "Free AI visibility check - SeenLens",
  description: "See whether ChatGPT and Perplexity recommend your brand when buyers ask about your category. Free, no account.",
};

export default function CheckPage() {
  return (
    <>
      <Nav />
      <main id="top">
        <Section innerClassName="pt-10 pb-16 md:pt-14 md:pb-20">
          <FreeCheckFlow />
        </Section>
      </main>
      <Footer />
    </>
  );
}
