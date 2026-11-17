import type { Metadata } from "next";
import { AuthForm } from "@/components/app/auth-form";
import { isPaidPlan } from "@/lib/billing/plans";

export const metadata: Metadata = { title: "Create account - Seenlense" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { plan, interval, invite } = await searchParams; // plan: from the pricing section
  return <AuthForm mode="register" plan={isPaidPlan(plan) ? plan : undefined} interval={interval === "year" ? "year" : "month"} invite={typeof invite === "string" ? invite : undefined} />;
}
