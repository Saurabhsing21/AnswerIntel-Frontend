"use client";

import { ArrowCounterClockwise, Check, CheckCircle, Flag, Lightbulb, Play, Prohibit, Target, Warning } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useState } from "react";
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
                <div className="h-full rounded-full bg-ink" style={{ width: `${Math.max(2, r.value * 100)}%` }} />
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
            <li key={p} className="rounded-[10px] border border-line bg-surface px-3 py-1.5 text-ink-2">
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

export default function OpportunitiesPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { data, setData, loading, error, reload } = useApi<Opportunity[]>(`/projects/${id}/opportunities`);
  useRefreshOnScan(reload);
  const [view, setView] = useState<"todo" | "completed" | "dismissed">("todo");
  const [area, setArea] = useState<"all" | Area>("all");

  async function setStatus(o: Opportunity, status: Status) {
    try {
      const updated = await api<Opportunity>(`/projects/${id}/opportunities/${o.id}`, { method: "PATCH", json: { status } });
      setData((all) => (all ?? []).map((x) => (x.id === o.id ? updated : x)));
      if (status === "completed") toast.push("Marked as done. Re-scan to see if it moved the numbers.", "success");
    } catch (e) {
      toast.push((e as ApiError).message, "error");
    }
  }

  if (error) return <ErrorBanner message={error.message} />;
  const all = data ?? [];
  const inView = (o: Opportunity) => (view === "todo" ? o.status === "open" || o.status === "in_progress" : o.status === view);
  const todo = all.filter((o) => o.status === "open" || o.status === "in_progress");
  const rows = all.filter((o) => inView(o) && (area === "all" || o.area === area));

  return (
    <>
      <PageHeader title="Opportunities" description="Where AI picks someone else, ranked by impact. Each one shows the evidence and what to do about it." />

      <StatStrip
        stats={[
          { label: "To do", value: todo.length, hint: "open or in progress", icon: <Lightbulb size={18} />, tone: "blue" },
          { label: "High impact", value: todo.filter((o) => o.impact === "high").length, hint: "fix these first", icon: <Flag size={18} />, tone: "red" },
          { label: "In progress", value: all.filter((o) => o.status === "in_progress").length, hint: "you are on it", icon: <Play size={18} />, tone: "amber" },
          { label: "Done", value: all.filter((o) => o.status === "completed").length, hint: "this scan", icon: <CheckCircle size={18} />, tone: "green" },
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
            return (
              <Card key={o.id} className={cx(o.status === "dismissed" && "opacity-70")}>
                <div id={`opp-${o.id}`} className="grid scroll-mt-24 lg:grid-cols-[1.5fr_1fr]">
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cx("grid size-8 place-items-center rounded-[10px]", o.area ? TONE_TILE[AREA_TONE[o.area]] : "bg-sunken text-ink-2")}>
                        <Icon size={16} />
                      </span>
                      <ImpactPill impact={o.impact} />
                      <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{TYPE_LABELS[o.type] ?? o.type}</span>
                      <span className="text-[11px] text-faint">{Math.round(o.confidence * 100)}% confidence</span>
                      {o.status === "in_progress" && <span className="ml-auto rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">In progress</span>}
                    </div>
                    <h2 className="mt-3 text-[16px] font-medium leading-snug text-ink">{o.title}</h2>
                    <p className="mt-1 text-[13px] text-muted">{o.description}</p>

                    <div className="mt-4 rounded-[12px] border border-line bg-[#fafaf9] px-4 py-3 text-[13px]">
                      <p className="flex items-center gap-1.5 font-medium text-ink">
                        <Lightbulb size={14} /> What to do
                      </p>
                      <p className="mt-1 text-ink-2">{o.recommended_action}</p>
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

                    <div className="mt-4 flex flex-wrap gap-2">
                      {o.status === "open" && (
                        <button type="button" onClick={() => setStatus(o, "in_progress")} className={buttonClass("primary", "sm")}>
                          <Play size={14} weight="fill" /> Start
                        </button>
                      )}
                      {o.status === "in_progress" && (
                        <button type="button" onClick={() => setStatus(o, "completed")} className={buttonClass("primary", "sm")}>
                          <Check size={14} weight="bold" /> Mark done
                        </button>
                      )}
                      {(o.status === "open" || o.status === "in_progress") && (
                        <button type="button" onClick={() => setStatus(o, "dismissed")} className={buttonClass("secondary", "sm")}>
                          <Prohibit size={14} /> Dismiss
                        </button>
                      )}
                      {(o.status === "completed" || o.status === "dismissed") && (
                        <button type="button" onClick={() => setStatus(o, "open")} className={buttonClass("secondary", "sm")}>
                          <ArrowCounterClockwise size={14} /> Reopen
                        </button>
                      )}
                    </div>
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
  );
}
