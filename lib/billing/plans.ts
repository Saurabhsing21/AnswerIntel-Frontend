/**
 * Plan data for the website (pricing section, /pricing page) and the subscribe step. The app's usage page
 * reads limits from the API instead. Mirrors backend/app/billing/plans.py; keep the numbers in step.
 */
import type { Engine } from "@/lib/data";

export type PaidPlan = "starter" | "growth" | "pro";
export type Interval = "month" | "year";

/**
 * Plans are priced in credits: 1 credit = 1 ChatGPT Search answer, and each answer (prompt × engine) costs its
 * engine's weight, counted over any 30 days. An engine missing here costs 1.
 */
export const ENGINE_CREDITS: Record<string, number> = {
  chatgpt_search: 1, gemini: 1.25, perplexity: 0.5, claude: 0.5, deepseek: 0.25, llama: 0.25, mistral: 0.25,
};

/** Credits one answer from this engine costs. */
export const creditsFor = (engine: string): number => ENGINE_CREDITS[engine] ?? 1;

/** Credits a month of weekly scans uses: prompts × the credits of every engine × the runs in a month. */
export const monthlyCredits = (prompts: number, engines: string[], runsPerMonth = 4.3): number =>
  prompts * engines.reduce((sum, e) => sum + creditsFor(e), 0) * runsPerMonth;

const STARTER_ENGINES: Engine[] = ["chatgpt_search", "perplexity"];
const GROWTH_ENGINES: Engine[] = [...STARTER_ENGINES, "claude"];
const PRO_ENGINES: Engine[] = [...GROWTH_ENGINES, "gemini", "deepseek", "llama", "mistral"];

const count = (n: number) => n.toLocaleString("en-US");

type PlanInfo = {
  key: PaidPlan;
  name: string;
  audience: string;
  monthly: number;
  /** Billed once a year: 20% off, chosen so the monthly equivalent is a whole number. */
  yearly: number;
  /** Active prompts, one pool shared by every project. */
  prompts: number;
  /** Credits in any 30 days. */
  credits: number;
  /** The AI engines this plan scans. */
  engines: Engine[];
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
    prompts: 50,
    credits: 650,
    engines: STARTER_ENGINES,
    includes: ["50 prompts", "650 credits a month", "Live web search, like the real apps", "Weekly automatic tracking", "2 projects", "20 competitors per project", "Unlimited seats"],
  },
  {
    key: "growth",
    name: "Growth",
    audience: "For growing teams that need deeper tracking and insights.",
    monthly: 50,
    yearly: 480,
    prompts: 120,
    credits: 1650,
    engines: GROWTH_ENGINES,
    includes: ["120 prompts", "1,650 credits a month", "Live web search, like the real apps", "Weekly automatic tracking", "4 projects", "50 competitors per project", "Experiments with before and after"],
  },
  {
    key: "pro",
    name: "Pro",
    audience: "For agencies and brands running several products.",
    monthly: 100,
    yearly: 960,
    prompts: 200,
    credits: 3300,
    engines: PRO_ENGINES,
    includes: ["200 prompts", "3,300 credits a month", "Live web search, like the real apps", "Weekly automatic tracking", "10 projects", "100 competitors per project", "Experiments with before and after"],
  },
];

/** The plan we steer people to: highlighted on the website and preselected when subscribing. */
export const FEATURED: PaidPlan = "growth";

type Cell = boolean | string | Engine[];
export type ComparisonGroup = { title: string; rows: { label: string; hint?: string; values: [Cell, Cell, Cell] }[] };

const perPlan = <T>(value: (plan: PlanInfo) => T): [T, T, T] => [value(PLANS[0]), value(PLANS[1]), value(PLANS[2])];

