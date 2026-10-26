"use client";

import { ArrowCounterClockwise, ChatCircleText, Check, CheckCircle, CircleNotch, Copy, Flag, Lightbulb, Lock, NotePencil, Play, Prohibit, Target, Warning, X } from "@phosphor-icons/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ExperimentsSection } from "@/components/app/experiments-section";
import { askUpgrade, ProBadge, usePro } from "@/components/app/pro-lock";
import { useRefreshOnScan } from "@/components/app/project-context";
import { AREA_ICON, AREA_LABEL, AREA_TONE } from "@/components/app/overview-cards";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, ImpactPill, PageHeader, Segmented, Skeleton, StatStrip, TONE_TILE } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Opportunity } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { pct } from "@/lib/format";

type Status = Opportunity["status"];
type Area = NonNullable<Opportunity["area"]>;

const AREAS: Area[] = ["content", "third_party", "positioning", "technical"];
const TYPE_LABELS: Record<string, string> = {
  COMPETITOR_GAP: "Competitor gap",
  CITATION_GAP: "Citation gap",
  CONTENT_GAP: "Content gap",
  POSITIONING_GAP: "Positioning gap",
  COMPARISON_GAP: "Comparison gap",
  ENTITY_GAP: "Entity gap",
  TECHNICAL_GAP: "Technical gap",
};

