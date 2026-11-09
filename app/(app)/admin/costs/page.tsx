"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, EmptyState, ErrorBanner, PageHeader, Segmented, Skeleton, StatStrip } from "@/components/app/ui";
import { useApi } from "@/lib/api/client";

type Row = { key: (string | null)[]; cost: number; calls: number; web_searches: number };
type Costs = {
  days: number;
  today: number;
  this_month: number;
  range_total: number;
  by_day: { date: string; cost: number }[];
  by_purpose: Row[];
  by_model: Row[];
  top_workspaces: { workspace_id: string; name: string; plan: string; spend_this_month: number; cap: number; percent_of_cap: number | null }[];
  recent_scans: { id: number; created_at: string; brand: string; kind: string; status: string; cost: number; ai_calls: number; web_searches: number }[];
  margin_by_plan: { plan: string; active_workspaces: number; revenue: number; ai_spend: number; margin: number }[];
};

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 4 : 2 })}`;
const RANGES = ["7", "30", "90"] as const;

const th = "py-2 pr-4 font-normal last:pr-5 first:pl-5";
const td = "py-2 pr-4 last:pr-5 first:pl-5";
const num = "text-right font-mono tabular-nums";

function Table({ head, left, children, empty }: { head: string[]; left: number; children: React.ReactNode[]; empty: string }) {
  if (children.length === 0) return <p className="px-5 py-6 text-[13px] text-muted">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead className="text-[11px] text-muted">
          <tr className="border-b border-line">
            {head.map((h, i) => <th key={h} className={`${th} ${i >= left ? "text-right" : ""}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

/** Daily spend as plain bars; the bar heights share one scale so days compare at a glance. */
function DailyBars({ days }: { days: Costs["by_day"] }) {
  const max = Math.max(0.0001, ...days.map((d) => d.cost));
  return (
    <div className="px-5 py-4">
      <div className="flex h-32 items-end gap-[3px]" role="img" aria-label="Daily AI spend">
        {days.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${d.date}: ${usd(d.cost)}`}>
            <span className="block w-full rounded-t-[3px] bg-ink/80 transition-colors group-hover:bg-ink" style={{ height: `${Math.max(d.cost > 0 ? 3 : 0, (d.cost / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-faint">
        <span>{days[0]?.date}</span>
        <span>peak {usd(max)}</span>
        <span>{days[days.length - 1]?.date}</span>
      </div>
    </div>
  );
}

/** Operator-only AI cost report. The backend answers 404 to anyone not in ADMIN_EMAILS, which this page shows as not found. */
export default function AdminCostsPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>("30");
  const { data, error, loading } = useApi<Costs>(`/admin/costs?days=${days}`);

  if (error?.status === 404) return <EmptyState title="Page not found" body="There is nothing at this address." />;

  return (
    <>
      <PageHeader
        title="AI costs"
        description="What the AI providers charged us, by day, purpose, model and workspace. Operators only."
        actions={<Segmented value={days} onChange={setDays} label="Period" options={RANGES.map((r) => ({ key: r, label: `${r} days` }))} />}
      />
      {error && <ErrorBanner message={error.message} />}
      {loading && !data && <Skeleton className="h-64 w-full" />}
      {data && (
        <div className="space-y-4">
          <StatStrip
            stats={[
              { label: "Today (UTC)", value: usd(data.today) },
              { label: "This month", value: usd(data.this_month) },
              { label: `Last ${data.days} days`, value: usd(data.range_total) },
              { label: "Daily average", value: usd(data.range_total / data.days) },
            ]}
          />
          <Card title="Daily spend" subtitle={`Last ${data.days} days, UTC`}>
            <DailyBars days={data.by_day} />
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="By purpose" subtitle={`Last ${data.days} days`}>
              <Table left={1} head={["Purpose", "Spend", "Calls", "Searches"]} empty="No AI calls in this period.">
                {data.by_purpose.map((r) => (
                  <tr key={String(r.key[0])}>
                    <td className={td}>{r.key[0]}</td>
                    <td className={`${td} ${num}`}>{usd(r.cost)}</td>
                    <td className={`${td} ${num}`}>{r.calls}</td>
                    <td className={`${td} ${num}`}>{r.web_searches}</td>
                  </tr>
                ))}
              </Table>
            </Card>
            <Card title="By model and engine" subtitle={`Last ${data.days} days`}>
              <Table left={2} head={["Model", "Engine", "Spend", "Calls"]} empty="No AI calls in this period.">
                {data.by_model.map((r) => (
                  <tr key={r.key.join("|")}>
                    <td className={`${td} break-all`}>{r.key[0]}</td>
                    <td className={`${td} text-muted`}>{r.key[1] ?? "none"}</td>
                    <td className={`${td} ${num}`}>{usd(r.cost)}</td>
                    <td className={`${td} ${num}`}>{r.calls}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          </div>

          <Card title="Top workspaces this month" subtitle="Spend against each workspace's monthly cap">
            <Table left={2} head={["Workspace", "Plan", "Spend", "Cap", "% of cap"]} empty="No spend this month yet.">
              {data.top_workspaces.map((w) => (
                <tr key={w.workspace_id}>
                  <td className={td}>{w.name}</td>
                  <td className={`${td} text-muted`}>{w.plan}</td>
                  <td className={`${td} ${num}`}>{usd(w.spend_this_month)}</td>
                  <td className={`${td} ${num}`}>{usd(w.cap)}</td>
                  <td className={`${td} ${num} ${w.percent_of_cap !== null && w.percent_of_cap >= 100 ? "text-down-ink" : ""}`}>{w.percent_of_cap === null ? "-" : `${w.percent_of_cap}%`}</td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Margin by plan" subtitle="Monthly plan price of active subscriptions against this month's AI spend">
            <Table left={1} head={["Plan", "Active workspaces", "Revenue", "AI spend", "Margin"]} empty="No subscriptions yet.">
              {data.margin_by_plan.map((p) => (
                <tr key={p.plan}>
                  <td className={td}>{p.plan}</td>
                  <td className={`${td} ${num}`}>{p.active_workspaces}</td>
                  <td className={`${td} ${num}`}>{usd(p.revenue)}</td>
                  <td className={`${td} ${num}`}>{usd(p.ai_spend)}</td>
                  <td className={`${td} ${num} ${p.margin < 0 ? "text-down-ink" : ""}`}>{usd(p.margin)}</td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Recent scans" subtitle="The latest 20, with what each one cost. Open one for its full breakdown.">
            <Table left={2} head={["Brand", "Status", "Spend", "Calls", "Searches"]} empty="No scans yet.">
              {data.recent_scans.map((s) => (
                <tr key={s.id} className="hover:bg-sunken/60">
                  <td className={td}>
                    <Link href={`/admin/runs/${s.id}`} className="font-medium text-ink underline-offset-2 hover:underline">{s.brand}</Link>
                    <span className="text-muted"> · {s.kind}, {new Date(s.created_at).toLocaleString()}</span>
                  </td>
                  <td className={`${td} text-muted`}>{s.status}</td>
                  <td className={`${td} ${num}`}>{usd(s.cost)}</td>
                  <td className={`${td} ${num}`}>{s.ai_calls}</td>
                  <td className={`${td} ${num}`}>{s.web_searches}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}
    </>
  );
}
