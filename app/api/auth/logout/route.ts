import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/api/server";

export async function POST() {
  (await cookies()).delete(TOKEN_COOKIE);
  return Response.json({ ok: true });
}
