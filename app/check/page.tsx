import type { Metadata } from "next";
import { FreeCheckForm } from "@/components/marketing/free-check";
import { Section } from "@/components/marketing/section";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { Mark } from "@/components/ui/mark";

export const metadata: Metadata = {
  title: "Free AI visibility check - SeenLens",
  description: "See whether ChatGPT and Perplexity recommend your brand when buyers ask about your category. Free, no account.",
};

export default function CheckPage() {
  return (
    <>
      <Nav />
      <main id="top">
        <Section innerClassName="md:pt-10">
          <div className="mx-auto max-w-[720px] text-center">
            <h1 className="text-balance font-display text-[38px] leading-[1.02] font-semibold tracking-[-0.04em] md:text-[54px]">
              Does AI <Mark delay={0.3}>recommend you?</Mark>
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-muted">
              We ask ChatGPT and Perplexity five questions your buyers ask, with live web search, and show whether they name you.
              Free, no account, about a minute.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-[880px]">
            <FreeCheckForm />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
