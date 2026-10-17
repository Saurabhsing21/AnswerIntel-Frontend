"use client";

import { CaretDown, Hash, ListChecks, MagnifyingGlass, PencilSimple, Plus, Prohibit, Sparkle, Trash, Trophy } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { EngineIcon } from "@/components/product/engine-icon";
import { useLatestResults } from "@/components/app/latest-results";
import { ResponseDrawer } from "@/components/app/response-drawer";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, PageHeader, Segmented, Skeleton, StatStrip, VerdictPill, inputClass } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { EngineResult, Prompt } from "@/lib/api/types";
import { CATEGORY_LABELS } from "@/lib/format";
import { cx } from "@/lib/cx";

function Cell({ result }: { result?: EngineResult }) {
  if (!result) return <span className="size-6 rounded-[6px] border border-dashed border-line-strong" aria-label="Not scanned" />;
  return (
    <span
      title={`${result.engine_name}: ${result.verdict}${result.position ? ` #${result.position}` : ""}`}
      className={cx(
        "grid size-6 place-items-center rounded-[6px]",
        result.verdict === "recommended" && "bg-ink text-white",
        result.verdict === "mentioned" && "bg-[#d9d9d6] text-ink",
        result.verdict === "absent" && "border border-line-strong text-faint",
      )}
    >
      <EngineIcon engine={result.engine} size={11} mono />
    </span>
  );
}

export default function PromptsPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
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
  const engines = useMemo(() => [...new Map((results?.prompts ?? []).flatMap((p) => p.engines.map((e) => [e.engine, e.engine_name]))).entries()], [results]);
  const rows = (prompts ?? []).filter(
    (p) => (category === "ALL" || p.category === category) && p.text.toLowerCase().includes(query.trim().toLowerCase()),
  );
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
  async function generate() {
    const result = await act(() => api<{ prompts: Prompt[]; created: number }>(`/projects/${id}/prompts/generate`, { method: "POST" }));
    if (result) {
      setPrompts(result.prompts);
      toast.push(result.created ? `${result.created} new prompts added.` : "No new prompts to add. You already cover the ground.", "success");
    }
  }

  const activeCount = prompts?.filter((p) => p.is_active).length ?? 0;
  const scanned = results?.prompts ?? [];
  return (
    <>
      <PageHeader
        title="Prompts"
        description={`${activeCount} active questions are asked to every engine on each scan. Results show the latest scan${scan ? ` (#${scan.id})` : ""}.`}
        actions={
          <button type="button" onClick={generate} disabled={busy} className={buttonClass("primary", "sm")}>
            <Sparkle size={14} weight="fill" /> Generate more
          </button>
        }
      />
      <StatStrip
        stats={[
          { label: "Active", value: activeCount, hint: "asked on every scan", icon: <ListChecks size={18} /> },
          { label: "Total prompts", value: prompts?.length ?? 0, hint: `${(prompts?.length ?? 0) - activeCount} switched off`, icon: <Hash size={18} /> },
          { label: "Recommend you", value: scanned.filter((p) => p.recommended_on > 0).length, hint: "on at least one engine", icon: <Trophy size={18} /> },
          { label: "Never mention you", value: scanned.filter((p) => p.seen_on === 0).length, hint: "your biggest gaps", icon: <Prohibit size={18} /> },
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
        {engines.length > 0 && (
          <div className="hidden items-center gap-4 border-b border-line px-4 py-2 text-[11px] text-muted md:flex">
            <span>Latest scan, per engine:</span>
              <span className="flex items-center gap-1"><span className="size-3 rounded-[3px] bg-ink" />Recommended</span>
              <span className="flex items-center gap-1"><span className="size-3 rounded-[3px] bg-[#d9d9d6]" />Mentioned</span>
              <span className="flex items-center gap-1"><span className="size-3 rounded-[3px] border border-line-strong" />Absent</span>
          </div>
        )}

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
                      className={cx("relative h-5 w-9 shrink-0 rounded-full transition-colors", p.is_active ? "bg-ink" : "bg-[#d9d9d6]")}>
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
                    <span className="hidden shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2 md:inline">{CATEGORY_LABELS[p.category] ?? p.category}</span>
                    <span className="hidden shrink-0 gap-1 sm:flex">
                      {engines.map(([key]) => <Cell key={key} result={result?.engines.find((e) => e.engine === key)} />)}
                    </span>
                    <span className="hidden w-10 shrink-0 text-right font-mono text-[12px] text-muted sm:block">
                      {result ? `${result.seen_on}/${result.engines.length}` : "-"}
                    </span>
                    <button type="button" onClick={() => setEditing(p.id)} className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink" aria-label="Edit prompt">
                      <PencilSimple size={13} />
                    </button>
                    <button type="button" onClick={() => remove(p)} className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-sunken hover:text-down" aria-label="Delete prompt">
                      <Trash size={13} />
                    </button>
                  </li>
                  {isOpen && result && (
                    <li className="bg-[#fbfbfa] px-4 pb-4">
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
        <form onSubmit={add} className="flex gap-2 border-t border-line p-3">
          <input name="text" required minLength={8} className={inputClass} placeholder="Add a question your buyers ask AI" aria-label="New prompt" />
          <button type="submit" disabled={busy} className={buttonClass("primary", "sm")}><Plus size={14} weight="bold" /> Add</button>
        </form>
      </Card>
      <ResponseDrawer projectId={id} responseId={response} onClose={() => setResponse(null)} />
    </>
  );
}
