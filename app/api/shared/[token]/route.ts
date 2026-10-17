import { BACKEND_URL, errorBody } from "@/lib/api/server";

// Public on purpose: a shared report link carries its own secret token, so no session cookie is needed.
export async function GET(request: Request, ctx: RouteContext<"/api/shared/[token]">) {
  const { token } = await ctx.params;
  const format = new URL(request.url).searchParams.get("format") ?? "html";
  if (!["html", "pdf", "json"].includes(format)) {
    return Response.json(errorBody("INVALID_REQUEST", "Unknown format."), { status: 400 });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/shared/reports/${encodeURIComponent(token)}?format=${format}`, { cache: "no-store" });
    const headers = new Headers({
      "Content-Type": res.headers.get("content-type") ?? "application/json",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    const csp = res.headers.get("content-security-policy");
    if (csp) headers.set("Content-Security-Policy", csp);
    return new Response(res.body, { status: res.status, headers });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The AnswerIntel API is not reachable."), { status: 502 });
  }
}
