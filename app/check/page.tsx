import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FreeCheckFlow } from "@/components/marketing/free-check";
import { Section } from "@/components/marketing/section";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { FREE_CHECK } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Free AI visibility check - SeenLense",
  description: "See whether ChatGPT and Perplexity recommend your brand when buyers ask about your category. Free, no account.",
  alternates: { canonical: "/check" },
};

export default function CheckPage() {
  if (!FREE_CHECK) notFound(); // hidden until launch
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
