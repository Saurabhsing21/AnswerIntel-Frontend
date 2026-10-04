import { cookies } from "next/headers";
import { BACKEND_URL, TOKEN_COOKIE, errorBody } from "@/lib/api/server";

// Same-origin proxy: the browser calls /api/backend/*, the server attaches the
// session token from the HttpOnly cookie and forwards to the FastAPI backend.
async function forward(request: Request, ctx: RouteContext<"/api/backend/[...path]">) {
  const { path } = await ctx.params;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) {
    return Response.json(errorBody("AUTH_UNAUTHORIZED", "Please log in."), { status: 401 });
  }
  const search = new URL(request.url).search;
  const hasBody = !["GET", "HEAD"].includes(request.method);
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/${path.map(encodeURIComponent).join("/")}${search}`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
    if (res.status === 401) (await cookies()).delete(TOKEN_COOKIE);
    return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The AnswerIntel API is not reachable."), { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
