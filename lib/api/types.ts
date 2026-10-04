export type Engine = "chatgpt" | "perplexity" | "gemini";
export type Verdict = "recommended" | "mentioned" | "absent";

export type Project = { id: string; brand_name: string; website: string; description: string | null; category: string; country: string };
export type Competitor = { id: number; name: string; website: string };

export type Prompt = {
  id: number;
  text: string;
  category: string;
  intent: string;
  source: "ai" | "template" | "user";
  importance: number | null;
  is_active: boolean;
};

export type Scan = {
  id: number;
  status: "queued" | "running" | "completed" | "partial" | "failed";
  provider: string | null;
  simulated: boolean;
  total_runs: number;
  completed_runs: number;
  failed_runs: number;
  progress: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type MetricKey = "mention_rate" | "recommendation_rate" | "share_of_voice" | "citation_rate" | "positive_sentiment_rate" | "average_position";

export type Opportunity = {
  id: number;
  scan_id: number;
  type: string;
  title: string;
  description: string;
  recommended_action: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  evidence: { prompts?: string[]; domains?: { domain: string; citations: number }[]; competitor?: string; category?: string };
  status: "open" | "in_progress" | "completed" | "dismissed";
};

export type Dashboard = {
  project: Project;
  counts: { competitors: number; active_prompts: number };
  latest_scan: Scan | null;
  has_data: boolean;
  metrics_scan?: Scan;
  visibility: (Record<MetricKey, number | null> & { total_responses: number; deltas: Record<MetricKey, number | null> }) | null;
  engines: { key: Engine; name: string; responses: number; mention_rate: number; recommendation_rate: number }[];
  competitors: { id: number | null; name: string; is_you: boolean; mention_rate: number; recommendation_rate: number; share_of_voice: number; average_position: number | null; citation_count: number }[];
  trend: { scan_id: number; date: string; mention_rate: number; recommendation_rate: number; share_of_voice: number }[];
  top_opportunities: Opportunity[];
  recent_answers: { id: number; engine: Engine; engine_name: string; prompt: string; verdict: Verdict; position: number | null; created_at: string }[];
};

export type EngineResult = {
  response_id: number;
  engine: Engine;
  engine_name: string;
  verdict: Verdict;
  position: number | null;
  sentiment: string | null;
  competitors_recommended: string[];
  citations: string[];
};

export type ScanResults = {
  scan: Scan;
  prompts: { scan_prompt_id: number; prompt_id: number | null; text: string; category: string; engines: EngineResult[]; seen_on: number; recommended_on: number }[];
};

export type ResponseDetail = {
  id: number;
  engine: Engine;
  engine_name: string;
  model: string;
  provider: string;
  prompt: string;
  text: string;
  brand: { name: string; mentioned: boolean; recommended: boolean; position: number | null; sentiment: string | null; reason: string | null; method: string } | null;
  competitors: { id: number; name: string; mentioned: boolean; recommended: boolean; position: number | null; sentiment: string | null }[];
  citations: { url: string; domain: string; source_type: string; is_brand_owned: boolean; competitor: string | null }[];
};

export type Source = {
  domain: string;
  source_type: string;
  citations: number;
  with_you: number;
  with_competitors: { name: string; count: number }[];
  is_brand_owned: boolean;
  owner: string | null;
  urls: string[];
  group: "you" | "competitors" | "both";
};

export type CompetitorAnalysis = {
  scan_id: number | null;
  total_prompts?: number;
  competitors: (Competitor & { mention_rate: number; recommendation_rate: number; share_of_voice: number; average_position: number | null; you_win: number; they_win: number; both: number; losing_prompts: string[]; winning_prompts: string[] })[];
};
