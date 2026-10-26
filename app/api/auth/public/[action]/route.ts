import { BACKEND_URL, errorBody } from "@/lib/api/server";

// The account links in emails work without a session, so they can't go through /api/backend.
const ALLOWED = new Set(["forgot-password", "reset-password", "verify-email"]);

export async function POST(request: Request, ctx: RouteContext<"/api/auth/public/[action]">) {
  const { action } = await ctx.params;
  if (!ALLOWED.has(action)) return Response.json(errorBody("NOT_FOUND", "Not found."), { status: 404 });
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "" },
      body: await request.text(),
      cache: "no-store",
    });
    return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The SeenLens API is not reachable."), { status: 502 });
  }
}
