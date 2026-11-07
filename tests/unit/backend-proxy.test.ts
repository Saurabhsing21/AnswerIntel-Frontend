import { beforeEach, describe, expect, it, vi } from "vitest";

// A cookie jar standing in for next/headers.
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { value: jar.get(name) } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
}));

const { GET } = await import("@/app/api/backend/[...path]/route");

function call(path: string[]) {
  const ctx = { params: Promise.resolve({ path }) } as Parameters<typeof GET>[1];
  return GET(new Request(`http://site.test/api/backend/${path.join("/")}`), ctx);
}

beforeEach(() => {
  jar.clear();
  vi.unstubAllGlobals();
});

describe("backend proxy", () => {
  it("asks for a login when there is no session at all", async () => {
    const res = await call(["projects"]);
    expect(res.status).toBe(401);
  });

  it("renews an expired access token and replays the request once", async () => {
    jar.set("ai_session", "old-access");
    jar.set("ai_refresh", "old-refresh");
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/auth/refresh")) return Response.json({ access_token: "new-access", refresh_token: "new-refresh" });
      const auth = new Headers(init?.headers).get("authorization");
      return auth === "Bearer new-access" ? Response.json([{ id: 1 }]) : new Response("{}", { status: 401 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await call(["projects"]);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 1 }]);
    expect(jar.get("ai_session")).toBe("new-access");
    expect(jar.get("ai_refresh")).toBe("new-refresh");
  });

  it("clears the session when the refresh token is refused", async () => {
    jar.set("ai_session", "old-access");
    jar.set("ai_refresh", "revoked");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));

    const res = await call(["projects"]);
    expect(res.status).toBe(401);
    expect(jar.size).toBe(0);
  });
});
