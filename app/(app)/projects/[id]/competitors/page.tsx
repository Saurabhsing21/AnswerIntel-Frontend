"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, EmptyState, ErrorBanner, Field, PageHeader, Skeleton, inputClass } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Competitor, CompetitorAnalysis } from "@/lib/api/types";
import { pct, pos } from "@/lib/format";

export default function CompetitorsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: competitors, setData: setCompetitors } = useApi<Competitor[]>(`/projects/${id}/competitors`);
  const { data: analysis, loading } = useApi<CompetitorAnalysis>(`/projects/${id}/competitors/analysis`);
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
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  return (
    <>
      <PageHeader title="Competitors" description="Where each rival beats you, and on which prompts. New competitors are measured from the next scan." />
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {loading ? (
            [0, 1].map((i) => <Skeleton key={i} className="h-48" />)
          ) : !analysis?.competitors.length || analysis.scan_id == null ? (
            <Card><EmptyState title="No comparison yet" body="Run a scan to see head-to-head results." /></Card>
          ) : (
            analysis.competitors.map((c) => {
              const total = c.you_win + c.they_win + c.both || 1;
              return (
                <Card key={c.id} title={c.name} subtitle={c.website.replace(/^https?:\/\//, "")}>
                  <div className="grid grid-cols-2 gap-4 border-b border-line p-5 sm:grid-cols-4">
                    {[
                      ["Mentions", pct(c.mention_rate)],
                      ["Recommendations", pct(c.recommendation_rate)],
                      ["Share of voice", pct(c.share_of_voice)],
                      ["Avg. position", pos(c.average_position)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[12px] text-muted">{label}</p>
                        <p className="font-mono text-[20px] tabular-nums">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between text-[12px]">
                      <span><span className="font-mono font-medium">{c.you_win}</span> prompts you win</span>
                      <span><span className="font-mono font-medium">{c.they_win}</span> prompts {c.name} wins</span>
                    </div>
                    <div className="mt-2 flex h-2 gap-[2px] overflow-hidden rounded-full">
                      <div className="bg-ink" style={{ width: `${(c.you_win / total) * 100}%` }} />
                      <div className="bg-[#bdbdb9]" style={{ width: `${(c.both / total) * 100}%` }} />
                      <div className="bg-[#e6e6e3]" style={{ width: `${(c.they_win / total) * 100}%` }} />
                    </div>
                    {c.losing_prompts.length > 0 && (
                      <>
                        <p className="mt-4 text-[12px] text-muted">Prompts where {c.name} is recommended and you are not</p>
                        <ul className="mt-2 space-y-1.5">
                          {c.losing_prompts.slice(0, 5).map((p) => (
                            <li key={p} className="rounded-[10px] bg-page px-3 py-2 text-[13px]">{p}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Card title="Tracked competitors" subtitle={`${competitors?.length ?? 0}/5`} className="self-start">
          <ul className="divide-y divide-line">
            {competitors?.map((c) => (
              <li key={c.id} className="flex items-center gap-2 px-5 py-2.5 text-[13px]">
                <span className="min-w-0">
                  <span className="block font-medium">{c.name}</span>
                  <span className="block truncate text-[12px] text-muted">{c.website.replace(/^https?:\/\//, "")}</span>
                </span>
                <button type="button" onClick={() => remove(c)} aria-label={`Remove ${c.name}`} className="ml-auto grid size-7 place-items-center rounded-full text-muted hover:bg-sunken hover:text-down">
                  <Trash size={13} />
                </button>
              </li>
            ))}
          </ul>
          {(competitors?.length ?? 0) < 5 && (
            <form onSubmit={add} className="space-y-3 border-t border-line p-5">
              <Field label="Name"><input name="name" required className={inputClass} placeholder="Competitor" /></Field>
              <Field label="Website"><input name="website" required className={inputClass} placeholder="competitor.com" /></Field>
              <button type="submit" disabled={busy} className={buttonClass("secondary", "sm")}><Plus size={14} weight="bold" /> Add competitor</button>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}
