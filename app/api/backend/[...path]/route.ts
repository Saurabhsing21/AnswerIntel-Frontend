import { cookies } from "next/headers";
import { BACKEND_URL, REFRESH_COOKIE, TOKEN_COOKIE, cookieOptions, errorBody, refreshTokens } from "@/lib/api/server";

// Same-origin proxy: the browser calls /api/backend/*, the server attaches the
// session token from the HttpOnly cookie and forwards to the FastAPI backend.
async function forward(request: Request, ctx: RouteContext<"/api/backend/[...path]">) {
  const { path } = await ctx.params;
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  let token = jar.get(TOKEN_COOKIE)?.value;
  if (!token && !refresh) {
    return Response.json(errorBody("AUTH_UNAUTHORIZED", "Please log in."), { status: 401 });
  }
  const search = new URL(request.url).search;
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.text() : undefined; // read once so the request can be replayed after a refresh
  const call = (bearer: string) =>
    fetch(`${BACKEND_URL}/api/v1/${path.map(encodeURIComponent).join("/")}${search}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${bearer}`, ...(hasBody ? { "Content-Type": "application/json" } : {}) },
      body,
      cache: "no-store",
    });
  try {
    let res = token ? await call(token) : null;
    // The access token is short-lived. When it has expired, renew it quietly and retry once.
    if ((!res || res.status === 401) && refresh) {
      const renewed = await refreshTokens(refresh);
      if (renewed) {
        token = renewed.access_token;
        jar.set(TOKEN_COOKIE, renewed.access_token, cookieOptions);
        jar.set(REFRESH_COOKIE, renewed.refresh_token, cookieOptions);
        res = await call(token);
      }
    }
    if (!res || res.status === 401) {
      jar.delete(TOKEN_COOKIE);
      jar.delete(REFRESH_COOKIE);
      return Response.json(errorBody("AUTH_UNAUTHORIZED", "Please log in."), { status: 401 });
    }
    // Pass through what the API says it is (JSON, but also PDF and HTML report exports) and its safety headers.
    const headers = new Headers({
      "Content-Type": res.headers.get("content-type") ?? "application/json",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["content-disposition", "content-security-policy"]) {
      const value = res.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(res.body, { status: res.status, headers });
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "The SeenLens API is not reachable."), { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
