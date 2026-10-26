"use client";

import { CheckCircle, Crosshair, Plus, Sword, Trophy, UsersThree, X, XCircle } from "@phosphor-icons/react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandTile } from "@/components/app/brand-tile";
import { SourcesSection } from "@/components/app/sources-section";
import { useProject, useRefreshOnScan } from "@/components/app/project-context";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, inputClass, PageHeader, Skeleton, StatStrip } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Competitor, CompetitorAnalysis } from "@/lib/api/types";
import { brandColor } from "@/lib/brand";
import { cx } from "@/lib/cx";
import { pct, pos } from "@/lib/format";

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function PromptList({ title, tone, prompts }: { title: string; tone: "win" | "lose"; prompts: string[] }) {
  const Icon = tone === "win" ? CheckCircle : XCircle;
  return (
    <div className="min-w-0 p-5">
      <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
        <Icon size={14} weight="fill" className={tone === "win" ? "text-up" : "text-down"} />
        {title}
        <span className="font-mono text-faint">{prompts.length}</span>
      </p>
      {prompts.length === 0 ? (
        <p className="mt-2 text-[12px] text-faint">{tone === "win" ? "No prompts yet where you come out ahead." : "None. You hold your ground on every prompt."}</p>
      ) : (
        <ul className="mt-2.5 space-y-1.5">
          {prompts.slice(0, 4).map((p) => (
            <li key={p} className="truncate rounded-[8px] bg-[#fafaf9] px-3 py-1.5 text-[12px] text-ink-2" title={p}>
              {p}
            </li>
          ))}
          {prompts.length > 4 && <li className="px-1 text-[11px] text-faint">and {prompts.length - 4} more</li>}
        </ul>
      )}
    </div>
  );
}

