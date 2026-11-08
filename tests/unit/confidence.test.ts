import { describe, expect, it } from "vitest";
import { pageLabel, retestVerdictLabel } from "@/lib/confidence";

describe("re-test verdict", () => {
  it("names each verdict in plain words", () => {
    expect(retestVerdictLabel("better")).toEqual({ label: "Better, beyond normal variation", tone: "up" });
    expect(retestVerdictLabel("too_early")).toEqual({ label: "No real change yet", tone: "flat" });
    expect(retestVerdictLabel("worse")).toEqual({ label: "Worse", tone: "down" });
  });

  it("treats a re-test stored before verdicts existed as having none", () => {
    expect(retestVerdictLabel(undefined)).toBeNull();
  });
});

describe("pageLabel", () => {
  it("shows the domain and path without the scheme, www or trailing slash", () => {
    expect(pageLabel("https://www.example.com/best-crm/")).toBe("example.com/best-crm");
    expect(pageLabel("https://example.com/")).toBe("example.com");
  });

  it("drops the query string and shortens very long paths", () => {
    expect(pageLabel("https://example.com/a?utm=1")).toBe("example.com/a");
    expect(pageLabel(`https://example.com/${"x".repeat(80)}`).length).toBeLessThanOrEqual(60);
  });

  it("falls back to the text it was given when it is not a URL", () => {
    expect(pageLabel("not a url")).toBe("not a url");
  });
});
