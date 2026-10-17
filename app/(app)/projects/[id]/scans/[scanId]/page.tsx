"use client";

import { CaretLeft, CheckCircle, ListMagnifyingGlass, Prohibit, Trophy } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ResponseDrawer } from "@/components/app/response-drawer";
import { Card, EmptyState, ErrorBanner, Segmented, Skeleton, StatStrip, VerdictPill } from "@/components/app/ui";
import { EngineIcon } from "@/components/product/engine-icon";
import { useApi } from "@/lib/api/client";
import type { Engine, ScanResults } from "@/lib/api/types";
import { CATEGORY_LABELS } from "@/lib/format";

const ENGINES: { key: Engine; name: string }[] = [
  { key: "chatgpt", name: "ChatGPT" },
  { key: "perplexity", name: "Perplexity" },
  { key: "gemini", name: "Gemini" },
];

export default function ScanDetailPage() {
  const { id, scanId } = useParams<{ id: string; scanId: string }>();
  const { data, error, loading } = useApi<ScanResults>(`/projects/${id}/scans/${scanId}/results`);
  const [filter, setFilter] = useState<"all" | "won" | "missed">("all");
  const [open, setOpen] = useState<number | null>(null);

  if (error) return <ErrorBanner message={error.message} />;
  if (loading || !data) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-24" /><Skeleton className="h-96" /></div>;

  const prompts = data.prompts;
  const won = prompts.filter((p) => p.recommended_on > 0);
  const missed = prompts.filter((p) => p.seen_on === 0);
  const rows = filter === "won" ? won : filter === "missed" ? missed : prompts;

  return (
    <>
      <div className="mb-5">
        <Link href={`/projects/${id}/scans`} className="inline-flex items-center gap-1 text-[12px] text-muted transition-colors hover:text-ink">
          <CaretLeft size={12} weight="bold" /> Scan history
        </Link>
        <h1 className="mt-2 font-display text-[24px] font-semibold tracking-[-0.03em] md:text-[26px]">Scan #{data.scan.id}</h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {new Date(data.scan.started_at ?? data.scan.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {data.scan.completed_runs}/{data.scan.total_runs} answers
          {data.scan.simulated ? " · sample data" : ""}
        </p>
      </div>

      <StatStrip
        stats={[
          { label: "Prompts asked", value: prompts.length, hint: "each to 3 engines", icon: <ListMagnifyingGlass size={18} /> },
          { label: "Recommended you", value: won.length, hint: "on at least one engine", icon: <Trophy size={18} /> },
          { label: "Never mentioned", value: missed.length, hint: "on any engine", icon: <Prohibit size={18} /> },
          { label: "Answers", value: data.scan.completed_runs, hint: data.scan.failed_runs ? `${data.scan.failed_runs} failed` : "all succeeded", icon: <CheckCircle size={18} /> },
        ]}
      />

      <div className="mb-4">
        <Segmented
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: "All prompts", count: prompts.length },
            { key: "won", label: "Recommended", count: won.length },
            { key: "missed", label: "Missed everywhere", count: missed.length },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon={<ListMagnifyingGlass size={30} />} title="Nothing in this view" body="Try another filter." /></Card>
      ) : (
        <Card>
          <div className="hidden grid-cols-[1.6fr_repeat(3,minmax(0,1fr))] gap-x-3 border-b border-line px-5 py-2 text-[11px] text-muted md:grid">
            <span>Prompt</span>
            {ENGINES.map((e) => (
              <span key={e.key} className="flex items-center gap-1.5">
                <EngineIcon engine={e.key} size={12} /> {e.name}
              </span>
            ))}
          </div>
          <ul className="divide-y divide-line">
            {rows.map((p) => (
              <li key={p.scan_prompt_id} className="grid items-center gap-x-3 gap-y-2 px-5 py-3 md:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
                <span className="min-w-0">
                  <span className="block text-[13px] text-ink">{p.text}</span>
                  <span className="text-[11px] text-faint">{CATEGORY_LABELS[p.category] ?? p.category}</span>
                </span>
                {ENGINES.map((e) => {
                  const r = p.engines.find((x) => x.engine === e.key);
                  return (
                    <span key={e.key} className="flex items-center gap-2 md:block">
                      <span className="text-[11px] text-faint md:hidden">{e.name}</span>
                      {r ? (
                        <button type="button" onClick={() => setOpen(r.response_id)} className="rounded-full transition-opacity hover:opacity-70" aria-label={`Open ${e.name} answer`}>
                          <VerdictPill verdict={r.verdict} position={r.position} />
                        </button>
                      ) : (
                        <span className="text-faint">-</span>
                      )}
                    </span>
                  );
                })}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <ResponseDrawer projectId={id} responseId={open} onClose={() => setOpen(null)} />
    </>
  );
}
