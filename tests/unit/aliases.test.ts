import { describe, expect, it } from "vitest";
import { aliasProblem, parseAliases } from "@/lib/aliases";

describe("other names", () => {
  it("splits on commas, trims, and drops blanks and repeats", () => {
    expect(parseAliases(" HubSpot CRM, ,Hub Spot,hubspot crm")).toEqual(["HubSpot CRM", "Hub Spot"]);
    expect(parseAliases("")).toEqual([]);
  });

  it("allows five names of up to 60 characters", () => {
    expect(aliasProblem(parseAliases("a,b,c,d,e"))).toBe("");
    expect(aliasProblem(["x".repeat(60)])).toBe("");
  });

  it("explains what is over the limit", () => {
    expect(aliasProblem(parseAliases("a,b,c,d,e,f"))).toMatch(/at most 5/);
    expect(aliasProblem(["x".repeat(61)])).toMatch(/at most 60/);
  });
});
