import { afterEach, describe, expect, it, vi } from "vitest";

// The module reads its environment once, at import time.
async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("@/lib/api/server");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("BACKEND_URL", () => {
  it("falls back to the local API when the variable is empty", async () => {
    const { BACKEND_URL } = await load({ BACKEND_URL: "" });
    expect(BACKEND_URL).toBe("http://localhost:8000");
  });

  it("drops a trailing slash", async () => {
    const { BACKEND_URL } = await load({ BACKEND_URL: "https://api.example.com/" });
    expect(BACKEND_URL).toBe("https://api.example.com");
  });
});

describe("visitorHeaders", () => {
  const request = new Request("http://site.test", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } });

  it("passes the first forwarded address, signed with the shared secret", async () => {
    const { visitorHeaders } = await load({ PROXY_SHARED_SECRET: "s3cret" });
    expect(visitorHeaders(request)).toEqual({ "X-Client-IP": "203.0.113.7", "X-Proxy-Secret": "s3cret" });
  });

  it("sends nothing without a secret, so the API never trusts an unsigned address", async () => {
    const { visitorHeaders } = await load({ PROXY_SHARED_SECRET: "" });
    expect(visitorHeaders(request)).toEqual({});
  });
});

describe("refreshTokens", () => {
  it("shares one exchange between parallel requests", async () => {
    const fetchMock = vi.fn(async () => Response.json({ access_token: "a2", refresh_token: "r2" }));
    vi.stubGlobal("fetch", fetchMock);
    const { refreshTokens } = await load({});

    const results = await Promise.all([refreshTokens("r1"), refreshTokens("r1"), refreshTokens("r1")]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results.every((r) => r?.access_token === "a2")).toBe(true);
  });

  it("answers null when the API refuses the token", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
    const { refreshTokens } = await load({});
    expect(await refreshTokens("revoked")).toBeNull();
  });
});
