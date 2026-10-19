/**
 * Plan data for the website (pricing section, /pricing page) and the subscribe step. The app's usage page
 * reads limits from the API instead. Mirrors backend/app/billing/plans.py; keep the numbers in step.
 */
export type PaidPlan = "starter" | "growth" | "pro";
export type Interval = "month" | "year";

type PlanInfo = {
  key: PaidPlan;
  name: string;
  audience: string;
  monthly: number;
  /** Billed once a year: 20% off, chosen so the monthly equivalent is a whole number. */
  yearly: number;
  /** The short list on the plan card; the full breakdown is COMPARISON. */
  includes: string[];
};

export const PLANS: readonly PlanInfo[] = [
  {
    key: "starter",
    name: "Starter",
    audience: "For founders getting started with AI search visibility.",
    monthly: 20,
    yearly: 192,
    includes: ["100 prompts per project", "2 projects", "ChatGPT, Perplexity and Gemini", "2 scans a day + weekly auto-scan", "20 competitors per project", "5 seats", "6 months of answer history"],
  },
  {
    key: "growth",
    name: "Growth",
    audience: "For growing teams that need deeper tracking and insights.",
    monthly: 50,
    yearly: 480,
    includes: ["300 prompts per project", "4 projects", "ChatGPT, Perplexity and Gemini", "4 scans a day + weekly auto-scan", "50 competitors per project", "15 seats", "12 months of answer history", "Experiments with before and after"],
  },
  {
    key: "pro",
    name: "Pro",
    audience: "For agencies and brands running several products.",
    monthly: 100,
    yearly: 960,
    includes: ["700 prompts per project", "10 projects", "ChatGPT, Perplexity and Gemini", "10 scans a day + weekly auto-scan", "100 competitors per project", "50 seats", "24 months of answer history", "Experiments with before and after"],
  },
];

/** The plan we steer people to: highlighted on the website and preselected when subscribing. */
export const FEATURED: PaidPlan = "growth";

type Cell = boolean | string;
export type ComparisonGroup = { title: string; rows: { label: string; hint?: string; values: [Cell, Cell, Cell] }[] };

/** Plan-by-plan breakdown for the /pricing page. Only lists what the product actually does. */
export const COMPARISON: ComparisonGroup[] = [
  {
    title: "Tracking coverage",
    rows: [
      { label: "AI engines", values: ["ChatGPT, Perplexity, Gemini", "ChatGPT, Perplexity, Gemini", "ChatGPT, Perplexity, Gemini"] },
      { label: "Tracked prompts", hint: "per project", values: ["100", "300", "700"] },
      { label: "AI answers per scan", hint: "prompts × engines", values: ["300", "900", "2,100"] },
      { label: "Scans a day", hint: "on demand, across the workspace", values: ["2", "4", "10"] },
      { label: "Weekly automatic scans", values: [true, true, true] },
      { label: "Projects (brands)", values: ["2", "4", "10"] },
      { label: "Competitors", hint: "per project", values: ["20", "50", "100"] },
      { label: "Answer history", values: ["6 months", "12 months", "24 months"] },
    ],
  },
  {
    title: "Discover",
    rows: [
      { label: "AI prompt discovery", hint: "buyer questions generated from your category", values: [true, true, true] },
      { label: "Your own prompts", values: [true, true, true] },
      { label: "Prompt categories and buyer intent", values: [true, true, true] },
    ],
  },
  {
    title: "Measure",
    rows: [
      { label: "Mention and recommendation rate", values: [true, true, true] },
      { label: "Share of voice and average position", values: [true, true, true] },
      { label: "Sentiment of every answer", values: [true, true, true] },
      { label: "Engine-by-engine breakdown", values: [true, true, true] },
      { label: "Competitor head-to-head", values: [true, true, true] },
      { label: "Sources and citations", values: [true, true, true] },
      { label: "Trends across scans", values: [true, true, true] },
    ],
  },
  {
    title: "Act",
    rows: [
      { label: "Ranked opportunities", values: [true, true, true] },
      { label: "Website audit for AI readability", values: [true, true, true] },
      { label: "Experiments with before and after", values: [false, true, true] },
    ],
  },
  {
    title: "Report",
    rows: [
      { label: "On-demand reports", values: [true, true, true] },
      { label: "Share links, PDF and HTML export", values: [true, true, true] },
      { label: "Weekly founder report by email", values: [true, true, true] },
    ],
  },
  {
    title: "Team and billing",
    rows: [
      { label: "Seats", values: ["5", "15", "50"] },
      { label: "Roles: owner, admin, member", values: [true, true, true] },
      { label: "Invoices and self-serve billing", values: [true, true, true] },
      { label: "Change plan or cancel any time", values: [true, true, true] },
    ],
  },
];

export const PRICING_FAQ = [
  { q: "Is there a free trial?", a: "No. Every plan is paid, monthly or yearly, and you can cancel any time. Starter costs $20 a month, so it is a cheap way to try SeenLens." },
  { q: "What counts as a scan?", a: "One scan asks every active prompt in a project to every AI engine on your plan, then analyses the answers. On Growth that is up to 300 prompts × 3 engines = 900 AI answers per scan." },
  { q: "Can I change plans later?", a: "Yes. Upgrade or downgrade from Manage billing in the app. Stripe prorates the difference automatically." },
  { q: "What happens if I cancel?", a: "Your plan runs until the end of the period you paid for. After that the workspace is read-only: you can still view and export everything, but not run new scans." },
  { q: "What if a payment fails?", a: "You get an email and 7 days to update your card. Everything keeps working during that time." },
  { q: "Does my whole team share one plan?", a: "Yes. Plans are per workspace: the owner pays and every member shares the limits. Each plan includes a number of seats." },
];

export const isPaidPlan = (v: unknown): v is PaidPlan => v === "starter" || v === "growth" || v === "pro";

/** Days from now until `iso`, rounded up; 0 once it has passed. */
export function daysUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}
