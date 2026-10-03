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

export const marqueePrompts: { text: string; engine: Engine }[][] = [
  [
    { text: "Which CRM should a 10-person startup use?", engine: "chatgpt" },
    { text: "Best HubSpot alternatives for small teams", engine: "perplexity" },
    { text: "What CRM is easiest to set up in a day?", engine: "gemini" },
    { text: "Affordable CRM with a good free plan", engine: "google" },
    { text: "CRM that works well with Gmail and Slack", engine: "chatgpt" },
    { text: "Is a spreadsheet enough before buying a CRM?", engine: "perplexity" },
  ],
  [
    { text: "Kiteline vs Vantor for a seed-stage startup", engine: "gemini" },
    { text: "How do small sales teams track deals?", engine: "chatgpt" },
    { text: "Simplest pipeline tool for founders", engine: "google" },
    { text: "Which CRM has the best reporting for SaaS?", engine: "perplexity" },
    { text: "Tools to stop losing leads in email threads", engine: "chatgpt" },
    { text: "CRM recommendations for a B2B agency", engine: "gemini" },
  ],
  [
    { text: "What should I look for in a startup CRM?", engine: "perplexity" },
    { text: "Lightweight CRM alternatives to Salesforce", engine: "google" },
    { text: "How do I migrate contacts to a new CRM?", engine: "chatgpt" },
    { text: "Best CRM for founder-led sales", engine: "gemini" },
    { text: "CRM with built-in email sequences", engine: "perplexity" },
    { text: "Which CRM do YC startups use?", engine: "chatgpt" },
  ],
];

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
