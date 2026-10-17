"use client";

import { CalendarCheck, CircleNotch, Database, FloppyDisk, Info, Trash, Warning } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useProject } from "@/components/app/project-context";
import { useToast } from "@/components/app/toast";
import { Card, ErrorBanner, Field, inputClass, PageHeader, Skeleton } from "@/components/app/ui";
import { EngineIcon } from "@/components/product/engine-icon";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { Project, Schedule } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { formatHour, nextRun, relativeDay, WEEKDAYS } from "@/lib/schedule";

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cx("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-ink" : "bg-[#d4d4d1]")}
    >
      <span className={cx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

function ScheduleCard({ projectId, initial, onSaved }: { projectId: string; initial: Schedule; onSaved: () => void }) {
  const toast = useToast();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [day, setDay] = useState(initial.day_of_week);
  const [hour, setHour] = useState(initial.hour);
  const [saving, setSaving] = useState(false);
  const dirty = enabled !== initial.enabled || day !== initial.day_of_week || hour !== initial.hour;
  const next = nextRun(day, hour);

  async function save() {
    setSaving(true);
    try {
      await api(`/projects/${projectId}/schedule`, { method: "PUT", json: { enabled, day_of_week: day, hour } });
      toast.push(enabled ? "Weekly scan saved." : "Weekly scan turned off.", "success");
      onSaved();
    } catch (e) {
      toast.push((e as ApiError).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Weekly scan" subtitle="Track changes without lifting a finger">
      <div className="space-y-5 p-5">
        <div className="flex items-center gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-sunken text-ink-2">
            <CalendarCheck size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-ink">Scan automatically every week</p>
            <p className="text-[12px] text-muted">After each scan we email you the weekly report.</p>
          </div>
          <Switch on={enabled} onChange={setEnabled} label="Weekly scan" />
        </div>

        <div className={cx("space-y-4 transition-opacity", !enabled && "pointer-events-none opacity-45")} aria-disabled={!enabled}>
          <Field label="Day">
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((name, i) => (
                <button key={name} type="button" onClick={() => setDay(i)} aria-pressed={day === i} className={cx("rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors", day === i ? "border-ink bg-ink text-white" : "border-line-strong text-ink-2 hover:border-ink")}>
                  {name.slice(0, 3)}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Time (UTC)">
            <select value={hour} onChange={(e) => setHour(Number(e.target.value))} className={cx(inputClass, "max-w-[200px]")}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </Field>
          <p className="rounded-[10px] bg-[#fafaf9] px-3.5 py-2.5 text-[12px] text-muted">
            Next scan: <span className="font-medium text-ink">{WEEKDAYS[day]} {formatHour(hour)}</span>, {relativeDay(next)}. In your time that is{" "}
            <span className="font-medium text-ink">{next.toLocaleString(undefined, { weekday: "long", hour: "2-digit", minute: "2-digit" })}</span>.
          </p>
        </div>

        <button type="button" onClick={save} disabled={!dirty || saving} className={buttonClass("primary", "sm")}>
          {saving ? <CircleNotch size={14} className="animate-spin" /> : <FloppyDisk size={14} />} Save schedule
        </button>
      </div>
    </Card>
  );
}

function DetailsCard({ project, onSaved }: { project: Project; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ brand_name: project.brand_name, website: project.website, category: project.category, country: project.country, description: project.description ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const dirty = form.brand_name !== project.brand_name || form.website !== project.website || form.category !== project.category || form.country !== project.country || form.description !== (project.description ?? "");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/projects/${project.id}`, { method: "PUT", json: { ...form, description: form.description || null } });
      toast.push("Project updated. The next scan uses these details.", "success");
      onSaved();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Project details" subtitle="What we tell the AI engines about your brand">
      <form onSubmit={save} className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name"><input className={inputClass} value={form.brand_name} onChange={set("brand_name")} required /></Field>
          <Field label="Website"><input className={inputClass} value={form.website} onChange={set("website")} type="url" required /></Field>
          <Field label="Category" hint="For example: CRM software"><input className={inputClass} value={form.category} onChange={set("category")} required /></Field>
          <Field label="Market" hint="Country code, for example US"><input className={inputClass} value={form.country} onChange={set("country")} required /></Field>
        </div>
        <Field label="Description" hint="One sentence on what you do and who it is for.">
          <textarea className={cx(inputClass, "h-24 resize-none py-2")} value={form.description} onChange={set("description")} />
        </Field>
        {error && <ErrorBanner message={error} />}
        <button type="submit" disabled={!dirty || saving} className={buttonClass("primary", "sm")}>
          {saving ? <CircleNotch size={14} className="animate-spin" /> : <FloppyDisk size={14} />} Save changes
        </button>
      </form>
    </Card>
  );
}

function DangerCard({ project }: { project: Project }) {
  const router = useRouter();
  const toast = useToast();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await api(`/projects/${project.id}`, { method: "DELETE" });
      toast.push(`${project.brand_name} was deleted.`, "success");
      router.push("/projects");
    } catch (e) {
      toast.push((e as ApiError).message, "error");
      setDeleting(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#f3c4c4] bg-surface">
      <header className="flex items-center gap-2 border-b border-[#f3c4c4] bg-[#fdf3f3] px-5 py-3.5">
        <Warning size={16} className="text-down" />
        <h2 className="text-[14px] font-medium text-[#b42318]">Delete project</h2>
      </header>
      <div className="space-y-3 p-5">
        <p className="text-[13px] text-muted">This permanently removes {project.brand_name}, its competitors, prompts, scans, reports and experiments. It cannot be undone.</p>
        <Field label={`Type ${project.brand_name} to confirm`}>
          <input className={inputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
        </Field>
        <button type="button" onClick={remove} disabled={confirm !== project.brand_name || deleting} className="inline-flex h-9 items-center gap-2 rounded-full bg-down px-4 text-sm font-medium text-white transition-opacity disabled:opacity-40">
          {deleting ? <CircleNotch size={14} className="animate-spin" /> : <Trash size={14} />} Delete project
        </button>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { project, schedule, latestScan, reloadSchedule, reloadProjects } = useProject();

  return (
    <>
      <PageHeader title="Settings" description="The weekly scan, your brand details, and how your data is collected." />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {schedule ? <ScheduleCard projectId={id} initial={schedule} onSaved={reloadSchedule} /> : <Skeleton className="h-[420px]" />}
          <Card title="Data and engines" subtitle="Where the answers come from">
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-sunken text-ink-2">
                  <Database size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink">{latestScan?.simulated ? "Sample data" : "Live AI answers"}</p>
                  <p className="text-[12px] text-muted">{latestScan?.simulated ? "Answers are generated locally so you can explore the product." : "Every prompt is sent to the real engines."}</p>
                </div>
              </div>
              {latestScan?.simulated && (
                <p className="flex items-start gap-2 rounded-[10px] bg-[#fafaf9] px-3.5 py-2.5 text-[12px] text-muted">
                  <Info size={14} className="mt-px shrink-0" />
                  <span>
                    To scan the real engines, set <code className="rounded bg-sunken px-1 font-mono">OPENROUTER_API_KEY</code> on the API server and run a new scan.
                  </span>
                </p>
              )}
              <ul className="grid grid-cols-3 gap-2">
                {(["chatgpt", "perplexity", "gemini"] as const).map((e) => (
                  <li key={e} className="flex items-center gap-2 rounded-[10px] border border-line px-3 py-2 text-[12px] text-ink-2">
                    <EngineIcon engine={e} size={14} /> {e === "chatgpt" ? "ChatGPT" : e === "perplexity" ? "Perplexity" : "Gemini"}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          {project ? <DetailsCard key={project.id + project.brand_name} project={project} onSaved={reloadProjects} /> : <Skeleton className="h-[420px]" />}
          {project && <DangerCard project={project} />}
        </div>
      </div>
    </>
  );
}
