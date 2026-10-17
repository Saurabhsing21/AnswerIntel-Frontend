import type { Metadata } from "next";
import { AuthForm } from "@/components/app/auth-form";

export const metadata: Metadata = { title: "Log in - SeenLens" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
