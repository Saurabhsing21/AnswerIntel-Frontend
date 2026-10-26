import type { Metadata } from "next";
import { AuthForm } from "@/components/app/auth-form";
import { isPaidPlan } from "@/lib/billing/plans";

export const metadata: Metadata = { title: "Create account - SeenLens" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { plan, interval, invite, brand, website, category, country } = await searchParams; // plan: from the pricing section
  const carried = Object.entries({ brand, website, category, country }).filter((e): e is [string, string] => typeof e[1] === "string" && e[1] !== "");
  const prefill = carried.length ? new URLSearchParams(carried).toString() : undefined; // from the free check
  return <AuthForm mode="register" plan={isPaidPlan(plan) ? plan : undefined} interval={interval === "year" ? "year" : "month"} invite={typeof invite === "string" ? invite : undefined} prefill={prefill} />;
}
