/**
 * Plan data for the website pricing section and the subscribe step. The app's usage page reads limits from
 * the API instead. Mirrors backend/app/billing/plans.py; keep the two in step when a number changes.
 */
export type PaidPlan = "starter" | "pro";
export type Interval = "month" | "year";

export const PLANS = [
  {
    key: "starter",
    name: "Starter",
    blurb: "For one brand watching the engines that matter most.",
    monthly: 29,
    yearly: 290,
    features: ["1 project", "25 tracked prompts", "3 competitors", "2 AI engines", "5 scans a day", "3 seats", "6 months of answer history"],
  },
  {
    key: "pro",
    name: "Pro",
    blurb: "For teams tracking every engine, every week.",
    monthly: 79,
    yearly: 790,
    features: ["5 projects", "100 tracked prompts", "10 competitors", "All AI engines", "20 scans a day", "10 seats", "12 months of answer history", "Weekly scans and reports", "Experiments"],
  },
] as const satisfies readonly { key: PaidPlan; name: string; blurb: string; monthly: number; yearly: number; features: readonly string[] }[];

export const isPaidPlan = (v: unknown): v is PaidPlan => v === "starter" || v === "pro";

/** Days from now until `iso`, rounded up; 0 once it has passed. */
export function daysUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}
