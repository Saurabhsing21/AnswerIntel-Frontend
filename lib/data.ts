// Sample data for the marketing mocks. Brands are fictional.

export type Engine =
  | "chatgpt"
  | "perplexity"
  | "gemini"
  | "google"
  | "claude"
  | "copilot";

export type Brand = {
  id: string;
  name: string;
  domain: string;
  color: string;
  you?: boolean;
};

export const brands: Brand[] = [
  { id: "kiteline", name: "Kiteline", domain: "kiteline.io", color: "#e5484d" },
  { id: "vantor", name: "Vantor", domain: "vantor.app", color: "#38bdf8" },
  { id: "halden", name: "Halden", domain: "halden.co", color: "#2563eb", you: true },
  { id: "norrow", name: "Norrow", domain: "norrow.com", color: "#eab308" },
  { id: "pellucid", name: "Pellucid", domain: "pellucid.so", color: "#15803d" },
];

export const you = brands.find((b) => b.you)!;

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export type MetricKey = "mentions" | "recommendations" | "sov";

export const metricLabels: Record<MetricKey, string> = {
  mentions: "Mentions",
  recommendations: "Recommendations",
  sov: "Share of voice",
};

// Percent per month, per brand.
export const series: Record<MetricKey, Record<string, number[]>> = {
  mentions: {
    kiteline: [58, 61, 63, 65, 64, 66],
    vantor: [52, 55, 60, 62, 61, 59],
    halden: [38, 40, 43, 47, 50, 53],
    norrow: [30, 31, 29, 32, 34, 33],
    pellucid: [24, 22, 23, 21, 22, 20],
  },
  recommendations: {
    kiteline: [44, 47, 49, 51, 50, 52],
    vantor: [40, 42, 45, 46, 44, 43],
    halden: [22, 24, 27, 31, 34, 38],
    norrow: [19, 20, 18, 21, 22, 21],
    pellucid: [12, 11, 13, 12, 12, 11],
  },
  sov: {
    kiteline: [31, 32, 31, 30, 29, 29],
    vantor: [27, 27, 28, 27, 26, 25],
    halden: [16, 17, 19, 21, 23, 25],
    norrow: [15, 14, 13, 14, 14, 13],
    pellucid: [11, 10, 9, 8, 8, 8],
  },
};

const sentiment: Record<string, number> = {
  kiteline: 88,
  vantor: 74,
  halden: 82,
  norrow: 69,
  pellucid: 61,
};

const position: Record<string, number> = {
  kiteline: 1.8,
  vantor: 2.4,
  halden: 2.9,
  norrow: 3.6,
  pellucid: 4.2,
};

export type CompetitorRow = {
  brand: Brand;
  visibility: number;
  visibilityDelta: number;
  sentiment: number;
  position: number;
};

// Latest month vs previous month, derived from the series above.
export const competitorRows: CompetitorRow[] = brands.map((brand) => {
  const values = series.mentions[brand.id];
  const last = values[values.length - 1];
  return {
    brand,
    visibility: last,
    visibilityDelta: last - values[values.length - 2],
    sentiment: sentiment[brand.id],
    position: position[brand.id],
  };
});


export const faqs = [
  {
    q: "What does AnswerIntel do?",
    a: "It asks AI assistants the questions your buyers ask, records every answer, and shows how often you are mentioned, recommended, and cited compared to your competitors. Then it explains the gaps and suggests what to fix.",
  },
  {
    q: "Which AI engines do you track?",
    a: "ChatGPT, Perplexity, Gemini, and Google AI Overviews at launch. Claude and Copilot are next.",
  },
  {
    q: "What is the difference between a mention and a recommendation?",
    a: "A mention means the AI named your brand. A recommendation means it told the buyer to choose you. Many brands get mentioned in passing while a competitor gets recommended, so we track both separately.",
  },
  {
    q: "Where do the prompts come from?",
    a: "We generate 30 to 50 realistic buyer questions from your category, market, and competitors. You review them, edit or remove any, and add your own before the first scan.",
  },
  {
    q: "How often is my visibility measured?",
    a: "Every week by default. Each scan is stored, so you can compare any two weeks and see whether a change you shipped moved the numbers.",
  },
  {
    q: "When can I get access?",
    a: "We are onboarding teams from the waitlist in small groups. Join with your work email and we will reach out when your spot opens.",
  },
];

// Hero engine sweep: one buyer question, four engines, what each one said.
export type EngineResult = {
  mentioned: boolean;
  recommended: boolean;
  position: number | null;
  /** Answer excerpt; "Halden" is highlighted wherever it appears. */
  snippet: string;
};

export const sweeps: { prompt: string; results: Record<"chatgpt" | "perplexity" | "gemini" | "google", EngineResult> }[] = [
  {
    prompt: "Which CRM should a 10-person startup use?",
    results: {
      chatgpt: { mentioned: true, recommended: false, position: 3, snippet: "Kiteline and Vantor are the safest picks. Halden is a newer option." },
      perplexity: { mentioned: true, recommended: true, position: 2, snippet: "Halden stands out for fast setup and a clean interface." },
      gemini: { mentioned: false, recommended: false, position: null, snippet: "Most small teams choose Kiteline, Vantor, or Norrow." },
      google: { mentioned: true, recommended: false, position: 4, snippet: "Popular options include Kiteline, Vantor, Norrow and Halden." },
    },
  },
  {
    prompt: "Best Kiteline alternatives for small teams",
    results: {
      chatgpt: { mentioned: true, recommended: true, position: 1, snippet: "Halden is the closest alternative, with simpler pricing." },
      perplexity: { mentioned: true, recommended: true, position: 2, snippet: "Vantor and Halden are the two most cited alternatives." },
      gemini: { mentioned: true, recommended: false, position: 3, snippet: "Consider Vantor, Norrow, or Halden depending on budget." },
      google: { mentioned: false, recommended: false, position: null, snippet: "Vantor and Norrow are frequent Kiteline replacements." },
    },
  },
  {
    prompt: "Simplest CRM for founder-led sales",
    results: {
      chatgpt: { mentioned: false, recommended: false, position: null, snippet: "Founders often start with Kiteline's free plan." },
      perplexity: { mentioned: true, recommended: false, position: 4, snippet: "Kiteline leads; Halden is mentioned for its clean pipeline view." },
      gemini: { mentioned: true, recommended: true, position: 2, snippet: "Halden keeps the pipeline simple, which suits founder-led sales." },
      google: { mentioned: true, recommended: true, position: 1, snippet: "Halden is frequently recommended for founder-led sales." },
    },
  },
];

