import { BACKEND_URL, errorBody } from "@/lib/api/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
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

  // Do not log the address; it is personal data.
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
