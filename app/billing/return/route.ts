import type { NextRequest } from "next/server";
import { appHref } from "@/lib/urls";

/** Where Cashfree sends people after checkout. It comes back with a cross-site POST, which carries no session cookie,
 * so answer with a 303: the browser then loads the page with a normal GET, signed in. */
function back(request: NextRequest) {
  const to = request.nextUrl.searchParams.get("to") ?? "";
  // Same-site paths only, so this can never send anyone to another site.
  const path = /^\/(?![/\\])[^\s\\]*$/.test(to) ? to : "/projects";
  const target = `${path}${path.includes("?") ? "&" : "?"}checkout=success`;
  return Response.redirect(new URL(appHref(target), request.nextUrl.origin), 303);
}

export const GET = back;
export const POST = back;
