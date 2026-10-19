/**
 * Plan data for the marketing pricing section. The app's billing page reads plans from the API instead.
 * Mirrors backend/app/billing/plans.py; keep the two in step when a number changes.
 */
export const TRIAL_DAYS = 14;

export const PLANS = [
  {
    key: "starter",
    name: "Starter",
    blurb: "One brand, the engines that matter most.",
    monthly: 29,
    yearly: 290,
    features: ["1 project", "25 tracked prompts", "3 competitors", "2 AI engines", "5 scans a day", "3 seats", "6 months of answer history"],
  },
  {
    key: "pro",
    name: "Pro",
    blurb: "Every engine, weekly tracking and experiments.",
    monthly: 79,
    yearly: 790,
    features: ["5 projects", "100 tracked prompts", "10 competitors", "All AI engines", "20 scans a day", "10 seats", "12 months of answer history", "Weekly scans and reports", "Experiments"],
  },
] as const;

/** Days from now until `iso`, rounded up; 0 once it has passed. */
export function daysUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}
