import { describe, expect, it } from "vitest";
import { COMPARISON, ENGINE_CREDITS, PLANS, PRICING_FAQ } from "@/lib/billing/plans";

// The numbers in backend/app/billing/plans.py. The website must quote the same ones.
const BACKEND = {
  starter: { prompts: 50, credits: 650, engines: ["chatgpt_search", "perplexity"] },
  growth: { prompts: 120, credits: 1650, engines: ["chatgpt_search", "perplexity", "claude"] },
  pro: { prompts: 200, credits: 3300, engines: ["chatgpt_search", "perplexity", "claude", "gemini", "deepseek", "llama", "mistral"] },
};

describe("plans", () => {
  it("match the backend plans", () => {
    for (const plan of PLANS) {
      expect({ prompts: plan.prompts, credits: plan.credits, engines: plan.engines }).toEqual(BACKEND[plan.key]);
    }
  });

  it("weigh engines like the backend", () => {
    expect(ENGINE_CREDITS).toEqual({ chatgpt_search: 1, gemini: 1.25, perplexity: 0.5, claude: 0.5, deepseek: 0.25, llama: 0.25, mistral: 0.25 });
  });

  it("price every plan engine", () => {
    for (const plan of PLANS) for (const engine of plan.engines) expect(ENGINE_CREDITS[engine]).toBeDefined();
  });

  it("say credits, never AI answers a month", () => {
    const text = JSON.stringify([PLANS, COMPARISON, PRICING_FAQ]);
    expect(text).not.toMatch(/AI answers a month/i);
    expect(PLANS.map((p) => p.includes.find((i) => i.includes("credits")))).toEqual(["650 credits a month", "1,650 credits a month", "3,300 credits a month"]);
  });
});
