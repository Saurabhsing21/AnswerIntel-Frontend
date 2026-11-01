"use client";

import { ArrowCounterClockwise, CaretDown, ChatCircleText, Check, CheckCircle, CircleNotch, Copy, Flag, Lightbulb, Lock, NotePencil, Play, Plus, Prohibit, Quotes, Target, Trophy, Warning, X } from "@phosphor-icons/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ExperimentsSection } from "@/components/app/experiments-section";
import { askUpgrade, ProBadge, usePro, useTracked } from "@/components/app/pro-lock";
import { useRefreshOnScan } from "@/components/app/project-context";
import { AREA_ICON, AREA_LABEL, AREA_TONE } from "@/components/app/overview-cards";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, ImpactPill, PageHeader, Segmented, Skeleton, StatStrip, TONE_TILE } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { LostQuestion, Opportunity, OpportunityList, PlanStatus } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { pct, plainQuote } from "@/lib/format";

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

/** Whether the side column has anything to show (question gaps put their detail in the main column). */
const hasEvidence = (o: Opportunity) => {
  const e = o.evidence;
  return Boolean(e.findings?.length || e.discovery_rate != null || e.domains?.length || (!o.questions.length && e.prompts?.length));
};

function Evidence({ o }: { o: Opportunity }) {
  const e = o.evidence;
  // Question gaps list their questions in the main column; older rows only carry the plain list.
  const prompts = o.questions.length ? [] : e.prompts ?? [];
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
          {prompts.length > 5 && <li className="px-1 text-faint">and {prompts.length - 5} more questions</li>}
        </ul>
      )}
      {!hasEvidence(o) && <p className="text-faint">Based on the answers in your latest scan.</p>}
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

