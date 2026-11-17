import { cookies } from "next/headers";
import { BACKEND_URL, REFRESH_COOKIE, SIGNUP_COOKIE, TOKEN_COOKIE, cookieOptions, errorBody, visitorHeaders } from "@/lib/api/server";

/** Step 2 of sign-up: the emailed code creates the account and signs it in. */
export async function POST(request: Request) {
  const { code } = await request.json().catch(() => ({}));
  const jar = await cookies();
  const signupToken = jar.get(SIGNUP_COOKIE)?.value;
  if (!signupToken) return Response.json(errorBody("CODE_INVALID", "Your code has expired. Ask for a new one."), { status: 400 });
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/register/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...visitorHeaders(request) },
      body: JSON.stringify({ signup_token: signupToken, code: String(code ?? "") }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.access_token) {
      return Response.json(data ?? errorBody("CODE_INVALID", "That code is wrong or has expired."), { status: res.status || 400 });
    }
    jar.delete(SIGNUP_COOKIE);
    jar.set(TOKEN_COOKIE, data.access_token, cookieOptions);
    if (data.refresh_token) jar.set(REFRESH_COOKIE, data.refresh_token, cookieOptions);
    return Response.json({ ok: true });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The Seenlense API is not reachable."), { status: 502 });
  }
}