function CompetitorsInner() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const toast = useToast();
  const { data: competitors, setData: setCompetitors, error: listError } = useApi<Competitor[]>(`/projects/${id}/competitors`);
  const { data: analysis, loading, reload } = useApi<CompetitorAnalysis>(`/projects/${id}/competitors/analysis`);
  useRefreshOnScan(reload);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const max = useProject().billing?.limits.competitors; // set by the workspace's plan

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    let website = f.website.trim();
    if (website && !/^https?:\/\//.test(website)) website = `https://${website}`;
    setBusy(true);
    setError("");
    try {
      const created = await api<Competitor>(`/projects/${id}/competitors`, { method: "POST", json: { name: f.name, website } });
      setCompetitors((all) => [...(all ?? []), created]);
      form.reset();
      toast.push(`${created.name} added. It is measured from your next scan.`, "success");
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Competitor) {
    try {
      await api(`/projects/${id}/competitors/${c.id}`, { method: "DELETE" });
      setCompetitors((all) => (all ?? []).filter((x) => x.id !== c.id));
      toast.push(`${c.name} removed.`, "success");
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  if (listError) return <ErrorBanner message={listError.message} />;
  const names = (competitors ?? []).map((c) => c.name);
  const rows = analysis?.scan_id != null ? analysis.competitors : [];
  const wins = rows.reduce((s, c) => s + c.you_win, 0);
  const losses = rows.reduce((s, c) => s + c.they_win, 0);
  const lossesBy = new Map(rows.map((r) => [r.id, r.they_win]));
  const threat = [...rows].sort((a, b) => b.they_win - a.they_win)[0];

  return (
    <>
      <PageHeader title="Competitors" description="Where each rival beats you, on which questions, and which sites AI cites for them." />

      <StatStrip
        stats={[
          { label: "Tracked", value: `${competitors?.length ?? 0}/${max ?? "–"}`, hint: "brands you compare against", icon: <UsersThree size={18} />, tone: "blue" },
          { label: "Prompts you win", value: wins, hint: "you are recommended, they are not", icon: <Trophy size={18} />, tone: "green" },
          { label: "Prompts you lose", value: losses, hint: "they are recommended, you are not", icon: <Sword size={18} />, tone: "red" },
          { label: "Biggest threat", value: threat && threat.they_win > 0 ? threat.name : "None", hint: threat && threat.they_win > 0 ? `wins ${threat.they_win} prompts` : "nobody is ahead of you", icon: <Crosshair size={18} />, tone: "amber" },
        ]}
      />

      <Card title="Tracked competitors" subtitle={`${competitors?.length ?? 0} of ${max ?? "–"}. Ordered by how many prompts each one wins over you.`}>
        <div className="flex flex-wrap gap-2 px-5 py-4">
          {(competitors ?? []).length === 0 && <p className="text-[13px] text-muted">No competitors yet. Add the brands buyers compare you with.</p>}
          {[...(competitors ?? [])]
            .sort((x, y) => (lossesBy.get(y.id) ?? 0) - (lossesBy.get(x.id) ?? 0))
            .map((c) => {
              const lost = lossesBy.get(c.id);
              return (
                <span key={c.id} className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pr-1 pl-1.5 text-[13px]">
                  <BrandTile name={c.name} color={brandColor(c.name, false, names)} size={22} website={c.website} />
                  <span className="font-medium text-ink">{c.name}</span>
                  <span className="text-[12px] text-muted">{host(c.website)}</span>
                  {lost != null && lost > 0 && <span className="rounded-full bg-down-soft px-2 py-0.5 text-[11px] font-medium text-down-ink">wins {lost}</span>}
                  <button type="button" onClick={() => remove(c)} aria-label={`Remove ${c.name}`} title="Stop tracking" className="grid size-6 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-down">
                    <X size={12} />
                  </button>
                </span>
              );
            })}
        </div>
        {(competitors?.length ?? 0) < (max ?? Infinity) ? (
          <form onSubmit={add} className="flex flex-col gap-2 border-t border-line bg-[#fbfbfa] px-5 py-3.5 sm:flex-row sm:items-center">
            <input name="name" required autoFocus={params.get("add") === "1"} aria-label="Competitor name" className={cx(inputClass, "h-9 bg-surface sm:w-[220px]")} placeholder="Competitor name" />
            <input name="website" required aria-label="Competitor website" className={cx(inputClass, "h-9 flex-1 bg-surface")} placeholder="competitor.com" />
            <button type="submit" disabled={busy} className={buttonClass("primary", "sm")}>
              <Plus size={14} weight="bold" /> Add competitor
            </button>
          </form>
        ) : (
          <p className="border-t border-line px-5 py-3 text-[12px] text-muted">You are tracking your plan&apos;s maximum of {max}. Remove one, or upgrade your plan to track more.</p>
        )}
        {error && <div className="px-5 pb-4"><ErrorBanner message={error} /></div>}
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {loading ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-64" />)
        ) : rows.length === 0 ? (
          <Card className="xl:col-span-2">
            <EmptyState icon={<Sword size={30} />} title="No comparison yet" body="Run a scan and every competitor gets a head-to-head result here: where you win, where they win, and by how much." />
          </Card>
        ) : (
          rows.map((c) => {
            const total = c.you_win + c.they_win + c.both || 1;
            const color = brandColor(c.name, false, names);
            return (
              <Card key={c.id} className={cx("flex h-full flex-col", rows.length === 1 && "xl:col-span-2")}>
                <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
                  <BrandTile name={c.name} color={color} size={28} website={c.website} />
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-medium text-ink">{c.name}</h2>
                    <p className="truncate text-[12px] text-muted">{host(c.website)}</p>
                  </div>
                </header>
                <dl className="grid grid-cols-2 divide-x divide-y divide-line border-b border-line sm:grid-cols-4 sm:divide-y-0">
                  {[
                    ["Mentions", pct(c.mention_rate)],
                    ["Recommendations", pct(c.recommendation_rate)],
                    ["Share of voice", pct(c.share_of_voice)],
                    ["Avg. position", pos(c.average_position)],
                  ].map(([label, value]) => (
                    <div key={label} className="px-5 py-3.5">
                      <dt className="truncate text-[12px] text-muted">{label}</dt>
                      <dd className="font-mono text-[20px] tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="border-b border-line px-5 py-4">
                  <div className="flex justify-between text-[12px] text-muted">
                    <span><span className="font-mono font-medium text-ink">{c.you_win}</span> you win</span>
                    <span><span className="font-mono font-medium text-ink">{c.both}</span> both recommended</span>
                    <span><span className="font-mono font-medium text-ink">{c.they_win}</span> {c.name} wins</span>
                  </div>
                  <div className="mt-2 flex h-2 gap-[2px] overflow-hidden rounded-full bg-sunken">
                    <div className="bg-mark-strong" style={{ width: `${(c.you_win / total) * 100}%` }} />
                    <div className="bg-[#bdbdb9]" style={{ width: `${(c.both / total) * 100}%` }} />
                    <div style={{ width: `${(c.they_win / total) * 100}%`, background: color }} />
                  </div>
                </div>
                <div className="grid flex-1 md:grid-cols-2 md:divide-x md:divide-line">
                  <PromptList title="Where you win" tone="win" prompts={c.winning_prompts} />
                  <PromptList title={`Where ${c.name} wins`} tone="lose" prompts={c.losing_prompts} />
                </div>
              </Card>
            );
          })
        )}
      </div>
      <SourcesSection />
    </>
  );
}

export default function CompetitorsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-72" />}>
      <CompetitorsInner />
    </Suspense>
  );
}
