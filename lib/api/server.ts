
export const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");
export const TOKEN_COOKIE = "ai_session";
export const REFRESH_COOKIE = "ai_refresh";

// Both cookies live as long as the refresh token (30 days). The access token inside the first one
// expires after minutes; the proxy notices the 401 and renews it, so the user is never signed out mid-work.
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export type Tokens = { access_token: string; refresh_token: string };

const inflight = new Map<string, Promise<Tokens | null>>();

/**
 * Exchange a refresh token for a new pair. Refresh tokens rotate and a replayed one revokes the whole
 * session, so parallel requests that all hit a 401 must share ONE exchange. The result is remembered for
 * a few seconds so requests that read the old cookie just before rotation reuse it instead of replaying.
 */
export function refreshTokens(refreshToken: string): Promise<Tokens | null> {
  let pending = inflight.get(refreshToken);
  if (!pending) {
    pending = fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    })
      .then(async (res) => (res.ok ? ((await res.json()) as Tokens) : null))
      .catch(() => null);
    inflight.set(refreshToken, pending);
    setTimeout(() => inflight.delete(refreshToken), 10_000);
  }
  return pending;
}

export function errorBody(code: string, message: string) {
  return { error: { code, message } };
}
