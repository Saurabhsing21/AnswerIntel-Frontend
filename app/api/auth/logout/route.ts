import { cookies } from "next/headers";
import { BACKEND_URL, REFRESH_COOKIE, TOKEN_COOKIE } from "@/lib/api/server";

export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  jar.delete(TOKEN_COOKIE);
  jar.delete(REFRESH_COOKIE);
  if (refresh) {
    // Revoke the session on the server too, so a copied cookie stops working. Best effort: signing out must never fail.
    await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  return Response.json({ ok: true });
}
