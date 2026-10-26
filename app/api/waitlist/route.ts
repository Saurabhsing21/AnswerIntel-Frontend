import { BACKEND_URL, errorBody } from "@/lib/api/server";
import { addToWaitlist, resendWaitlistEnabled, sendWaitlistConfirmation } from "@/lib/server/resend";

// Best-effort per-visitor limit for each server instance (serverless instances do not share it).
const hits = new Map<string, { count: number; until: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const entry = hits.get(ip);
  if (!entry || entry.until < now) {
    hits.set(ip, { count: 1, until: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown; company?: unknown };
    // Honeypot: people never see this field; bots fill it. Pretend it worked and store nothing.
    if (typeof body.company === "string" && body.company.trim()) return Response.json({ ok: true });
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    return Response.json({ error: { code: "INVALID_REQUEST", message: "Invalid request." } }, { status: 400 });
  }

  if (!EMAIL.test(email) || email.length > 254) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Enter a valid email address." } },
      { status: 422 },
    );
  }

  email = email.toLowerCase();
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  if (limited(ip)) {
    return Response.json(errorBody("RATE_LIMITED", "Too many requests. Please try again in a minute."), { status: 429 });
  }

  // Launch setup: the list lives in a Resend Audience; no backend needed. Same answer whether or not the
  // address was already there, so the form cannot be used to check who signed up.
  if (resendWaitlistEnabled()) {
    try {
      if (await addToWaitlist(email)) await sendWaitlistConfirmation(email);
    } catch {
      return Response.json(errorBody("API_UNAVAILABLE", "We couldn't save your email. Please try again."), { status: 502 });
    }
    return Response.json({ ok: true });
  }

  // Do not log the address; it is personal data.
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/waitlist`, {
      method: "POST",
      // The visitor's address, so the API rate-limits per person (uvicorn --proxy-headers trusts it from this server).
      headers: { "Content-Type": "application/json", "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    if (res.status === 429) {
      return Response.json(errorBody("RATE_LIMITED", "Too many requests. Please try again in a minute."), { status: 429 });
    }
    if (!res.ok) throw new Error("waitlist rejected");
  } catch {
    return Response.json(errorBody("API_UNAVAILABLE", "We couldn't save your email. Please try again."), { status: 502 });
  }
  return Response.json({ ok: true });
}
