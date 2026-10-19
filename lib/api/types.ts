export type Engine = "chatgpt" | "perplexity" | "gemini";
export type Verdict = "recommended" | "mentioned" | "absent";

export type Project = { id: string; workspace_id: string; brand_name: string; website: string; description: string | null; category: string; country: string };

export type Role = "owner" | "admin" | "member";
export type Workspace = { id: string; name: string; role: Role };
export type Member = { user_id: number; email: string; role: Role };

export type PlanKey = "none" | "trial" | "starter" | "growth" | "pro";
/** unsubscribed = never paid; trialing only exists for workspaces that predate billing. */
export type BillingState = "unsubscribed" | "trialing" | "active" | "past_due" | "lapsed";
export type PlanLimits = {
  projects: number;
  active_prompts: number;
  competitors: number;
  engines: number | null;
  scans_per_day: number;
  seats: number;
  retention_days: number;
  schedules: boolean;
  experiments: boolean;
};
export type Billing = {
  workspace_id: string;
  plan: PlanKey;
  plan_name: string;
  state: BillingState;
  status: string | null;
  interval: "month" | "year" | null;
  can_write: boolean;
  can_manage: boolean;
  billing_enabled: boolean;
  has_billing_account: boolean;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  grace_ends_at: string | null;
  limits: PlanLimits;
  usage: {
    projects: number;
    seats: number;
    scans_today: number;
    scans_30_days: number;
    per_project: { id: string; brand_name: string; active_prompts: number; competitors: number }[];
  };
};

export type Schedule = { enabled: boolean; frequency: string; day_of_week: number; hour: number; last_run_at: string | null };
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
  evidence: {
    prompts?: string[];
    domains?: { domain: string; citations: number }[];
    competitor?: string;
    category?: string;
    findings?: { code: string; impact: string; message: string; action: string }[];
    discovery_rate?: number;
    branded_rate?: number;
    expected_objective?: string;
  };
  status: "open" | "in_progress" | "completed" | "dismissed";
  area: "content" | "third_party" | "positioning" | "technical" | null;
  expected_objective: string | null;
  related_prompts: string[];
};

export type ReportType = "weekly" | "monthly" | "manual";
export type ReportSummary = {
  id: number;
  type: ReportType;
  status: string;
  period_start: string;
  period_end: string;
  scan_id: number;
  created_at: string;
  emailed_at: string | null;
  shared: boolean;
};

export type Experiment = {
  id: number;
  name: string;
  description: string | null;
  status: "running" | "completed";
  started_at: string;
  ended_at: string | null;
  baseline: ExperimentSnapshot;
  after: ExperimentSnapshot | null;
  comparison: Record<"mention_rate" | "recommendation_rate" | "share_of_voice" | "average_position", { before: number | null; after: number | null; delta: number | null }> | null;
};
export type ExperimentSnapshot = {
  scan_id: number;
  created_at: string;
  mention_rate: number;
  recommendation_rate: number;
  share_of_voice: number;
  average_position: number | null;
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
  trend: {
    scan_id: number;
    date: string;
    mention_rate: number;
    recommendation_rate: number;
    share_of_voice: number;
    competitors: Record<string, { mention_rate: number; recommendation_rate: number; share_of_voice: number }>;
  }[];
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

export type ReportContent = {
  brand: string;
  website: string;
  category: string;
  visibility: NonNullable<Dashboard["visibility"]>;
  engines: Dashboard["engines"];
  competitors: Dashboard["competitors"];
  top_opportunities: Pick<Opportunity, "type" | "title" | "description" | "recommended_action" | "impact">[];
  trend: Dashboard["trend"];
  summary: string[];
};
export type Report = ReportSummary & { content: ReportContent };