function Evidence({ o }: { o: Opportunity }) {
  const e = o.evidence;
  const prompts = e.prompts ?? [];
  return (
    <div className="space-y-3 text-[12px]">
      <p className="text-[11px] font-medium text-muted">Evidence</p>
      {e.findings?.map((f) => (
        <div key={f.code} className="rounded-[10px] border border-line bg-surface px-3 py-2">
          <p className="flex items-center gap-1.5 font-medium text-ink">
            <Warning size={13} className={f.impact === "high" ? "text-down" : "text-[#a16207]"} />
            {f.message}
          </p>
          <p className="mt-0.5 text-muted">{f.action}</p>
        </div>
      ))}
      {e.discovery_rate != null && e.branded_rate != null && (
        <div className="space-y-2 rounded-[10px] border border-line bg-surface px-3 py-2.5">
          {[
            { label: "Asked by name", value: e.branded_rate },
            { label: "Asked as a category", value: e.discovery_rate },
          ].map((r) => (
            <div key={r.label}>
              <p className="flex justify-between text-muted">
                {r.label}
                <span className="font-mono text-ink">{pct(r.value)}</span>
              </p>
              <div className="mt-1 h-1.5 rounded-full bg-sunken">
                <div className="h-full rounded-full bg-mark-strong" style={{ width: `${Math.max(2, r.value * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {e.domains?.map((d) => (
        <p key={d.domain} className="flex items-center rounded-[10px] border border-line bg-surface px-3 py-2">
          <span className="truncate text-ink">{d.domain}</span>
          <span className="ml-auto pl-3 font-mono text-muted">{d.citations} citations</span>
        </p>
      ))}
      {prompts.length > 0 && (
        <ul className="space-y-1.5">
          {prompts.slice(0, 5).map((p) => (
            <li key={p} className="flex items-start gap-2 rounded-[10px] border border-line bg-surface px-3 py-1.5 text-ink-2">
              <ChatCircleText size={13} className="mt-0.5 shrink-0 text-faint" />
              {p}
            </li>
          ))}
          {prompts.length > 5 && <li className="px-1 text-faint">and {prompts.length - 5} more prompts</li>}
        </ul>
      )}
      {!e.findings?.length && e.discovery_rate == null && !e.domains?.length && !prompts.length && <p className="text-faint">Based on the answers in your latest scan.</p>}
    </div>
  );
}

const TREND: Record<Opportunity["trend"], { label: string; className: string } | null> = {
  new: { label: "New this scan", className: "bg-blue-soft text-blue-ink" },
  open: { label: "Still open", className: "bg-sunken text-ink-2" },
  better: { label: "Getting better", className: "bg-up-soft text-up-ink" },
  worse: { label: "Got worse", className: "bg-down-soft text-down-ink" },
  resolved: { label: "Fixed", className: "bg-up-soft text-up-ink" },
};
const EFFORT: Record<string, string> = { S: "Quick win", M: "A few hours", L: "Bigger project" };

const share = (c: { recommended: number; answers: number }) => `${c.recommended}/${c.answers}`;

/** The proof: recommendations on this opportunity's prompts before the fix and in the re-test. */
function RetestResult({ retest }: { retest: NonNullable<Opportunity["retest"]> }) {
  if (retest.status === "running")
    return (
      <p className="mt-4 flex items-center gap-2 rounded-[12px] border border-line bg-surface px-4 py-3 text-[13px] text-ink-2">
        <CircleNotch size={15} className="animate-spin" /> Re-testing {retest.prompts} prompt{retest.prompts === 1 ? "" : "s"} on every engine...
      </p>
    );
  if (retest.status === "failed" || !retest.after) return <p className="mt-4 text-[13px] text-down">The re-test didn&apos;t complete. Try again.</p>;
  const { before, after } = retest;
  const rate = (c: { recommended: number; answers: number }) => (c.answers ? c.recommended / c.answers : 0);
  const delta = before ? rate(after) - rate(before) : null;
  const tone = delta == null || Math.abs(delta) < 0.05 ? "flat" : delta > 0 ? "up" : "down";
  return (
    <div className={cx("mt-4 rounded-[12px] border px-4 py-3 text-[13px]", tone === "up" ? "border-[#bfe5cc] bg-up-soft" : tone === "down" ? "border-[#f3c4c4] bg-down-soft" : "border-line bg-surface")}>
      <p className="font-medium text-ink">
        {tone === "up" ? "It worked." : tone === "down" ? "Recommendations went down." : "No clear change yet."}{" "}
        <span className="font-normal text-ink-2">
          Recommended in {before ? <span className="font-mono">{share(before)}</span> : "?"} answers before, <span className="font-mono">{share(after)}</span> in the re-test.
        </span>
      </p>
      {tone !== "up" && <p className="mt-1 text-[12px] text-muted">AI engines can take a few weeks to pick up new pages. The weekly scan keeps checking.</p>}
    </div>
  );
}

function OpportunitiesInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const tab = useSearchParams().get("tab") === "tracked" ? "tracked" : "fixes";
  const pro = usePro();
  const toast = useToast();
  // Poll while a re-test runs, so its result appears without a reload.
  const { data, setData, loading, error, reload } = useApi<Opportunity[]>(`/projects/${id}/opportunities`, (rows) =>
    rows?.some((o) => o.retest?.status === "running") ? 3000 : undefined,
  );
  useRefreshOnScan(reload);
  const [view, setView] = useState<"todo" | "completed" | "dismissed" | "fixed">("todo");
  const [area, setArea] = useState<"all" | Area>("all");

  const [draft, setDraft] = useState<{ id: number; markdown: string; generated: boolean } | null>(null);
  const [drafting, setDrafting] = useState<number | null>(null);

  async function makeDraft(o: Opportunity) {
    setDrafting(o.id);
    try {
      const result = await api<{ markdown: string; generated: boolean }>(`/projects/${id}/opportunities/${o.id}/draft`, { method: "POST" });
      setDraft({ id: o.id, ...result });
    } catch (e) {
      if (!(e as ApiError).limit) toast.push((e as ApiError).message, "error");
    } finally {
      setDrafting(null);
    }
  }

  const replace = (updated: Opportunity) => setData((all) => (all ?? []).map((x) => (x.id === updated.id ? updated : x)));

  async function setStatus(o: Opportunity, status: Status) {
    try {
      replace(await api<Opportunity>(`/projects/${id}/opportunities/${o.id}`, { method: "PATCH", json: { status } }));
      if (status === "completed") toast.push("Marked as done. The weekly scan will check whether it's fixed.", "success");
    } catch (e) {
      toast.push((e as ApiError).message, "error");
    }
  }

  /** Start work and freeze today's numbers as an experiment baseline (falls back to just starting on plans without experiments). */
  async function startTracked(o: Opportunity) {
    try {
      replace(await api<Opportunity>(`/projects/${id}/opportunities/${o.id}/experiment`, { method: "POST" }));
      toast.push("Started. Today's numbers are saved as the baseline in Experiments.", "success");
    } catch (e) {
      if ((e as ApiError).limit === "experiments") return setStatus(o, "in_progress");
      toast.push((e as ApiError).message, "error");
    }
  }

  /** Mark done and ask this opportunity's prompts again now, to see if the fix worked. */
  async function doneAndRetest(o: Opportunity) {
    try {
      replace(await api<Opportunity>(`/projects/${id}/opportunities/${o.id}/retest`, { method: "POST" }));
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "NOTHING_TO_RETEST") return setStatus(o, "completed");
      if (!err.limit) toast.push(err.message, "error");
    }
  }

  if (error) return <ErrorBanner message={error.message} />;
  const all = data ?? [];
  const fixed = all.filter((o) => o.trend === "resolved");
  const live = all.filter((o) => o.trend !== "resolved");
  const inView = (o: Opportunity) =>
    view === "fixed" ? o.trend === "resolved" : o.trend !== "resolved" && (view === "todo" ? o.status === "open" || o.status === "in_progress" : o.status === view);
  const todo = live.filter((o) => o.status === "open" || o.status === "in_progress");
  const rows = all.filter((o) => inView(o) && (area === "all" || o.area === area));

  return (
    <>
      <PageHeader title="To-do" description="What to change so AI recommends you, ranked by impact, with the proof once you've done it." />
      <div className="mb-4">
        <Segmented
          label="To-do sections"
          value={tab}
          onChange={(next) => router.replace(`/projects/${id}/opportunities${next === "tracked" ? "?tab=tracked" : ""}`, { scroll: false })}
          options={[
            { key: "fixes", label: "Fixes", count: todo.length },
            { key: "tracked", label: "Tracked fixes" },
          ]}
        />
      </div>
      {tab === "tracked" ? (
        pro ? (
          <ExperimentsSection />
        ) : (
          <Card>
            <EmptyState
              icon={<Lock size={30} />}
              title="Tracked fixes are on paid plans"
              body="Freeze your numbers before a change, then see exactly what moved after the next scan."
              action={<button type="button" onClick={() => askUpgrade("Tracked fixes are on paid plans, from $20 a month.")} className={buttonClass("primary", "sm")}>See plans</button>}
            />
          </Card>
        )
      ) : (
      <>

      <StatStrip
        stats={[
          { label: "To do", value: todo.length, hint: "open or in progress", icon: <Lightbulb size={18} />, tone: "blue" },
          { label: "High impact", value: todo.filter((o) => o.impact === "high").length, hint: "fix these first", icon: <Flag size={18} />, tone: "red" },
          { label: "In progress", value: all.filter((o) => o.status === "in_progress").length, hint: "you are on it", icon: <Play size={18} />, tone: "amber" },
          { label: "Fixed", value: fixed.length, hint: "gone since the last scan", icon: <CheckCircle size={18} />, tone: "green" },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          label="Area"
          value={area}
          onChange={setArea}
          options={[
            { key: "all", label: "All areas", count: todo.length },
            ...AREAS.map((a) => {
              const Icon = AREA_ICON[a];
              return { key: a, label: AREA_LABEL[a], icon: <Icon size={13} />, count: todo.filter((o) => o.area === a).length };
            }),
          ]}
        />
        <div className="ml-auto">
          <Segmented
            label="Status"
            value={view}
            onChange={setView}
            options={[
              { key: "todo", label: "To do" },
              { key: "completed", label: "Done" },
              { key: "fixed", label: "Fixed", count: fixed.length },
              { key: "dismissed", label: "Dismissed" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-52" />)}</div>
      ) : !rows.length ? (
        <Card>
          <EmptyState
            icon={<Lightbulb size={30} />}
            title={all.length ? "Nothing in this view" : "No opportunities yet"}
            body={all.length ? "Try another area or status." : "Run a scan and we will show where AI recommends your competitors instead of you."}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const Icon = o.area ? AREA_ICON[o.area] : Target;
            if (o.locked)
              return (
                <Card key={o.id} className="relative overflow-hidden">
                  <div className="pointer-events-none select-none p-5 blur-[3px]" aria-hidden>
                    <div className="flex items-center gap-2">
                      <span className={cx("grid size-8 place-items-center rounded-[10px]", o.area ? TONE_TILE[AREA_TONE[o.area]] : "bg-sunken text-ink-2")}><Icon size={16} /></span>
                      <ImpactPill impact={o.impact} />
                      <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{TYPE_LABELS[o.type] ?? o.type}</span>
                    </div>
                    <p className="mt-3 h-4 w-2/3 rounded bg-sunken" />
                    <p className="mt-2 h-3 w-1/2 rounded bg-sunken" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-surface/40">
                    <span className="text-[13px] font-medium text-ink">{TYPE_LABELS[o.type] ?? "Fix"} · {o.impact} impact</span>
                    <button type="button" onClick={() => askUpgrade("Every fix, with its steps and evidence, is on paid plans.")} className={buttonClass("primary", "sm")}>
                      <Lock size={13} /> Unlock all fixes
                    </button>
                  </div>
                </Card>
              );
            return (
              <Card key={o.id} className={cx("border-l-[3px]", o.impact === "high" ? "border-l-down" : o.impact === "medium" ? "border-l-amber" : "border-l-line-strong", o.status === "dismissed" && "opacity-70")}>
                <div id={`opp-${o.id}`} className="grid scroll-mt-24 lg:grid-cols-[1.5fr_1fr]">
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cx("grid size-8 place-items-center rounded-[10px]", o.area ? TONE_TILE[AREA_TONE[o.area]] : "bg-sunken text-ink-2")}>
                        <Icon size={16} />
                      </span>
                      <ImpactPill impact={o.impact} />
                      <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{TYPE_LABELS[o.type] ?? o.type}</span>
                      {o.effort && <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-2">{EFFORT[o.effort]}</span>}
                      {TREND[o.trend] && (
                        <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-medium", TREND[o.trend]!.className)}>
                          {TREND[o.trend]!.label}
                          {(o.trend === "better" || o.trend === "worse") && o.previous_count != null && ` (was ${o.previous_count})`}
                        </span>
                      )}
                      {o.status === "in_progress" && <span className="ml-auto rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">In progress{o.experiment_id ? " · tracked" : ""}</span>}
                    </div>
                    <h2 className="mt-3 text-[16px] font-medium leading-snug text-ink">{o.title}</h2>
                    <p className="mt-1 text-[13px] text-muted">{o.description}</p>

                    {draft?.id !== o.id && (
                    <div className="mt-4 rounded-[12px] border border-[#e4efbd] bg-mark-soft/30 px-4 py-3 text-[13px]">
                      <p className="flex items-center gap-1.5 font-medium text-ink">
                        <Lightbulb size={14} /> What to do
                      </p>
                      {o.steps.length ? (
                        <ol className="mt-2 space-y-1.5">
                          {o.steps.map((step, i) => (
                            <li key={step} className="flex gap-2.5 text-ink-2">
                              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-mark font-mono text-[11px] font-medium text-ink">{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="mt-1 text-ink-2">{o.recommended_action}</p>
                      )}
                      {o.expected_objective && (
                        <p className="mt-2.5 flex items-start gap-1.5 text-muted">
                          <Target size={14} className="mt-px shrink-0" />
                          <span>
                            <span className="font-medium text-ink-2">Goal: </span>
                            {o.expected_objective}
                          </span>
                        </p>
                      )}
                    </div>
                    )}
                    {o.retest && <RetestResult retest={o.retest} />}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {o.trend !== "resolved" && o.status === "open" && (
                        <button
                          type="button"
                          onClick={() => (pro ? startTracked(o) : setStatus(o, "in_progress"))}
                          className={buttonClass("primary", "sm")}
                          title={pro ? "Saves today's numbers as a baseline, so you can prove the result later" : undefined}
                        >
                          <Play size={14} weight="fill" /> {pro ? "Start and track" : "Start"}
                        </button>
                      )}
                      {o.trend !== "resolved" && o.status === "in_progress" && (
                        <>
                          <button type="button" onClick={() => (pro || !o.related_prompts.length ? doneAndRetest(o) : askUpgrade("Re-testing a fix right away is on paid plans."))} disabled={o.retest?.status === "running"} className={buttonClass("primary", "sm")}
                            title={o.related_prompts.length ? `Asks these ${o.related_prompts.length} prompts again now` : undefined}>
                            <Check size={14} weight="bold" /> {o.related_prompts.length ? `Done, re-test ${o.related_prompts.length} prompts` : "Mark done"} {!pro && o.related_prompts.length > 0 && <ProBadge />}
                          </button>
                          {o.related_prompts.length > 0 && (
                            <button type="button" onClick={() => setStatus(o, "completed")} className={buttonClass("secondary", "sm")}>
                              Just mark done
                            </button>
                          )}
                        </>
                      )}
                      {(o.status === "open" || o.status === "in_progress") && (
                        <button type="button" onClick={() => setStatus(o, "dismissed")} className={buttonClass("secondary", "sm")}>
                          <Prohibit size={14} /> Dismiss
                        </button>
                      )}
                      {o.trend !== "resolved" && o.status === "completed" && o.related_prompts.length > 0 && o.retest?.status !== "running" && (
                        <button type="button" onClick={() => doneAndRetest(o)} className={buttonClass("secondary", "sm")}>
                          <ArrowCounterClockwise size={14} /> Re-test again
                        </button>
                      )}
                      {o.trend !== "resolved" && (o.status === "completed" || o.status === "dismissed") && (
                        <button type="button" onClick={() => setStatus(o, "open")} className={buttonClass("secondary", "sm")}>
                          <ArrowCounterClockwise size={14} /> Reopen
                        </button>
                      )}
                      {o.status !== "dismissed" && (
                        <button type="button" onClick={() => (pro ? makeDraft(o) : askUpgrade("Drafts of the page or pitch for each fix are on paid plans."))} disabled={drafting !== null} className={buttonClass("secondary", "sm")}>
                          {drafting === o.id ? <CircleNotch size={14} className="animate-spin" /> : <NotePencil size={14} />} Draft this {!pro && <ProBadge />}
                        </button>
                      )}
                    </div>
                    {draft?.id === o.id && (
                      <div className="mt-4 overflow-hidden rounded-[12px] border border-line-strong">
                        <div className="flex items-center gap-2 border-b border-line bg-[#fafaf9] px-3.5 py-2 text-[12px] text-muted">
                          {draft.generated ? "First draft, written by AI. Fill in the [placeholders] and edit before publishing." : "Outline to fill in (connect an AI key for full drafts)."}
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(draft.markdown).then(() => toast.push("Draft copied.", "success"))}
                            className="ml-auto inline-flex items-center gap-1 font-medium text-ink hover:underline"
                          >
                            <Copy size={13} /> Copy
                          </button>
                          <button type="button" onClick={() => setDraft(null)} aria-label="Close draft" className="grid size-6 place-items-center rounded-full hover:bg-sunken">
                            <X size={12} />
                          </button>
                        </div>
                        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap px-4 py-3 font-sans text-[13px] leading-relaxed text-ink-2">{draft.markdown}</pre>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-line bg-[#fafaf9] p-5 lg:border-t-0 lg:border-l">
                    <Evidence o={o} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      </>
      )}
    </>
  );
}

export default function OpportunitiesPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<Skeleton className="h-72" />}>
      <OpportunitiesInner />
    </Suspense>
  );
}
