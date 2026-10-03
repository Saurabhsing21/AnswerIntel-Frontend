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

  // TODO: persist to the backend (POST /api/v1/waitlist) once it exists.
  // Do not log the address; it is personal data.
  return Response.json({ ok: true });
}
