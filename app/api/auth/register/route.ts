import { cookies } from "next/headers";
import { BACKEND_URL, SIGNUP_COOKIE, cookieOptions, errorBody, visitorHeaders } from "@/lib/api/server";

/** Step 1 of sign-up: the API emails a code. The pending sign-up waits in an HttpOnly cookie until the code is entered. */
export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...visitorHeaders(request) },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.signup_token) {
      return Response.json(data ?? errorBody("REGISTER_FAILED", "Could not create the account."), { status: res.status || 400 });
    }
    (await cookies()).set(SIGNUP_COOKIE, data.signup_token, { ...cookieOptions, maxAge: 60 * 15 });
    return Response.json({ ok: true, email: data.email });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The Seenlense API is not reachable."), { status: 502 });
  }
}
