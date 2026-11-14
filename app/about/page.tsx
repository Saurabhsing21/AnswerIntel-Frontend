import type { Metadata } from "next";
import { JsonLd } from "@/components/blog/json-ld";
import { CONTACT_EMAIL, LegalPage } from "@/components/marketing/legal-page";
import { PLANS } from "@/lib/billing/plans";
import { PUBLIC_URL } from "@/lib/urls";

export const metadata: Metadata = {
  title: "About SeenLense",
  description: "SeenLense is an AI search visibility tracker for founders and small teams, built by Saurabh Singh.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: `${PUBLIC_URL}/about`,
          about: { "@id": `${PUBLIC_URL}/#organization` },
        }}
      />
      <LegalPage
        title="About SeenLense"
        updated="November 14, 2026"
        intro="SeenLense is an AI search visibility tracker for founders and small teams. It asks ChatGPT, Perplexity, Gemini and Claude the questions your buyers ask, records every answer, and shows how often your brand is mentioned, recommended and cited compared to your competitors, and what to fix next."
        sections={[
          { title: "Why it exists", body: [
            "More buyers now ask an AI assistant which product to choose instead of searching. The assistant answers with a few names. If yours is not one of them, you were never in the running, and nothing in a classic SEO tool tells you.",
            "SeenLense measures those answers the way a buyer would see them, every week, so you can tell whether the changes you make move the numbers.",
          ] },
          { title: "What it does", body: [
            [
              "Builds a list of realistic buyer questions for your category, which you review and edit.",
              "Asks every question on each AI engine in your plan, every week.",
              "Counts how often each answer mentions you, recommends you and cites your pages, next to your competitors.",
              "Shows why competitors win and which pages AI assistants read, so you know what to fix.",
            ],
            "How each number is measured is on the methodology page.",
          ] },
          { title: "Who builds it", body: [
            "SeenLense is built by Saurabh Singh, trading as SeenLense. He also writes the SeenLense blog.",
          ] },
          { title: "Pricing", body: [
            `Every account starts with one free scan, no card needed. Plans run from $${PLANS[0].monthly} to $${PLANS[PLANS.length - 1].monthly} a month. Payments go through Paddle, our merchant of record.`,
          ] },
          { title: "Contact", body: [`Email ${CONTACT_EMAIL}. A person reads every message.`] },
        ]}
      />
    </>
  );
}