/** Tone for the headline: leading is calm green, behind is a warning. */
function StatusHeadline({ status }: { status: PlanStatus }) {
  const stats = [
    { label: "AI names you", value: pct(status.mention_rate) },
    { label: "Your rank", value: `#${status.rank}` },
    { label: "Answers lost", value: `${status.answers_lost} of ${status.answers_total}` },
  ];
  return (
    <section className={cx("mb-4 rounded-[16px] border p-5", status.leading ? "border-[#bfe5cc] bg-up-soft" : "border-[#f3c4c4] bg-down-soft")}>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        <p className="flex min-w-0 flex-1 basis-80 items-start gap-2.5 text-[15px] font-medium leading-snug text-ink">
          {status.leading ? <Trophy size={20} weight="fill" className="mt-0.5 shrink-0 text-up-ink" /> : <Warning size={20} weight="fill" className="mt-0.5 shrink-0 text-down-ink" />}
          {status.headline}
        </p>
        <dl className="flex gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-[11px] text-muted">{s.label}</dt>
              <dd className="mt-0.5 font-mono text-[18px] font-medium text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** One lost question: how many engines picked someone else, who won, and why in the engine's own words. */
function QuestionRow({ q }: { q: LostQuestion }) {
  return (
    <li className="rounded-[12px] border border-line bg-surface px-3.5 py-3">
      <div className="flex items-start gap-2">
        <ChatCircleText size={14} className="mt-0.5 shrink-0 text-faint" />
        <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-ink">{q.text}</p>
        <span className="shrink-0 rounded-full bg-down-soft px-2 py-0.5 font-mono text-[11px] text-down-ink" title="Engines that did not recommend you">
          lost {q.engines_lost}/{q.engines_total}
        </span>
      </div>
      {q.winners.length > 0 && (
        <ul className="mt-2.5 space-y-2 border-l-2 border-line pl-3">
          {q.winners.map((w) => (
            <li key={w.name} className="text-[12px]">
              <p className="text-ink-2">
                <span className="font-medium text-ink">{w.name}</span> <span className="text-faint">· {w.engines} of {q.engines_total} engines</span>
                {w.reason && <span> · {w.reason}</span>}
              </p>
              {w.quote && (
                <p className="mt-0.5 flex items-start gap-1 italic text-muted">
                  <Quotes size={11} weight="fill" className="mt-0.5 shrink-0 text-faint" />
                  {plainQuote(w.quote)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      {q.cited_domains.length > 0 && (
        <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-faint">
          AI cited
          {q.cited_domains.map((d) => (
            <span key={d} className="rounded-full bg-sunken px-2 py-0.5 text-ink-2">{d}</span>
          ))}
        </p>
      )}
    </li>
  );
}

const SHOWN_QUESTIONS = 2;

/** First two questions, the rest behind a toggle so long gaps stay scannable. */
function QuestionList({ questions, label }: { questions: LostQuestion[]; label: string }) {
  const [all, setAll] = useState(false);
  const rest = questions.length - SHOWN_QUESTIONS;
  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] font-medium text-muted">{label}</p>
      <ul className="space-y-2">
        {(all ? questions : questions.slice(0, SHOWN_QUESTIONS)).map((q) => (
          <QuestionRow key={q.text} q={q} />
        ))}
      </ul>
      {rest > 0 && (
        <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-ink-2 hover:text-ink">
          <CaretDown size={12} className={cx("transition-transform", all && "rotate-180")} />
          {all ? "Show fewer" : `Show ${rest} more question${rest === 1 ? "" : "s"}`}
        </button>
      )}
    </div>
  );
}

/** Brands AI names that are not tracked yet. Competitors need a website, so the button asks for it first. */
function UntrackedBrands({ o, projectId, onAdded }: { o: Opportunity; projectId: string; onAdded: () => void }) {
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const brands = o.evidence.brands ?? [];

  async function add(name: string) {
    let site = website.trim();
    if (!site) return;
    if (!/^https?:\/\//.test(site)) site = `https://${site}`;
    setBusy(true);
    try {
      await api(`/projects/${projectId}/competitors`, { method: "POST", json: { name, website: site } });
      toast.push(`${name} added. It is measured from your next scan.`, "success");
      setOpen(null);
      setWebsite("");
      onAdded();
    } catch (e) {
      if (!(e as ApiError).limit) toast.push((e as ApiError).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ul className="mt-4 divide-y divide-line rounded-[12px] border border-line bg-surface">
      {brands.map((b) => (
        <li key={b.name} className="px-3.5 py-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink">{b.name}</p>
              <p className="text-[12px] text-muted">Named in {b.answers} answer{b.answers === 1 ? "" : "s"}</p>
            </div>
            <button type="button" onClick={() => { setOpen(open === b.name ? null : b.name); setWebsite(""); }} className={buttonClass("secondary", "sm")}>
              <Plus size={14} /> Add as competitor
            </button>
          </div>
          {b.questions.length > 0 && (
            <ul className="mt-2 space-y-1 text-[12px] text-ink-2">
              {b.questions.map((q) => (
                <li key={q} className="flex items-start gap-1.5"><ChatCircleText size={12} className="mt-0.5 shrink-0 text-faint" />{q}</li>
              ))}
            </ul>
          )}
          {open === b.name && (
            <form onSubmit={(e) => { e.preventDefault(); add(b.name); }} className="mt-3 flex gap-2">
              <input value={website} onChange={(e) => setWebsite(e.target.value)} autoFocus placeholder={`${b.name} website, e.g. example.com`} aria-label={`${b.name} website`} className="min-w-0 flex-1 rounded-[10px] border border-line-strong bg-surface px-3 py-1.5 text-[13px] outline-none focus:border-ink" />
              <button type="submit" disabled={busy || !website.trim()} className={buttonClass("primary", "sm")}>
                {busy ? <CircleNotch size={14} className="animate-spin" /> : "Add"}
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}

/** The proof: recommendations on this opportunity's questions before the fix and in the re-test. */
function RetestResult({ retest }: { retest: NonNullable<Opportunity["retest"]> }) {
  if (retest.status === "running")
    return (
      <p className="mt-4 flex items-center gap-2 rounded-[12px] border border-line bg-surface px-4 py-3 text-[13px] text-ink-2">
        <CircleNotch size={15} className="animate-spin" /> Re-testing {retest.prompts} question{retest.prompts === 1 ? "" : "s"} on every engine...
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
  const tracked = useTracked(); // tracked fixes start on Growth
  const toast = useToast();
  // Poll while a re-test runs, so its result appears without a reload.
  const { data, setData, loading, error, reload } = useApi<OpportunityList>(`/projects/${id}/opportunities?with_status=true`, (d) =>
    d?.items.some((o) => o.retest?.status === "running") ? 3000 : undefined,
  );
  useRefreshOnScan(reload);
  const [view, setView] = useState<"todo" | "completed" | "dismissed" | "fixed">("todo");
  const [area, setArea] = useState<"all" | Area>("all");

  const [draft, setDraft] = useState<{ id: number; markdown: string } | null>(null);
  const [drafting, setDrafting] = useState<number | null>(null);

  async function makeDraft(o: Opportunity) {
    setDrafting(o.id);
    try {
      const result = await api<{ markdown: string }>(`/projects/${id}/opportunities/${o.id}/draft`, { method: "POST" });
      setDraft({ id: o.id, ...result });
    } catch (e) {
      if (!(e as ApiError).limit) toast.push((e as ApiError).message, "error");
    } finally {
      setDrafting(null);
    }
  }

  const replace = (updated: Opportunity) => setData((d) => (d ? { ...d, items: d.items.map((x) => (x.id === updated.id ? updated : x)) } : d));

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

  /** Mark done and ask this opportunity's questions again now, to see if the fix worked. */
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
  const all = data?.items ?? [];
  const status = data?.status ?? null;
  const fixed = all.filter((o) => o.trend === "resolved");
  const live = all.filter((o) => o.trend !== "resolved");
  const inView = (o: Opportunity) =>
    view === "fixed" ? o.trend === "resolved" : o.trend !== "resolved" && (view === "todo" ? o.status === "open" || o.status === "in_progress" : o.status === view);
  const todo = live.filter((o) => o.status === "open" || o.status === "in_progress");
  const rows = all.filter((o) => inView(o) && (area === "all" || o.area === area));

  return (
    <>
      <PageHeader title="Action plan" description="What to change so AI recommends you, ranked by impact, with the proof once you've done it." />
      <div className="mb-4">
        <Segmented
          label="Action plan sections"
          value={tab}
          onChange={(next) => router.replace(`/projects/${id}/opportunities${next === "tracked" ? "?tab=tracked" : ""}`, { scroll: false })}
          options={[
            { key: "fixes", label: "Fixes", count: todo.length },
            { key: "tracked", label: "Tracked fixes" },
          ]}
        />
      </div>
      {tab === "tracked" ? (
        tracked ? (
          <ExperimentsSection />
        ) : (
          <Card>
            <EmptyState
              icon={<Lock size={30} />}
              title="Tracked fixes are on Growth and Pro"
              body="Freeze your numbers before a change, then see exactly what moved after the next scan."
              action={<button type="button" onClick={() => askUpgrade("Tracked fixes are on Growth and Pro, from $50 a month.", pro ? "experiments" : "pro")} className={buttonClass("primary", "sm")}>See plans</button>}
            />
          </Card>
        )
      ) : (
      <>

      {status && <StatusHeadline status={status} />}

      <StatStrip
        stats={[
          { label: "Open", value: todo.length, hint: "open or in progress", icon: <Lightbulb size={18} />, tone: "blue" },
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
              { key: "todo", label: "Open" },
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
                <div id={`opp-${o.id}`} className={cx("grid scroll-mt-24", hasEvidence(o) && "lg:grid-cols-[1.5fr_1fr]")}>
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

                    {o.why.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-1.5 text-[11px] font-medium text-muted">Why AI picks others</p>
                        <ul className="space-y-1.5 text-[13px] text-ink-2">
                          {o.why.map((w) => (
                            <li key={w} className="flex gap-2">
                              <span className="mt-[7px] size-1 shrink-0 rounded-full bg-faint" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {o.type === "UNTRACKED_COMPETITOR" ? (
                      <UntrackedBrands o={o} projectId={id} onAdded={reload} />
                    ) : (
                      o.questions.length > 0 && <QuestionList questions={o.questions} label={`Questions you lost (${o.questions.length})`} />
                    )}

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
                      {(o.success_metric || o.expected_objective) && (
                        <p className="mt-2.5 flex items-start gap-1.5 text-muted">
                          <Target size={14} className="mt-px shrink-0" />
                          <span>
                            <span className="font-medium text-ink-2">{o.success_metric ? "How to know it worked: " : "Goal: "}</span>
                            {o.success_metric ?? o.expected_objective}
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
                          onClick={() => (tracked ? startTracked(o) : setStatus(o, "in_progress"))}
                          className={buttonClass("primary", "sm")}
                          title={tracked ? "Saves today's numbers as a baseline, so you can prove the result later" : undefined}
                        >
                          <Play size={14} weight="fill" /> {tracked ? "Start and track" : "Start"}
                        </button>
                      )}
                      {o.trend !== "resolved" && o.status === "in_progress" && (
                        <>
                          <button type="button" onClick={() => (pro || !o.related_prompts.length ? doneAndRetest(o) : askUpgrade("Re-testing a fix right away is on paid plans."))} disabled={o.retest?.status === "running"} className={buttonClass("primary", "sm")}
                            title={o.related_prompts.length ? `Asks these ${o.related_prompts.length} questions again now` : undefined}>
                            <Check size={14} weight="bold" /> {o.related_prompts.length ? `Done, re-test ${o.related_prompts.length} questions` : "Mark done"} {!pro && o.related_prompts.length > 0 && <ProBadge />}
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
                          First draft, written by AI. Fill in the [placeholders] and edit before publishing.
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
                  {hasEvidence(o) && (
                    <div className="border-t border-line bg-[#fafaf9] p-5 lg:border-t-0 lg:border-l">
                      <Evidence o={o} />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "fixes" && view === "todo" && status && status.switching.length > 0 && (
        <Card
          className="mt-6"
          title="Where your customers would switch"
          subtitle="When buyers ask AI for alternatives to you, these are the brands it names. You can't win these questions, but you can see who is waiting."
        >
          <ul className="space-y-2 p-5">
            {status.switching.map((q) => (
              <QuestionRow key={q.text} q={q} />
            ))}
          </ul>
        </Card>
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
