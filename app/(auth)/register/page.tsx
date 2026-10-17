import type { Metadata } from "next";
import { AuthForm } from "@/components/app/auth-form";

export const metadata: Metadata = { title: "Create account - SeenLens" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
