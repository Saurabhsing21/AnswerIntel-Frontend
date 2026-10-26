import type { Metadata } from "next";
import { AuthForm } from "@/components/app/auth-form";

export const metadata: Metadata = { title: "Log in - SeenLens" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { invite } = await searchParams;
  return <AuthForm mode="login" invite={typeof invite === "string" ? invite : undefined} />;
}
