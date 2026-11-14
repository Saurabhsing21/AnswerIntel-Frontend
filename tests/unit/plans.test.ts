import { describe, expect, it } from "vitest";
import { comparison, ENGINE_CREDITS, MAX_PROMPTS, planIncludes, PLANS, PRICING_FAQ } from "@/lib/billing/plans";

const COMPARISON = comparison("month");

// The numbers in backend/app/billing/plans.py. The website must quote the same ones.
const BACKEND = {
  starter: { prompts: 50, credits: 900, creditsYearly: 800, engines: ["chatgpt_search", "perplexity", "gemini"] },
  growth: { prompts: 120, credits: 2200, creditsYearly: 2000, engines: ["chatgpt_search", "perplexity", "gemini", "claude"] },
  pro: { prompts: 200, credits: 4400, creditsYearly: 4000, engines: ["chatgpt_search", "perplexity", "gemini", "claude", "deepseek", "llama", "mistral"] },
};

describe("plans", () => {
  it("match the backend plans", () => {
    for (const plan of PLANS) {
      expect({ prompts: plan.prompts, credits: plan.credits, creditsYearly: plan.creditsYearly, engines: plan.engines }).toEqual(BACKEND[plan.key]);
    }
  });

  it("weigh engines like the backend", () => {
    expect(ENGINE_CREDITS).toEqual({ chatgpt_search: 1, gemini: 4.5, perplexity: 0.5, claude: 0.5, deepseek: 0.25, llama: 0.25, mistral: 0.25 });
  });

  it("price every plan engine", () => {
    for (const plan of PLANS) for (const engine of plan.engines) expect(ENGINE_CREDITS[engine]).toBeDefined();
  });

  it("say credits, never AI answers a month", () => {
    const text = JSON.stringify([PLANS, COMPARISON, PRICING_FAQ]);
    expect(text).not.toMatch(/AI answers a month/i);
    const credits = (period: "month" | "year") => PLANS.map((p) => planIncludes(p, period).find((i) => i.includes("credits")));
    expect(credits("month")).toEqual(["900 credits a month", "2,200 credits a month", "4,400 credits a month"]);
    expect(credits("year")).toEqual(["800 credits a month", "2,000 credits a month", "4,000 credits a month"]);
  });

  it("show each billing period's own credits in the comparison, never the other period's", () => {
    const row = (period: "month" | "year") => comparison(period).flatMap((g) => g.rows).find((r) => r.label === "Credits a month")?.values;
    expect(row("month")).toEqual(["900", "2,200", "4,400"]);
    expect(row("year")).toEqual(["800", "2,000", "4,000"]);
    expect(JSON.stringify([PLANS, comparison("month"), comparison("year")])).not.toMatch(/yearly\)|on yearly/);
  });

  it("only promise live web search on the engines that search (web_search in backend/app/providers/models.py)", () => {
    const row = COMPARISON.flatMap((g) => g.rows).find((r) => r.label === "Live web search");
    const web = ["chatgpt_search", "perplexity", "gemini"];
    expect(row?.values).toEqual([web, web, web]);
    expect(JSON.stringify([PLANS, COMPARISON, PRICING_FAQ])).not.toMatch(/like the real apps|Google/);
  });

  it("lead every plan card with its prompts × AI models", () => {
    expect(PLANS.map((p) => p.includes[0])).toEqual(PLANS.map((p) => `${p.prompts} prompts × ${p.engines.length} AI models`));
  });

  it("quote the top plan's prompts as the most any plan tracks", () => {
    expect(MAX_PROMPTS).toBe(BACKEND.pro.prompts);
  });
});
