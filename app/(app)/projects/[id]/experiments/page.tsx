"use client";

import { ArrowDownRight, ArrowRight, ArrowsClockwise, ArrowUpRight, Check, CircleNotch, FloppyDisk, Flask, Minus, Plus, Rocket } from "@phosphor-icons/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { isScanActive, useProject, useRefreshOnScan } from "@/components/app/project-context";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, Field, inputClass, PageHeader, Segmented, Skeleton, StatStrip } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Experiment } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { pct, pos } from "@/lib/format";

const METRICS = [
  { key: "mention_rate", label: "Mentions" },
  { key: "recommendation_rate", label: "Recommendations" },
  { key: "share_of_voice", label: "Share of voice" },
] as const;

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function ChangeBadge({ delta, lowerIsBetter }: { delta: number | null; lowerIsBetter?: boolean }) {
  if (delta == null) return <span className="text-faint">-</span>;
  if (delta === 0) return <span className="inline-flex items-center gap-1 font-mono text-[12px] text-faint"><Minus size={11} /> no change</span>;
  const good = lowerIsBetter ? delta < 0 : delta > 0;
  const Icon = delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cx("inline-flex items-center gap-0.5 whitespace-nowrap font-mono text-[12px]", good ? "text-up" : "text-down")}>
      <Icon size={12} weight="bold" />
      {lowerIsBetter ? Math.abs(delta).toFixed(1) : `${Math.abs(Math.round(delta * 1000) / 10)} pts`}
    </span>
  );
}

function Compare({ e }: { e: Experiment }) {
  const rows = [
    ...METRICS.map((m) => ({ label: m.label, before: pct(e.baseline[m.key]), after: e.after ? pct(e.after[m.key]) : null, delta: e.comparison?.[m.key].delta ?? null })),
    { label: "Average position", before: pos(e.baseline.average_position), after: e.after ? pos(e.after.average_position) : null, delta: e.comparison?.average_position.delta ?? null, lowerIsBetter: true },
  ];
  return (
    <div className="overflow-hidden rounded-[12px] border border-line">
      <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] bg-[#fafaf9] px-4 py-2 text-[11px] text-muted">
        <span>Metric</span>
        <span>Before</span>
        <span>After</span>
        <span className="text-right">Change</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center border-t border-line px-4 py-2.5 text-[13px]">
          <span className="text-ink-2">{r.label}</span>
          <span className="font-mono tabular-nums">{r.before}</span>
          <span className="font-mono tabular-nums">{r.after ?? <span className="text-faint">waiting</span>}</span>
          <span className="flex justify-end">{e.after ? <ChangeBadge delta={r.delta} lowerIsBetter={"lowerIsBetter" in r} /> : <span className="text-faint">-</span>}</span>
        </div>
      ))}
    </div>
  );
}

