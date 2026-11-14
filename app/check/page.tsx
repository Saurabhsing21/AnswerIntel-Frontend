import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/blog/json-ld";
import { FreeCheckFlow } from "@/components/marketing/free-check";
import { Section } from "@/components/marketing/section";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { FREE_CHECK } from "@/lib/flags";
import { PUBLIC_URL } from "@/lib/urls";

export const metadata: Metadata = {
  title: "Free AI visibility check - Seenlense",
  description: "See whether ChatGPT and Perplexity recommend your brand when buyers ask about your category. Free, no account.",
  alternates: { canonical: "/check" },
};

// Server-rendered explainer under the interactive check, so search engines and AI crawlers can read what the tool does.
const sections: { title: string; body: string[] }[] = [
  { title: "What the free check does", body: [
    "You enter your brand, your category and who you sell to. Seenlense writes five questions a buyer would ask, such as \"What is the best CRM for a small sales team?\", and asks each one to ChatGPT with web search and to Perplexity. An AI model then reads every answer and records whether it names your brand, whether it recommends you, at what position, and which competitors it picks instead.",
    "Both engines search the live web before answering, so the result is close to what a buyer sees today. It takes about a minute and needs no account or card.",
  ] },
  { title: "How to read your result", body: [
    "Recommended means the answer told the buyer to choose you. Mentioned means it named you, often in a list of other options. Not named means you did not appear. Many brands are mentioned in passing while a competitor is the one recommended, so look at both.",
    "This is five questions, asked once. AI answers vary from run to run, so treat it as a first snapshot, not a score. If you were not named at all, the next step is to look at which brands were, and which pages the AI read to choose them.",
  ] },
  { title: "Free check vs weekly tracking", body: [
    "The free check answers one question: does AI recommend you right now? Weekly tracking answers the ones that follow: is it getting better, which competitor wins each question, which sources the AI trusts, and whether a change you shipped made a real difference. Paid plans ask 50 to 200 of your buyers' questions every week on ChatGPT Search, Perplexity and Gemini, with Claude and open models on higher plans.",
  ] },
];

const faqs = [
  { q: "Is the AI visibility check really free?", a: "Yes. It runs five buyer questions on ChatGPT and Perplexity with no account and no card." },
  { q: "Which AI engines does the free check use?", a: "ChatGPT with web search and Perplexity. Paid plans add Gemini on every plan, Claude on Growth, and DeepSeek, Llama and Mistral on Pro." },
  { q: "Why does my result differ from what I see in ChatGPT?", a: "AI answers change between runs and depend on account, location and conversation history. The check asks clean questions in a fresh session, so treat it as a sample." },
  { q: "What should I do if AI does not recommend me?", a: "Look at which brands were recommended and which pages the AI cited, then work on appearing on those pages and answering buyer questions directly on your own site." },
];

export default function CheckPage() {
  if (!FREE_CHECK) notFound(); // hidden until launch
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Seenlense free AI visibility check",
              url: `${PUBLIC_URL}/check`,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ],
        }}
      />
      <Nav />
      <main id="top">
        <Section innerClassName="pt-10 pb-16 md:pt-14 md:pb-20">
          <FreeCheckFlow />
        </Section>
        <Section>
          <div className="mx-auto max-w-[720px]">
            {sections.map((s) => (
              <section key={s.title} className="mt-10 first:mt-0">
                <h2 className="font-display text-[24px] font-semibold tracking-[-0.02em]">{s.title}</h2>
                {s.body.map((p) => (
                  <p key={p} className="mt-3 text-[15px] leading-relaxed text-ink-2">{p}</p>
                ))}
              </section>
            ))}
            <section className="mt-10">
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.02em]">FAQ</h2>
              {faqs.map((f) => (
                <div key={f.q} className="mt-5">
                  <h3 className="text-[16px] font-medium text-ink">{f.q}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
                </div>
              ))}
            </section>
            <p className="mt-10 border-t border-line pt-6 text-[14px] text-muted">
              More: <Link href="/methodology" className="font-medium text-ink underline underline-offset-2">how Seenlense measures</Link>,{" "}
              <Link href="/blog/free-ai-visibility-checkers" className="font-medium text-ink underline underline-offset-2">other free AI visibility checkers</Link>,{" "}
              <Link href="/blog/how-to-get-recommended-by-chatgpt" className="font-medium text-ink underline underline-offset-2">how to get recommended by ChatGPT</Link>.
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
