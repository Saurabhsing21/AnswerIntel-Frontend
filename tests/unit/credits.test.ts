import { describe, expect, it } from "vitest";
import { formatCredits } from "@/lib/format";
import { creditsFor, monthlyCredits } from "@/lib/billing/plans";

describe("formatCredits", () => {
  it("shows whole numbers plainly and fractions to two decimals, so engine prices stay exact", () => {
    expect(formatCredits(650)).toBe("650");
    expect(formatCredits(0)).toBe("0");
    expect(formatCredits(12.5)).toBe("12.5");
    expect(formatCredits(12.34)).toBe("12.34");
    expect(formatCredits(0.25)).toBe("0.25");
    expect(formatCredits(1.25)).toBe("1.25");
  });
});

describe("monthlyCredits", () => {
  it("prices an engine nobody listed at one credit", () => {
    expect(creditsFor("grok")).toBe(1);
  });

  it("is prompts × the credits of each engine × runs in a month", () => {
    expect(monthlyCredits(10, ["chatgpt_search", "perplexity"], 1)).toBe(15);
    expect(monthlyCredits(50, ["chatgpt_search", "perplexity"])).toBeCloseTo(322.5);
  });
});