/** Plan-by-plan breakdown for the /pricing page. Only lists what the product actually does. */
export const COMPARISON: ComparisonGroup[] = [
  {
    title: "Tracking coverage",
    rows: [
      { label: "AI engines", values: perPlan((p) => p.engines) },
      { label: "Live web search", hint: "answers match what people see in the apps", values: [true, true, true] },
      { label: "Prompts", hint: "one pool shared by every project", values: perPlan((p) => count(p.prompts)) },
      { label: "Credits a month", hint: "1 credit = 1 ChatGPT Search answer", values: perPlan((p) => count(p.credits)) },
      { label: "Tracking frequency", values: ["Weekly, automatic", "Weekly, automatic", "Weekly, automatic"] },
      { label: "On-demand scans a day", hint: "use the same monthly credits", values: ["2", "4", "10"] },
      { label: "Country targeting", hint: "answers for your market", values: [true, true, true] },
      { label: "Projects (brands)", values: ["2", "4", "10"] },
      { label: "Competitors", hint: "per project", values: ["20", "50", "100"] },
      { label: "Answer history", values: ["6 months", "12 months", "24 months"] },
    ],
  },
  {
    title: "Discover",
    rows: [
      { label: "AI prompt discovery", hint: "buyer questions generated from your category", values: [true, true, true] },
      { label: "Prompt priority", hint: "which questions are closest to a purchase", values: [true, true, true] },
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
      { label: "Why AI picked a brand", hint: "the exact sentence behind each verdict", values: [true, true, true] },
      { label: "Noise check", hint: "flags changes within normal run-to-run variation", values: [true, true, true] },
    ],
  },
  {
    title: "Act",
    rows: [
      { label: "Ranked opportunities", values: [true, true, true] },
      { label: "Why you're missing", hint: "the cause behind each lost answer, with the fix", values: [true, true, true] },
      { label: "Website audit for AI readability", values: [true, true, true] },
      { label: "Draft the fix", hint: "a first draft for each opportunity", values: [true, true, true] },
      { label: "Experiments with before and after", values: [false, true, true] },
    ],
  },
  {
    title: "Report",
    rows: [
      { label: "On-demand reports", values: [true, true, true] },
      { label: "Share links, PDF and HTML export", values: [true, true, true] },
      { label: "Weekly founder report by email", values: [true, true, true] },
      { label: "Email alert when visibility drops", values: [true, true, true] },
      { label: "CSV export of every answer", values: [true, true, true] },
    ],
  },
  {
    title: "Team and billing",
    rows: [
      { label: "Seats", values: ["Unlimited", "Unlimited", "Unlimited"] },
      { label: "Roles: owner, admin, member", values: [true, true, true] },
      { label: "Invoices and self-serve billing", values: [true, true, true] },
      { label: "Change plan or cancel any time", values: [true, true, true] },
    ],
  },
];

export const PRICING_FAQ = [
  { q: "Is there a free trial?", a: "Yes. Every new account gets one free scan of one brand: up to 10 buyer questions on ChatGPT Search, with the full results. No card needed. After that, plans start at $20 a month and you can cancel any time." },
  { q: "Do your answers match what I see in ChatGPT?", a: "As closely as we can: ChatGPT and Gemini answer with their own live web search, Perplexity always searches, and Google AI answers come straight from Google search results. Answers still vary from run to run, so every rate shows how much it can move by chance." },
  { q: "What is a credit?", a: `Your monthly allowance. One answer from ChatGPT Search costs 1 credit, and other engines cost less or more: Perplexity and Claude 0.5, DeepSeek, Llama and Mistral 0.25, Gemini 1.25. Tracking 50 prompts weekly on ChatGPT Search and Perplexity uses about ${count(Math.round(monthlyCredits(50, STARTER_ENGINES)))} credits a month, well inside Starter's ${count(PLANS[0].credits)}. On-demand scans use the same credits.` },
  { q: "What happens when I run out of credits?", a: "New scans wait until older ones are more than 30 days old, so your credits come back as you go: they are counted over the last 30 days, not per calendar month. Engines use different credits, so lighter engines stretch further. You can switch off prompts or engines you no longer need, or move to a bigger plan any time." },
  { q: "Can I change plans later?", a: "Yes. Upgrade or downgrade from Manage billing in the app. Stripe prorates the difference automatically." },
  { q: "What happens if I cancel?", a: "Your plan runs until the end of the period you paid for. After that the workspace is read-only: you can still view and export everything, but not run new scans." },
  { q: "What if a payment fails?", a: "You get an email and 7 days to update your card. Everything keeps working during that time." },
  { q: "Does my whole team share one plan?", a: "Yes. Plans are per workspace: the owner pays and every member shares the limits. Seats are unlimited on every plan." },
];

export const isPaidPlan = (v: unknown): v is PaidPlan => v === "starter" || v === "growth" || v === "pro";

/** Days from now until `iso`, rounded up; 0 once it has passed. */
export function daysUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}
