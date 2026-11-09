"use client";

import Link from "next/link";
import { use } from "react";
import { Card, ErrorBanner, PageHeader, Skeleton, StatStrip } from "@/components/app/ui";
import { useApi } from "@/lib/api/client";

type Breakdown = { purpose: string; engine: string | null; calls: number; failed: number; cost: number; input_tokens: number; output_tokens: number; web_searches: number };
type Call = {
  id: number; created_at: string; purpose: string; engine: string | null; model: string; cost: number;
  input_tokens: number; output_tokens: number; reasoning_tokens: number; web_searches: number; latency_ms: number | null; status: string;
};
type RunDetail = {
  scan: {
    id: number; brand: string; workspace_id: string; kind: string; status: string;
    created_at: string; started_at: string | null; completed_at: string | null; duration_ms: number | null;
    total_runs: number; completed_runs: number; failed_runs: number; ai_calls: number; web_searches: number;
    cost: number; credits_charged: number; cost_per_credit: number | null;
  };
  breakdown: Breakdown[];
  calls: Call[];
};

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n < 1 ? 4 : 2, maximumFractionDigits: n < 1 ? 5 : 2 })}`;
const int = (n: number) => n.toLocaleString("en-US");
const th = "py-2 pr-4 font-normal last:pr-5 first:pl-5";
const td = "py-2 pr-4 last:pr-5 first:pl-5";
const num = "text-right font-mono tabular-nums";
const fail = "text-[#c0392b]";

function Table({ head, left, children, empty }: { head: string[]; left: number; children: React.ReactNode[]; empty: string }) {
  if (children.length === 0) return <p className="px-5 py-6 text-[13px] text-muted">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead className="text-muted">
          <tr className="border-b border-line">
            {head.map((h, i) => <th key={h} className={`${th} ${i >= left ? num : ""}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export default function RunDetailPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = use(params);
  const { data, error, loading } = useApi<RunDetail>(`/admin/runs/${scanId}`);
  const over = data?.scan.cost_per_credit != null && data.scan.cost_per_credit > 0.0138;

  return (
    <>
      <PageHeader
        title={data ? `Run #${data.scan.id} · ${data.scan.brand}` : `Run #${scanId}`}
        description="Every billed AI call in this run, with the real cost the provider charged."
        actions={<Link href="/admin/costs" className="text-[13px] text-muted underline-offset-2 hover:text-ink hover:underline">← All costs</Link>}
      />

      {loading && <Skeleton className="h-64" />}
      {error && <ErrorBanner message="Could not load this run." />}

      {data && (
        <div className="space-y-4">
          <StatStrip
            stats={[
              { label: "Real cost", value: usd(data.scan.cost), hint: `${data.scan.ai_calls} calls · ${data.scan.web_searches} web searches` },
              { label: "Credits charged", value: int(data.scan.credits_charged), hint: `${data.scan.kind} scan` },
              { label: "Cost per credit", value: data.scan.cost_per_credit != null ? usd(data.scan.cost_per_credit) : "—", hint: "target ≤ $0.0138", tone: over ? "red" : "green" },
              { label: "Answers", value: `${data.scan.completed_runs}/${data.scan.total_runs}`, hint: data.scan.duration_ms != null ? `${(data.scan.duration_ms / 1000).toFixed(1)}s` : data.scan.status },
            ]}
          />

          <Card title="Where the cost went" subtitle="By purpose and engine, dearest first">
            <Table left={2} head={["Purpose", "Engine", "Cost", "Calls", "In tok", "Out tok", "Searches"]} empty="No billed calls for this run.">
              {data.breakdown.map((b) => (
                <tr key={`${b.purpose}:${b.engine}`}>
                  <td className={td}>{b.purpose}{b.failed > 0 && <span className={fail}> · {b.failed} failed</span>}</td>
                  <td className={`${td} text-muted`}>{b.engine ?? "—"}</td>
                  <td className={`${td} ${num} font-medium`}>{usd(b.cost)}</td>
                  <td className={`${td} ${num}`}>{b.calls}</td>
                  <td className={`${td} ${num} text-muted`}>{int(b.input_tokens)}</td>
                  <td className={`${td} ${num} text-muted`}>{int(b.output_tokens)}</td>
                  <td className={`${td} ${num}`}>{b.web_searches}</td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Every call" subtitle={`${data.calls.length} billed calls, dearest first`}>
            <Table left={3} head={["Purpose", "Engine", "Model", "Cost", "In", "Out", "Reason", "Search", "Latency"]} empty="No calls.">
              {data.calls.map((c) => (
                <tr key={c.id} className={c.status === "failed" ? fail : ""}>
                  <td className={td}>{c.purpose}</td>
                  <td className={`${td} text-muted`}>{c.engine ?? "—"}</td>
                  <td className={`${td} font-mono text-[12px] text-muted`}>{c.model}</td>
                  <td className={`${td} ${num} font-medium`}>{usd(c.cost)}</td>
                  <td className={`${td} ${num} text-muted`}>{int(c.input_tokens)}</td>
                  <td className={`${td} ${num} text-muted`}>{int(c.output_tokens)}</td>
                  <td className={`${td} ${num} text-muted`}>{c.reasoning_tokens || "—"}</td>
                  <td className={`${td} ${num}`}>{c.web_searches || "—"}</td>
                  <td className={`${td} ${num} text-muted`}>{c.latency_ms != null ? `${c.latency_ms}ms` : "—"}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}
    </>
  );
}
