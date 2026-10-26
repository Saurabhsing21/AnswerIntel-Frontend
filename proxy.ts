import { NextResponse, type NextRequest } from "next/server";
import { WAITLIST_ONLY } from "@/lib/flags";
import { APP_URL, isAppPath, SITE_URL, SPLIT_HOSTS } from "@/lib/urls";

// Launch mode: the marketing site and the waitlist stay open; the product, sign-in and every API route except the
// waitlist are closed. The FastAPI backend enforces the same thing (WAITLIST_ONLY), so this is a second lock.
const OPEN_API = new Set(["/api/waitlist"]);

function waitlistOnly(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    if (OPEN_API.has(pathname)) return NextResponse.next();
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found." } }, { status: 404 });
  }
  if (!isAppPath(pathname) && pathname !== "/check") return NextResponse.next();
  const url = new URL("/", SITE_URL || request.nextUrl.origin);
  url.hash = "waitlist";
  return NextResponse.redirect(url);
}

/** Keep the website and the dashboard each on their own host. */
function splitHosts(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (pathname.startsWith("/api/")) return NextResponse.next();
  const onApp = host === new URL(APP_URL).host;
  if (onApp && pathname === "/") return NextResponse.redirect(new URL("/projects", APP_URL));
  if (onApp !== isAppPath(pathname)) return NextResponse.redirect(new URL(pathname + search, onApp ? SITE_URL : APP_URL));
  return NextResponse.next();
}

export function proxy(request: NextRequest) {
  if (WAITLIST_ONLY) return waitlistOnly(request);
  if (SPLIT_HOSTS) return splitHosts(request);
  return NextResponse.next();
}

export const config = {
  // Every page and API route; static files and images are left alone.
  matcher: ["/((?!_next/|favicon\\.ico|icon\\.svg|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|webmanifest)$).*)"],
};
