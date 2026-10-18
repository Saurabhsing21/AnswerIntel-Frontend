"use client";

import { CheckCircle, Crosshair, Plus, Sword, Trash, Trophy, UsersThree, XCircle } from "@phosphor-icons/react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandTile } from "@/components/app/brand-tile";
import { useRefreshOnScan } from "@/components/app/project-context";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, Field, inputClass, PageHeader, Skeleton, StatStrip } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Competitor, CompetitorAnalysis } from "@/lib/api/types";
import { brandColor } from "@/lib/brand";
import { pct, pos } from "@/lib/format";

const MAX = 5;
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
  const threat = [...rows].sort((a, b) => b.they_win - a.they_win)[0];
  const maxLoss = Math.max(1, ...rows.map((c) => c.they_win));

  return (
    <>
      <PageHeader title="Competitors" description="Where each rival beats you, and on which prompts. New competitors are measured from the next scan." />

      <StatStrip
        stats={[
          { label: "Tracked", value: `${competitors?.length ?? 0}/${MAX}`, hint: "brands you compare against", icon: <UsersThree size={18} />, tone: "blue" },
          { label: "Prompts you win", value: wins, hint: "you are recommended, they are not", icon: <Trophy size={18} />, tone: "green" },
          { label: "Prompts you lose", value: losses, hint: "they are recommended, you are not", icon: <Sword size={18} />, tone: "red" },
          { label: "Biggest threat", value: threat && threat.they_win > 0 ? threat.name : "None", hint: threat && threat.they_win > 0 ? `wins ${threat.they_win} prompts` : "nobody is ahead of you", icon: <Crosshair size={18} />, tone: "amber" },
        ]}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {loading ? (
            [0, 1].map((i) => <Skeleton key={i} className="h-64" />)
          ) : rows.length === 0 ? (
            <Card>
              <EmptyState icon={<Sword size={30} />} title="No comparison yet" body="Run a scan and every competitor gets a head-to-head result here: where you win, where they win, and by how much." />
            </Card>
          ) : (
            rows.map((c) => {
              const total = c.you_win + c.they_win + c.both || 1;
              const color = brandColor(c.name, false, names);
              return (
                <Card key={c.id}>
                  <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
                    <BrandTile name={c.name} color={color} size={28} />
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
                        <dt className="text-[12px] text-muted">{label}</dt>
                        <dd className="font-mono text-[20px] tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="border-b border-line px-5 py-4">
                    <div className="flex justify-between text-[12px] text-muted">
                      <span>
                        <span className="font-mono font-medium text-ink">{c.you_win}</span> you win
                      </span>
                      <span>
                        <span className="font-mono font-medium text-ink">{c.both}</span> both recommended
                      </span>
                      <span>
                        <span className="font-mono font-medium text-ink">{c.they_win}</span> {c.name} wins
                      </span>
                    </div>
                    <div className="mt-2 flex h-2 gap-[2px] overflow-hidden rounded-full bg-sunken">
                      <div className="bg-ink" style={{ width: `${(c.you_win / total) * 100}%` }} />
                      <div className="bg-[#bdbdb9]" style={{ width: `${(c.both / total) * 100}%` }} />
                      <div style={{ width: `${(c.they_win / total) * 100}%`, background: color }} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 md:divide-x md:divide-line">
                    <PromptList title="Where you win" tone="win" prompts={c.winning_prompts} />
                    <PromptList title={`Where ${c.name} wins`} tone="lose" prompts={c.losing_prompts} />
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-[76px]">
          <Card title="Tracked competitors" subtitle={`${competitors?.length ?? 0} of ${MAX}`}>
            <ul className="divide-y divide-line">
              {(competitors ?? []).map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-2.5">
                  <BrandTile name={c.name} color={brandColor(c.name, false, names)} size={24} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{c.name}</span>
                    <span className="block truncate text-[11px] text-muted">{host(c.website)}</span>
                  </span>
                  <button type="button" onClick={() => remove(c)} aria-label={`Remove ${c.name}`} className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-down">
                    <Trash size={14} />
                  </button>
                </li>
              ))}
            </ul>
            {(competitors?.length ?? 0) < MAX ? (
              <form onSubmit={add} className="space-y-3 border-t border-line p-5">
                <Field label="Name">
                  <input name="name" required autoFocus={params.get("add") === "1"} className={inputClass} placeholder="Competitor" />
                </Field>
                <Field label="Website">
                  <input name="website" required className={inputClass} placeholder="competitor.com" />
                </Field>
                {error && <ErrorBanner message={error} />}
                <button type="submit" disabled={busy} className={buttonClass("primary", "sm")}>
                  <Plus size={14} weight="bold" /> Add competitor
                </button>
              </form>
            ) : (
              <p className="border-t border-line px-5 py-3 text-[12px] text-muted">You are tracking the maximum of {MAX}. Remove one to add another.</p>
            )}
          </Card>

          {rows.length > 0 && (
            <Card title="Threat ranking" subtitle="Prompts each rival wins">
              <ul className="space-y-3 p-5">
                {[...rows]
                  .sort((a, b) => b.they_win - a.they_win)
                  .map((c) => (
                    <li key={c.id} className="grid grid-cols-[80px_1fr_28px] items-center gap-3 text-[12px]">
                      <span className="truncate text-ink-2">{c.name}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-sunken">
                        <span className="block h-full rounded-full" style={{ width: `${Math.max(3, (c.they_win / maxLoss) * 100)}%`, background: brandColor(c.name, false, names) }} />
                      </span>
                      <span className="text-right font-mono tabular-nums text-ink">{c.they_win}</span>
                    </li>
                  ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
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
