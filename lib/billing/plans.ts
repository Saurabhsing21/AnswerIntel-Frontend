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
  yearly: number;
  /** Limits, in card order. */
  limits: string[];
  /** What the plan unlocks, shown after the limits. */
  features: string[];
};

export const PLANS: readonly PlanInfo[] = [
  {
    key: "starter",
    name: "Starter",
    audience: "For founders checking how AI talks about one brand.",
    monthly: 20,
    yearly: 200,
    limits: ["1 project", "25 tracked prompts", "3 competitors", "ChatGPT and Perplexity", "3 scans a day", "2 seats", "6 months of answer history"],
    features: [
      "AI prompt discovery for your category",
      "Mention, recommendation and share of voice",
      "Competitor head-to-head",
      "Sources and citations AI relies on",
      "Ranked opportunities to fix",
      "Website audit for AI readability",
      "Shareable reports, PDF and HTML export",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    audience: "For growing teams that track AI search every week.",
    monthly: 50,
    yearly: 500,
    limits: ["3 projects", "75 tracked prompts per project", "8 competitors per project", "ChatGPT, Perplexity and Gemini", "10 scans a day", "5 seats", "12 months of answer history"],
    features: [
      "Everything in Starter",
      "Weekly automatic scans",
      "Weekly founder report by email",
      "Experiments with before and after results",
      "Gemini answers on top of ChatGPT and Perplexity",
      "Three brands in one workspace",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    audience: "For agencies and brands running several products.",
    monthly: 100,
    yearly: 1000,
    limits: ["10 projects", "200 tracked prompts per project", "15 competitors per project", "ChatGPT, Perplexity and Gemini", "30 scans a day", "15 seats", "24 months of answer history"],
    features: [
      "Everything in Growth",
      "The most prompts and competitors per brand",
      "Room for a whole team with 15 seats",
      "Two years of history to show long-term lift",
    ],
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
      { label: "AI engines", values: ["ChatGPT, Perplexity", "ChatGPT, Perplexity, Gemini", "ChatGPT, Perplexity, Gemini"] },
      { label: "Tracked prompts", hint: "per project", values: ["25", "75", "200"] },
      { label: "AI answers per scan", hint: "prompts × engines", values: ["50", "225", "600"] },
      { label: "Scans a day", hint: "across the workspace", values: ["3", "10", "30"] },
      { label: "Weekly automatic scans", values: [false, true, true] },
      { label: "Projects (brands)", values: ["1", "3", "10"] },
      { label: "Competitors", hint: "per project", values: ["3", "8", "15"] },
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
      { label: "Weekly founder report by email", values: [false, true, true] },
    ],
  },
  {
    title: "Team and billing",
    rows: [
      { label: "Seats", values: ["2", "5", "15"] },
      { label: "Roles: owner, admin, member", values: [true, true, true] },
      { label: "Invoices and self-serve billing", values: [true, true, true] },
      { label: "Change plan or cancel any time", values: [true, true, true] },
    ],
  },
];

export const PRICING_FAQ = [
  { q: "Is there a free trial?", a: "No. Every plan is paid, monthly or yearly, and you can cancel any time. Start on Starter if you want to try SeenLens for the price of a lunch." },
  { q: "What counts as a scan?", a: "One scan asks every active prompt in a project to every AI engine on your plan, then analyses the answers. On Growth that is up to 75 prompts × 3 engines = 225 AI answers per scan." },
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
