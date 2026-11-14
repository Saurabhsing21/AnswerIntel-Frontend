import { login } from "@/app/api/auth/login/route";
import { BACKEND_URL, errorBody, visitorHeaders } from "@/lib/api/server";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...visitorHeaders(request) },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return Response.json(data ?? errorBody("REGISTER_FAILED", "Could not create the account."), { status: res.status });
    }
    return await login(request, String(email), String(password));
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The Seenlense API is not reachable."), { status: 502 });
  }
}
