import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/app/auth-form";
import { TOKEN_COOKIE } from "@/lib/api/server";

export const metadata: Metadata = { title: "Log in - Seenlense" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { invite } = await searchParams;
  // Already signed in: go straight to the app instead of signing in with Google again. A dead session has
  // its cookies cleared by the API proxy, so this can't bounce back and forth with the app's own redirect.
  if (!invite && (await cookies()).get(TOKEN_COOKIE)) redirect("/projects");
  return <AuthForm mode="login" invite={typeof invite === "string" ? invite : undefined} />;
}
