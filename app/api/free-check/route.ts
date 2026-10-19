import { BACKEND_URL, errorBody } from "@/lib/api/server";

// Public: no session. Passes the visitor's address on so the API can limit checks per visitor.
export async function POST(request: Request) {
  const body = await request.text();
  const forwarded = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "";
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/free-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(forwarded ? { "X-Forwarded-For": forwarded } : {}) },
      body,
      cache: "no-store",
    });
    return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The free check is unavailable right now. Please try again."), { status: 502 });
  }
}
