import type { Metadata } from "next";
import { AuthForm } from "@/components/app/auth-form";
import { isPaidPlan } from "@/lib/billing/plans";

export const metadata: Metadata = { title: "Create account - SeenLens" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { plan, interval } = await searchParams; // set by the website's pricing section
  return <AuthForm mode="register" plan={isPaidPlan(plan) ? plan : undefined} interval={interval === "year" ? "year" : "month"} />;
}
