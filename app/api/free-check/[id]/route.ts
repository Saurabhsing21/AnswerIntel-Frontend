import { BACKEND_URL, errorBody } from "@/lib/api/server";

export async function GET(_: Request, ctx: RouteContext<"/api/free-check/[id]">) {
  const { id } = await ctx.params;
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/free-check/${encodeURIComponent(id)}`, { cache: "no-store" });
    return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The free check is unavailable right now. Please try again."), { status: 502 });
  }
}
