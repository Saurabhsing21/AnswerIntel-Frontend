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
    includes: ["30 prompts", "520 AI answers a month", "ChatGPT, Perplexity, Gemini and Google AI", "Live web search, like the real apps", "Weekly automatic tracking", "2 projects", "20 competitors per project", "Unlimited seats"],
  },
  {
    key: "growth",
    name: "Growth",
    audience: "For growing teams that need deeper tracking and insights.",
    monthly: 50,
    yearly: 480,
    includes: ["80 prompts", "1,400 AI answers a month", "ChatGPT, Perplexity, Gemini and Google AI", "Live web search, like the real apps", "Weekly automatic tracking", "4 projects", "50 competitors per project", "Experiments with before and after"],
  },
  {
    key: "pro",
    name: "Pro",
    audience: "For agencies and brands running several products.",
    monthly: 100,
    yearly: 960,
    includes: ["160 prompts", "2,800 AI answers a month", "ChatGPT, Perplexity, Gemini and Google AI", "Live web search, like the real apps", "Weekly automatic tracking", "10 projects", "100 competitors per project", "Experiments with before and after"],
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
      { label: "AI engines", values: ["ChatGPT, Perplexity, Gemini and Google AI", "ChatGPT, Perplexity, Gemini and Google AI", "ChatGPT, Perplexity, Gemini and Google AI"] },
      { label: "Live web search", hint: "answers match what people see in the apps", values: [true, true, true] },
      { label: "Prompts", hint: "one pool shared by every project", values: ["30", "80", "160"] },
      { label: "AI answers a month", hint: "prompts × engines × runs", values: ["520", "1,400", "2,800"] },
      { label: "Tracking frequency", values: ["Weekly, automatic", "Weekly, automatic", "Weekly, automatic"] },
      { label: "On-demand scans a day", hint: "use the same monthly answers", values: ["2", "4", "10"] },
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
  { q: "Is there a free trial?", a: "Yes. Every new account gets one free scan of one brand: up to 10 buyer questions across the AI engines, with the full results. No card needed. After that, plans start at $20 a month and you can cancel any time." },
  { q: "Do your answers match what I see in ChatGPT?", a: "As closely as we can: ChatGPT and Gemini answer with their own live web search, Perplexity always searches, and Google AI answers come straight from Google search results. Answers still vary from run to run, so every rate shows how much it can move by chance." },
  { q: "What is an AI answer?", a: "One prompt asked to one AI engine. Tracking 30 prompts weekly on 4 engines uses about 520 answers a month, which is exactly the Starter allowance. On-demand scans use the same allowance." },
  { q: "What happens when I run out of AI answers?", a: "New scans wait until older ones are more than 30 days old, so your allowance refills as you go. You can switch off prompts you no longer need, or move to a bigger plan any time." },
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
