import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Methodology - Seenlense",
  description: "How Seenlense measures AI search visibility: the questions, the engines, how answers are read, and how each rate is calculated.",
  alternates: { canonical: "/methodology" },
};

// Mirrors the backend's metric definitions (app/metrics/service.py and app/metrics/stats.py); keep them in step.
export default function MethodologyPage() {
  return (
    <LegalPage
      title="How Seenlense measures AI visibility"
      updated="November 14, 2026"
      intro="Every Seenlense number comes from real answers: we ask AI engines the questions your buyers ask, store each answer, and count. This page explains each step so you can judge the numbers for yourself."
      sections={[
        { title: "The questions", body: [
          "For each project we generate 30 to 50 realistic buyer questions from your category, market and competitors. You review them, edit or remove any and add your own before the first scan. The same questions are asked every week, so results stay comparable over time.",
        ] },
        { title: "The engines", body: [
          "Every plan scans ChatGPT Search, Perplexity and Gemini, which search the live web before answering, like a buyer using them would see. Growth adds Claude and Pro adds DeepSeek, Llama and Mistral; these answer from what they learned in training, without searching.",
          "Each question is asked once on each engine per scan, so one answer is one prompt on one engine. Weekly scans run automatically; you can also run one on demand.",
        ] },
        { title: "Reading the answers", body: [
          "An AI model reads each answer and records whether it names your brand and each competitor, whether it recommends them, at what position in any ranked list, in what tone, and which pages it cites. If that step fails, a rule-based check of brand names and aliases is used instead.",
          "A mention means the answer names you. A recommendation means it tells the buyer to choose you. We count them separately because many brands are mentioned in passing while a competitor is the one recommended.",
        ] },
        { title: "The rates", body: [
          "Every rate is over the successful answers in a scan (prompts × engines):",
          [
            "Mention rate: answers that name you, divided by all answers.",
            "Recommendation rate: answers that recommend you, divided by all answers.",
            "Share of voice: your recommendations, divided by the recommendations of you and all your tracked competitors.",
            "Average position: your mean rank in answers that list brands in order.",
            "Citation rate: answers that cite at least one page on your own domain, divided by all answers.",
            "Positive sentiment: positive mentions, divided by all mentions.",
          ],
        ] },
        { title: "Noise and real change", body: [
          "AI answers vary from run to run, so a small change between two weeks is often chance. Each rate is shown with a 95% Wilson interval, and a change between two scans or before and after an experiment is called real only when a two-proportion test says it is bigger than that noise.",
        ] },
        { title: "Limits", body: [
          "AI answers differ by account, location and conversation history, and the models change without notice. Seenlense measures a clean, repeatable sample of answers, not every answer every buyer sees. Treat the numbers as a trend to act on, not an exact count.",
        ] },
      ]}
    />
  );
}