// Prompt library, grouped by the PRD's prompt categories.
export const promptLibrary: {
  category: string;
  prompts: { text: string; intent: string; seenOn: Engine[] }[];
}[] = [
  {
    category: "Category",
    prompts: [
      { text: "What are the best CRMs for startups?", intent: "Commercial", seenOn: ["chatgpt", "perplexity"] },
      { text: "Top CRM tools for small B2B teams", intent: "Commercial", seenOn: ["perplexity", "google"] },
      { text: "Which CRMs are popular with SaaS companies?", intent: "Informational", seenOn: ["gemini"] },
      { text: "Most loved CRM software in 2026", intent: "Commercial", seenOn: [] },
    ],
  },
  {
    category: "Comparison",
    prompts: [
      { text: "Kiteline vs Vantor for a seed-stage startup", intent: "Comparison", seenOn: ["chatgpt"] },
      { text: "Halden vs Kiteline: which is easier to set up?", intent: "Comparison", seenOn: ["chatgpt", "perplexity", "gemini"] },
      { text: "Vantor or Norrow for a 5-person sales team?", intent: "Comparison", seenOn: [] },
      { text: "Is Halden cheaper than Vantor?", intent: "Comparison", seenOn: ["perplexity", "google"] },
    ],
  },
  {
    category: "Alternatives",
    prompts: [
      { text: "Best Kiteline alternatives for small teams", intent: "Commercial", seenOn: ["chatgpt", "perplexity", "gemini"] },
      { text: "Cheaper alternatives to Vantor", intent: "Transactional", seenOn: ["perplexity"] },
      { text: "Lightweight Salesforce alternatives", intent: "Commercial", seenOn: [] },
      { text: "Norrow alternatives with better reporting", intent: "Commercial", seenOn: ["gemini"] },
    ],
  },
  {
    category: "Problem",
    prompts: [
      { text: "How do I stop losing leads in email threads?", intent: "Informational", seenOn: ["chatgpt"] },
      { text: "Is a spreadsheet enough before buying a CRM?", intent: "Informational", seenOn: [] },
      { text: "How do small teams keep a sales pipeline clean?", intent: "Informational", seenOn: ["perplexity", "gemini"] },
      { text: "Why do founders struggle with sales follow-up?", intent: "Informational", seenOn: [] },
    ],
  },
  {
    category: "Buyer intent",
    prompts: [
      { text: "Which CRM should a 10-person startup use?", intent: "Commercial", seenOn: ["chatgpt", "perplexity", "google"] },
      { text: "Simplest CRM for founder-led sales", intent: "Commercial", seenOn: ["perplexity", "gemini", "google"] },
      { text: "Affordable CRM with a good free plan", intent: "Transactional", seenOn: ["google"] },
      { text: "CRM I can set up in one afternoon", intent: "Transactional", seenOn: ["chatgpt"] },
    ],
  },
];

// Head-to-head: extra per-brand signals not in the series above.
export const citedSources: Record<string, number> = {
  kiteline: 7,
  vantor: 5,
  halden: 2,
  norrow: 3,
  pellucid: 1,
};

export const rivalWins: Record<string, { prompt: string; engine: Engine; why: string }[]> = {
  kiteline: [
    { prompt: "Which CRM should a 10-person startup use?", engine: "chatgpt", why: "Cited by 3 startup comparison articles you are missing from." },
    { prompt: "CRM with the best free plan", engine: "google", why: "Their pricing page answers this directly. Yours renders client-side." },
    { prompt: "Easiest CRM to set up for a small team", engine: "gemini", why: "Strong G2 reviews mention setup time in the first sentence." },
  ],
  vantor: [
    { prompt: "CRM with strong automation for startups", engine: "perplexity", why: "A detailed automation guide is quoted almost word for word." },
    { prompt: "Which CRM has the best reporting for SaaS?", engine: "chatgpt", why: "Reddit threads repeatedly praise their reporting." },
    { prompt: "CRM for a growing B2B sales team", engine: "gemini", why: "Their homepage names B2B sales teams. Yours says business software." },
  ],
  norrow: [
    { prompt: "CRM for agencies managing many clients", engine: "google", why: "They publish an agency use-case page. You have none." },
    { prompt: "Simple CRM with built-in invoicing", engine: "perplexity", why: "Invoicing is a feature you do not offer, so this one is fine to lose." },
    { prompt: "CRM with the best client portal", engine: "chatgpt", why: "A comparison site ranks their client portal first." },
  ],
  pellucid: [
    { prompt: "Open-source CRM options for startups", engine: "chatgpt", why: "Their GitHub repository is cited as the source." },
    { prompt: "Self-hosted CRM for privacy-focused teams", engine: "perplexity", why: "Privacy positioning on every page matches the question." },
    { prompt: "CRM with unlimited free users", engine: "google", why: "Their pricing table states it clearly in plain HTML." },
  ],
};