/** Fills the second grid column when there is an odd number of experiments, and explains the loop. */
function HowItWorks() {
  const steps = [
    { icon: FloppyDisk, title: "Save a baseline", body: "We freeze today's mentions, recommendations and share of voice." },
    { icon: Rocket, title: "Ship your change", body: "Publish the page, fix the profile or update the positioning you want AI to pick up." },
    { icon: ArrowsClockwise, title: "Re-scan and compare", body: "After a new scan, complete the experiment to see what moved." },
  ];
  return (
    <Card title="How experiments work" subtitle="Three steps, then you know if it worked" className="flex flex-col">
      <ol className="flex flex-1 flex-col divide-y divide-line">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="flex flex-1 items-center gap-4 px-5 py-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-sunken text-ink-2">
              <Icon size={20} />
            </span>
            <span>
              <span className="block text-[13px] font-medium text-ink">
                {i + 1}. {title}
              </span>
              <span className="block text-[12px] text-muted">{body}</span>
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function NewExperiment({ projectId, onDone, onCancel }: { projectId: string; onDone: () => void; onCancel: () => void }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/projects/${projectId}/experiments`, { method: "POST", json: { name, description: description || null } });
      toast.push("Baseline saved. Make your change, then re-scan.", "success");
      onDone();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Start an experiment" subtitle="We freeze today's numbers as the baseline.">
      <form onSubmit={submit} className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <Field label="What are you changing?">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Publish a CRM for startups page" required maxLength={255} autoFocus />
        </Field>
        <Field label="Notes" hint="Optional. Helps you remember what shipped.">
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="New landing page aimed at founder-led sales" maxLength={2000} />
        </Field>
        <div className="flex gap-2">
          <button type="submit" disabled={saving || !name.trim()} className={buttonClass("primary", "sm")}>
            {saving ? <CircleNotch size={14} className="animate-spin" /> : <Flask size={14} />} Save baseline
          </button>
          <button type="button" onClick={onCancel} className={buttonClass("secondary", "sm")}>
            Cancel
          </button>
        </div>
        {error && <div className="lg:col-span-3"><ErrorBanner message={error} /></div>}
      </form>
    </Card>
  );
}

function ExperimentsInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { scans, latestScan, starting, startScan } = useProject();
  const { data, loading, error, reload } = useApi<Experiment[]>(`/projects/${id}/experiments`);
  useRefreshOnScan(reload);
  const [filter, setFilter] = useState<"running" | "completed">("running");
  const [completing, setCompleting] = useState<number | null>(null);
  const creating = params.get("new") === "1";

  const hasData = scans.some((s) => s.status === "completed" || s.status === "partial");
  const all = data ?? [];
  const running = all.filter((e) => e.status === "running");
  const completed = all.filter((e) => e.status === "completed");
  const rows = filter === "running" ? running : completed;
  const improved = completed.filter((e) => (e.comparison?.mention_rate.delta ?? 0) > 0).length;

  async function complete(e: Experiment) {
    setCompleting(e.id);
    try {
      await api(`/projects/${id}/experiments/${e.id}/complete`, { method: "POST" });
      toast.push("Experiment completed. Here is what changed.", "success");
      setFilter("completed");
      reload();
    } catch (err) {
      toast.push((err as ApiError).message, "error");
    } finally {
      setCompleting(null);
    }
  }

  if (error) return <ErrorBanner message={error.message} />;

  return (
    <>
      <PageHeader
        title="Experiments"
        description="Change something on your site, re-scan, and see whether AI noticed."
        actions={
          !creating && (
            <button type="button" onClick={() => router.replace(`/projects/${id}/experiments?new=1`)} disabled={!hasData} className={buttonClass("primary", "sm")}>
              <Plus size={14} weight="bold" /> New experiment
            </button>
          )
        }
      />

      <StatStrip
        stats={[
          { label: "Running", value: running.length, hint: "waiting for a re-scan", icon: <Flask size={18} />, tone: "amber" },
          { label: "Completed", value: completed.length, hint: "with a before and after", icon: <Check size={18} />, tone: "blue" },
          { label: "Improved mentions", value: improved, hint: `of ${completed.length} completed`, icon: <ArrowUpRight size={18} />, tone: "green" },
          { label: "Latest scan", value: latestScan ? `#${latestScan.id}` : "none", hint: latestScan ? latestScan.status : "run one to begin", icon: <ArrowRight size={18} />, tone: "violet" },
        ]}
      />

      {!hasData && (
        <Card className="mb-4">
          <EmptyState icon={<Flask size={30} />} title="Run a scan first" body="An experiment compares two scans, so it needs today's numbers as its baseline." action={<button type="button" onClick={startScan} disabled={starting || isScanActive(latestScan)} className={buttonClass("primary", "sm")}>Run first scan</button>} />
        </Card>
      )}

      {creating && hasData && (
        <div className="mb-4">
          <NewExperiment
            projectId={id}
            onDone={() => {
              router.replace(`/projects/${id}/experiments`);
              setFilter("running");
              reload();
            }}
            onCancel={() => router.replace(`/projects/${id}/experiments`)}
          />
        </div>
      )}

      {hasData && (
        <>
          <div className="mb-4">
            <Segmented label="Status" value={filter} onChange={setFilter} options={[{ key: "running", label: "Running", count: running.length }, { key: "completed", label: "Completed", count: completed.length }]} />
          </div>
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="h-72" />)}</div>
          ) : rows.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Flask size={30} />}
                title={filter === "running" ? "No experiment running" : "No completed experiments yet"}
                body={filter === "running" ? "Save a baseline, publish a change to your site, then re-scan and complete the experiment to see the impact." : "Complete a running experiment after a follow-up scan to see before and after."}
                action={filter === "running" && !creating ? <button type="button" onClick={() => router.replace(`/projects/${id}/experiments?new=1`)} className={buttonClass("primary", "sm")}><Plus size={14} weight="bold" /> New experiment</button> : undefined}
              />
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {rows.map((e) => {
                const followUp = latestScan && latestScan.id > e.baseline.scan_id && (latestScan.status === "completed" || latestScan.status === "partial");
                return (
                  <Card key={e.id} title={e.name} subtitle={e.status === "running" ? `Started ${day(e.started_at)}, baseline scan #${e.baseline.scan_id}` : `${day(e.started_at)} to ${day(e.ended_at ?? e.started_at)}`} className="flex flex-col">
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      {e.description && <p className="text-[13px] text-muted">{e.description}</p>}
                      <Compare e={e} />
                      {e.status === "running" && (
                        <div className="mt-auto flex flex-wrap items-center gap-3 rounded-[12px] bg-[#fafaf9] px-4 py-3 text-[13px]">
                          <span className="flex-1 text-muted">
                            {followUp ? "A scan newer than your baseline is ready." : "Publish your change, then run a new scan to compare."}
                          </span>
                          {followUp ? (
                            <button type="button" onClick={() => complete(e)} disabled={completing === e.id} className={buttonClass("primary", "sm")}>
                              {completing === e.id ? <CircleNotch size={14} className="animate-spin" /> : <Check size={14} weight="bold" />} Complete
                            </button>
                          ) : (
                            <button type="button" onClick={startScan} disabled={starting || isScanActive(latestScan)} className={buttonClass("secondary", "sm")}>
                              Run scan
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              {rows.length % 2 === 1 && <HowItWorks />}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function ExperimentsPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<Skeleton className="h-72" />}>
      <ExperimentsInner />
    </Suspense>
  );
}
