"use client";

import { ArrowRight, CaretDown, Hash, Lightbulb, ListChecks, MagnifyingGlass, PencilSimple, Plus, Prohibit, Sparkle, Trash, Trophy } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import Link from "next/link";
import { GeneratePrompts } from "@/components/app/generate-prompts";
import { askUpgrade, ProBadge, usePro } from "@/components/app/pro-lock";
import { WhyMissing } from "@/components/app/why-missing";
import { useProject } from "@/components/app/project-context";
import { useLatestResults } from "@/components/app/latest-results";
import { ResponseDrawer } from "@/components/app/response-drawer";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, PageHeader, Segmented, Skeleton, StatStrip, VerdictPill, inputClass } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Engine, EngineResult, Opportunity, Prompt } from "@/lib/api/types";
import { CATEGORY_LABELS } from "@/lib/format";
import { cx } from "@/lib/cx";

const VERDICT_TEXT = { recommended: "Recommended", mentioned: "Mentioned, not recommended", absent: "Not mentioned" } as const;

/**
 * One logo per engine this question is asked on. Read-only: a lime ring means that engine recommended you in the
 * latest scan; everything else stays neutral. Hover for the engine's name and result.
 */
function EngineChips({ prompt, projectEngines, result }: { prompt: Prompt; projectEngines: Engine[]; result?: { engines: EngineResult[] } }) {
  const asked = projectEngines.filter((k) => !prompt.engines || prompt.engines.includes(k));
  return (
    <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
      {asked.map((k) => {
        const r = result?.engines.find((e) => e.engine === k);
        const recommended = r?.verdict === "recommended";
        const status = r ? `${VERDICT_TEXT[r.verdict]}${r.position ? ` (#${r.position})` : ""}` : "Not scanned yet";
        return (
          <span key={k} className="group relative" aria-label={`${engineNames[k]}: ${status}`} role="img">
            <span
              className={cx(
                "grid size-8 place-items-center rounded-full border-2 bg-surface transition-colors",
                recommended ? "border-mark-strong bg-mark-soft" : "border-line",
              )}
            >
              <EngineIcon engine={k} size={15} />
            </span>
            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-night px-2 py-1 text-[11px] text-white opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100">
              {engineNames[k]} · {status}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Commercial importance 0-1 as a 1-5 meter: how close the question is to a buying decision. */
function Priority({ value }: { value: number }) {
  const level = Math.min(5, Math.max(1, Math.round(value * 4) + 1));
  return (
    <span className="hidden shrink-0 items-end gap-[2px] md:flex" title={`Priority ${level} of 5: how close this question is to a purchase`} aria-label={`Priority ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cx("w-[3px] rounded-full", i <= level ? "bg-ink" : "bg-line-strong")} style={{ height: 4 + i * 2 }} />
      ))}
    </span>
  );
}

export default function PromptsPage() {
  const { id } = useParams<{ id: string }>();
  const { project } = useProject();
  const pro = usePro();
  // Each question links to the open opportunity that covers it: from "you lose here" straight to the fix.
  const opportunities = useApi<Opportunity[]>(`/projects/${id}/opportunities`);
  const fixFor = useMemo(() => {
    const map = new Map<string, Opportunity>();
    for (const o of opportunities.data ?? []) {
      if (o.trend === "resolved" || o.status === "dismissed") continue;
      for (const q of o.related_prompts) if (!map.has(q.trim().toLowerCase())) map.set(q.trim().toLowerCase(), o);
    }
    return map;
  }, [opportunities.data]);
  const toast = useToast();
  const [generating, setGenerating] = useState(false);
  const { data: prompts, setData: setPrompts, loading, error: loadError } = useApi<Prompt[]>(`/projects/${id}/prompts`);
  const { results, scan } = useLatestResults(id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [open, setOpen] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [response, setResponse] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const byPrompt = useMemo(() => new Map((results?.prompts ?? []).map((r) => [r.prompt_id, r])), [results]);
  // Most commercially important questions first (scored when prompts are generated); unscored keep their order.
  const rows = (prompts ?? [])
    .filter((p) => (category === "ALL" || p.category === category) && p.text.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (b.importance ?? -1) - (a.importance ?? -1));
  const categories = ["ALL", ...new Set((prompts ?? []).map((p) => p.category))];

  async function act<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError("");
    try {
      return await fn();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }
  const replace = (p: Prompt) => setPrompts((all) => (all ?? []).map((x) => (x.id === p.id ? p : x)));

  async function toggle(p: Prompt) {
    const updated = await act(() => api<Prompt>(`/projects/${id}/prompts/${p.id}`, { method: "PATCH", json: { is_active: !p.is_active } }));
    if (updated) replace(updated);
  }
  async function saveText(p: Prompt, text: string) {
    setEditing(null);
    if (text.trim() === p.text) return;
    const updated = await act(() => api<Prompt>(`/projects/${id}/prompts/${p.id}`, { method: "PATCH", json: { text } }));
    if (updated) replace(updated);
  }
  async function remove(p: Prompt) {
    await act(() => api(`/projects/${id}/prompts/${p.id}`, { method: "DELETE" }));
    setPrompts((all) => (all ?? []).filter((x) => x.id !== p.id));
  }
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = String(new FormData(form).get("text") ?? "").trim();
    const created = await act(() => api<Prompt>(`/projects/${id}/prompts`, { method: "POST", json: { text, category: "BUYER_INTENT", intent: "PURCHASE" } }));
    if (created) {
      setPrompts((all) => [...(all ?? []), created]);
      form.reset();
    }
  }
  function added(created: Prompt[], inactive: number) {
    setPrompts((all) => [...(all ?? []), ...created]);
    const off = inactive ? ` ${inactive} switched off: your plan's prompt limit is full.` : "";
    toast.push(`${created.length} prompt${created.length === 1 ? "" : "s"} added.${off}`, "success");
  }

  const activeCount = prompts?.filter((p) => p.is_active).length ?? 0;
  const scanned = results?.prompts ?? [];
  return (
    <>
      <PageHeader
        title="Answers"
        description={`${activeCount} active questions are asked to every engine on each scan. Results show the latest scan${scan ? ` (#${scan.id})` : ""}.`}
        actions={
          <button
            type="button"
            onClick={() => (pro ? setGenerating(true) : askUpgrade("More prompts are on paid plans. Track up to 160 questions, written to your instructions."))}
            className={buttonClass("primary", "sm")}
          >
            <Sparkle size={14} weight="fill" /> Generate more {!pro && <ProBadge />}
          </button>
        }
      />
      <StatStrip
        stats={[
          { label: "Active", value: activeCount, hint: "asked on every scan", icon: <ListChecks size={18} />, tone: "blue" },
          { label: "Total prompts", value: prompts?.length ?? 0, hint: `${(prompts?.length ?? 0) - activeCount} switched off`, icon: <Hash size={18} />, tone: "violet" },
          { label: "Recommend you", value: scanned.filter((p) => p.recommended_on > 0).length, hint: "on at least one engine", icon: <Trophy size={18} />, tone: "green" },
          { label: "Never mention you", value: scanned.filter((p) => p.seen_on === 0).length, hint: "your biggest gaps", icon: <Prohibit size={18} />, tone: "red" },
        ]}
      />
      {(error || loadError) && <div className="mb-4"><ErrorBanner message={error || loadError!.message} /></div>}
      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-3 md:flex-row md:items-center">
          <label className="flex h-9 items-center gap-2 rounded-full border border-line-strong bg-page px-3 md:w-[260px]">
            <MagnifyingGlass size={14} className="text-muted" />
            <span className="sr-only">Search prompts</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search prompts" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none" />
          </label>
          <div className="min-w-0 overflow-x-auto">
            <Segmented
              label="Category"
              value={category}
              onChange={setCategory}
              options={categories.map((c) => ({
                key: c,
                label: c === "ALL" ? "All" : CATEGORY_LABELS[c] ?? c,
                count: c === "ALL" ? prompts?.length : prompts?.filter((p) => p.category === c).length,
              }))}
            />
          </div>
        </div>
        <div className="hidden items-center gap-3 border-b border-line bg-[#fbfbfa] px-4 py-2 text-[11px] font-medium text-muted md:flex">
          <span className="w-9 shrink-0">On</span>
          <span className="min-w-0 flex-1">Question</span>
          <span className="w-[92px] shrink-0 text-center">Type</span>
          <span className="shrink-0 text-center" style={{ width: Math.max(1, project?.engines.length ?? 1) * 38 - 6 }}>AI engines</span>
          <span className="w-10 shrink-0 text-right">Seen</span>
          <span className="w-[62px] shrink-0 text-right">Edit</span>
        </div>
        <div className="hidden flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2 text-[11px] text-muted md:flex">
          <span>Each logo is one AI engine this question is asked on.</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-mark-strong bg-mark-soft" />Recommended you</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-line" />Didn&apos;t recommend you</span>
          <span className="text-faint">Hover a logo for the details. Change engines in Settings.</span>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState title={prompts?.length ? "No prompts match" : "No prompts yet"} body={prompts?.length ? "Try another search or category." : "Generate prompts to start tracking buyer questions."} />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((p) => {
              const result = byPrompt.get(p.id);
              const isOpen = open === p.id;
              return (
                <Fragment key={p.id}>
                  <li className={cx("flex items-center gap-3 px-4 py-2.5", isOpen && "bg-[#fbfbfa]")}>
                    <button type="button" role="switch" aria-checked={p.is_active} aria-label={`Track "${p.text}"`} onClick={() => toggle(p)}
                      className={cx("relative h-5 w-9 shrink-0 rounded-full transition-colors", p.is_active ? "bg-mark ring-1 ring-mark-strong ring-inset" : "bg-[#d9d9d6]")}>
                      <span className={cx("absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left]", p.is_active ? "left-[18px]" : "left-0.5")} />
                    </button>
                    {editing === p.id ? (
                      <input
                        autoFocus
                        defaultValue={p.text}
                        aria-label="Edit prompt"
                        className={cx(inputClass, "h-8")}
                        onBlur={(e) => saveText(p, e.currentTarget.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveText(p, e.currentTarget.value);
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : (
                      <button type="button" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen} disabled={!result}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default">
                        {result && <CaretDown size={12} className={cx("shrink-0 text-faint transition-transform", isOpen && "rotate-180 text-ink")} />}
                        <span className={cx("truncate text-[14px]", !p.is_active && "text-faint")}>{p.text}</span>
                      </button>
                    )}
                    {p.importance != null && <Priority value={p.importance} />}
                    <span className="hidden w-[92px] shrink-0 justify-center md:flex">
                      <span className="truncate rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{CATEGORY_LABELS[p.category] ?? p.category}</span>
                    </span>
                    <EngineChips prompt={p} projectEngines={project?.engines ?? []} result={result} />
                    <span className="hidden w-10 shrink-0 text-right font-mono text-[12px] text-muted sm:block">
                      {result ? `${result.seen_on}/${result.engines.length}` : "-"}
                    </span>
                    <button type="button" onClick={() => setEditing(p.id)} title="Edit the question" className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink" aria-label="Edit prompt">
                      <PencilSimple size={13} />
                    </button>
                    <button type="button" onClick={() => remove(p)} title="Delete the question" className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-sunken hover:text-down" aria-label="Delete prompt">
                      <Trash size={13} />
                    </button>
                  </li>
                  {isOpen && result && (
                    <li className="space-y-3 bg-[#fbfbfa] px-4 pb-4">
                      {(() => {
                        const fix = fixFor.get(p.text.trim().toLowerCase());
                        const weakest = result.engines.find((e) => e.verdict === "absent") ?? result.engines.find((e) => e.verdict === "mentioned");
                        return (
                          (fix || weakest) && (
                            <div className={cx("grid gap-3", fix && weakest && "lg:grid-cols-2")}>
                              {weakest && (
                                <div className="rounded-[12px] border border-line bg-surface p-3.5">
                                  <WhyMissing projectId={id} responseId={weakest.response_id} wide={!fix} />
                                </div>
                              )}
                              {fix && (
                                <Link href={`/projects/${id}/opportunities#opp-${fix.id}`} className="group flex items-start gap-3 rounded-[12px] border border-line bg-surface p-3.5 transition-colors hover:border-line-strong">
                                  <Lightbulb size={16} className="mt-0.5 shrink-0 text-ink" />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[12px] text-muted">The fix for this question</span>
                                    <span className="block text-[13px] font-medium text-ink">{fix.title}</span>
                                    {fix.steps[0] && <span className="mt-0.5 block text-[12px] text-ink-2">{fix.steps[0]}</span>}
                                  </span>
                                  <ArrowRight size={14} className="mt-1 shrink-0 text-faint group-hover:text-ink" />
                                </Link>
                              )}
                            </div>
                          )
                        );
                      })()}
                      <div className="grid gap-2 md:grid-cols-3">
                        {result.engines.map((e) => (
                          <div key={e.engine} className="rounded-[12px] border border-line bg-surface p-3 text-[12px]">
                            <div className="flex items-center gap-2">
                              <EngineIcon engine={e.engine} size={13} />
                              <span className="font-medium">{e.engine_name}</span>
                              <span className="ml-auto"><VerdictPill verdict={e.verdict} position={e.position} /></span>
                            </div>
                            <p className="mt-2 text-muted">
                              Recommends: <span className="text-ink">{e.competitors_recommended.join(", ") || "none of your competitors"}</span>
                            </p>
                            {e.citations.length > 0 && <p className="mt-1 truncate text-muted">Cites: {e.citations.join(", ")}</p>}
                            <button type="button" onClick={() => setResponse(e.response_id)} className="mt-2 font-medium text-ink underline-offset-2 hover:underline">
                              Read the answer
                            </button>
                          </div>
                        ))}
                      </div>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ul>
        )}
        {pro ? (
          <form onSubmit={add} className="flex gap-2 border-t border-line p-3">
            <input name="text" required minLength={8} className={inputClass} placeholder="Add a question your buyers ask AI" aria-label="New prompt" />
            <button type="submit" disabled={busy} className={buttonClass("primary", "sm")}><Plus size={14} weight="bold" /> Add</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => askUpgrade("Adding your own questions is on paid plans.")}
            className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-left text-[13px] text-muted hover:bg-[#fbfbfa]"
          >
            <Plus size={14} weight="bold" /> Add your own questions <ProBadge className="ml-1" />
          </button>
        )}
      </Card>
      <ResponseDrawer projectId={id} responseId={response} onClose={() => setResponse(null)} />
      <GeneratePrompts projectId={id} open={generating} onClose={() => setGenerating(false)} onAdded={added} />
    </>
  );
}
