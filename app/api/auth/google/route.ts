import { cookies } from "next/headers";
import { BACKEND_URL, visitorHeaders, REFRESH_COOKIE, TOKEN_COOKIE, cookieOptions, errorBody } from "@/lib/api/server";

/** "Continue with Google": swaps Google's ID token for a SeenLense session, kept in HttpOnly cookies like a password login. */
export async function POST(request: Request) {
  const { credential } = await request.json().catch(() => ({}));
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...visitorHeaders(request) },
      body: JSON.stringify({ credential: String(credential ?? "") }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.access_token) {
      return Response.json(data ?? errorBody("GOOGLE_LOGIN_FAILED", "Google sign-in didn't work. Please try again."), { status: res.status || 401 });
    }
    const jar = await cookies();
    jar.set(TOKEN_COOKIE, data.access_token, cookieOptions);
    if (data.refresh_token) jar.set(REFRESH_COOKIE, data.refresh_token, cookieOptions);
    return Response.json({ ok: true });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The SeenLense API is not reachable."), { status: 502 });
  }
}
