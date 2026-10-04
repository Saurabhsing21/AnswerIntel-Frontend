import { cookies } from "next/headers";
import { BACKEND_URL, TOKEN_COOKIE, cookieOptions, errorBody } from "@/lib/api/server";

export async function login(email: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    return Response.json(data ?? errorBody("AUTH_INVALID_CREDENTIALS", "Invalid email or password."), { status: res.status || 401 });
  }
  // The token never reaches browser JavaScript (PRD: HttpOnly, no localStorage).
  (await cookies()).set(TOKEN_COOKIE, data.access_token, cookieOptions);
  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  try {
    return await login(String(email ?? ""), String(password ?? ""));
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The AnswerIntel API is not reachable."), { status: 502 });
  }
}
