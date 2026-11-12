import { PLANS } from "@/lib/billing/plans";
import { getPosts } from "@/lib/blog";
import { faqs } from "@/lib/data";
import { PUBLIC_URL } from "@/lib/urls";

export const dynamic = "force-static";

// llms.txt (llmstxt.org): a plain summary of the site for AI assistants, built from the same data as the pages.
export function GET() {
  const text = `# SeenLense

> SeenLense is an AI search visibility tool for founders and small teams. It asks ChatGPT, Perplexity, Gemini and other AI assistants the questions buyers ask, records every answer, and shows how often a brand is mentioned, recommended and cited compared to its competitors, why competitors win, and what to fix next.

Website: ${PUBLIC_URL}
Contact: saurabh@seenlense.com

## Pricing

${PLANS.map((p) => `- ${p.name}: $${p.monthly}/month or $${p.yearly}/year. ${p.audience} ${p.prompts} tracked prompts, ${p.credits} credits a month (${p.creditsYearly} on yearly).`).join("\n")}

## Pages

- [Home](${PUBLIC_URL}/): what SeenLense does and how it works
- [Pricing](${PUBLIC_URL}/pricing): plans, credits and limits
- [Blog](${PUBLIC_URL}/blog): guides on AI search visibility and generative engine optimization

## Blog posts

${getPosts().map((p) => `- [${p.title}](${PUBLIC_URL}/blog/${p.slug}): ${p.description}`).join("\n")}

## FAQ

${faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
