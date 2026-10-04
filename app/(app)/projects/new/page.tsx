"use client";

import { Check, Plus, Sparkle, Trash, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { Competitor, Project, Prompt } from "@/lib/api/types";
import { CATEGORY_LABELS } from "@/lib/format";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { ErrorBanner, Field, inputClass } from "@/components/app/ui";
import { cx } from "@/lib/cx";

const STEPS = ["Business", "Competitors", "Prompts", "First scan"];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [project, setProject] = useState<Project | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
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

  async function createProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    let website = f.website.trim();
    if (website && !/^https?:\/\//.test(website)) website = `https://${website}`;
    const created = await run(() =>
      api<Project>("/projects", { method: "POST", json: { ...f, website, description: f.description || null } }),
    );
    if (created) {
      setProject(created);
      setStep(1);
    }
  }

  async function addCompetitor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    let website = f.website.trim();
    if (website && !/^https?:\/\//.test(website)) website = `https://${website}`;
    const created = await run(() => api<Competitor>(`/projects/${project!.id}/competitors`, { method: "POST", json: { name: f.name, website } }));
    if (created) {
      setCompetitors((c) => [...c, created]);
      form.reset();
      (form.elements.namedItem("name") as HTMLInputElement)?.focus();
    }
  }

  async function removeCompetitor(id: number) {
    await run(() => api(`/projects/${project!.id}/competitors/${id}`, { method: "DELETE" }));
    setCompetitors((c) => c.filter((x) => x.id !== id));
  }

  async function generate() {
    const result = await run(() => api<{ prompts: Prompt[] }>(`/projects/${project!.id}/prompts/generate`, { method: "POST" }));
    if (result) {
      setPrompts(result.prompts);
      setStep(2);
    }
  }

  async function togglePrompt(p: Prompt) {
    const updated = await run(() => api<Prompt>(`/projects/${project!.id}/prompts/${p.id}`, { method: "PATCH", json: { is_active: !p.is_active } }));
    if (updated) setPrompts((all) => all.map((x) => (x.id === p.id ? updated : x)));
  }

  async function addPrompt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = String(new FormData(form).get("text") ?? "").trim();
    const created = await run(() => api<Prompt>(`/projects/${project!.id}/prompts`, { method: "POST", json: { text, category: "BUYER_INTENT", intent: "PURCHASE" } }));
    if (created) {
      setPrompts((all) => [...all, created]);
      form.reset();
    }
  }

  async function startScan() {
    const scan = await run(() => api(`/projects/${project!.id}/scans`, { method: "POST" }));
    if (scan) router.push(`/projects/${project!.id}`);
  }

  const active = prompts.filter((p) => p.is_active).length;

  return (
    <div className="mx-auto max-w-[760px]">
      <ol className="mb-8 flex items-center gap-2 text-[12px]" aria-label="Setup progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cx(
                "grid size-6 place-items-center rounded-full border text-[11px] font-medium",
                i < step ? "border-ink bg-ink text-white" : i === step ? "border-ink text-ink" : "border-line-strong text-faint",
              )}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <Check size={11} weight="bold" /> : i + 1}
            </span>
            <span className={cx("hidden sm:inline", i === step ? "font-medium text-ink" : "text-muted")}>{s}</span>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-line-strong sm:w-10" />}
          </li>
        ))}
      </ol>

      <div className="rounded-[20px] border border-line-strong bg-surface p-6 md:p-8">
        {step === 0 && (
          <form onSubmit={createProject} className="space-y-4">
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">Tell us about your business</h1>
            <p className="-mt-2 text-[14px] text-muted">We use this to write the questions your buyers ask AI.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brand name">
                <input name="brand_name" required className={inputClass} placeholder="Halden" />
              </Field>
              <Field label="Website">
                <input name="website" required className={inputClass} placeholder="halden.co" />
              </Field>
              <Field label="Category" hint="What buyers search for, e.g. CRM software.">
                <input name="category" required className={inputClass} placeholder="CRM software" />
              </Field>
              <Field label="Market">
                <input name="country" required className={inputClass} placeholder="United States" />
              </Field>
            </div>
            <Field label="Short description" hint="Optional. Who you serve and what makes you different.">
              <textarea name="description" rows={3} className={cx(inputClass, "h-auto py-2")} placeholder="A simple CRM for early-stage startups" />
            </Field>
            {error && <ErrorBanner message={error} />}
            <button type="submit" disabled={busy} className={buttonClass("primary")}>
              {busy ? "Creating..." : "Continue"} <ButtonArrow />
            </button>
          </form>
        )}

        {step === 1 && project && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">Who do you compete with?</h1>
              <p className="mt-1 text-[14px] text-muted">Add 3 to 5 competitors. We track how often AI recommends them instead of {project.brand_name}.</p>
            </div>
            {competitors.length > 0 && (
              <ul className="divide-y divide-line rounded-[12px] border border-line">
                {competitors.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-[14px]">
                    <span className="font-medium">{c.name}</span>
                    <span className="truncate text-[12px] text-muted">{c.website}</span>
                    <button type="button" onClick={() => removeCompetitor(c.id)} className="ml-auto grid size-7 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink" aria-label={`Remove ${c.name}`}>
                      <Trash size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {competitors.length < 5 && (
              <form onSubmit={addCompetitor} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Field label="Competitor">
                  <input name="name" required className={inputClass} placeholder="Kiteline" />
                </Field>
                <Field label="Website">
                  <input name="website" required className={inputClass} placeholder="kiteline.io" />
                </Field>
                <button type="submit" disabled={busy} className={buttonClass("secondary")}>
                  <Plus size={14} weight="bold" /> Add
                </button>
              </form>
            )}
            {error && <ErrorBanner message={error} />}
            <div className="flex items-center gap-3 border-t border-line pt-5">
              <span className="text-[13px] text-muted">{competitors.length}/5 added</span>
              <button type="button" onClick={generate} disabled={busy || competitors.length === 0} className={cx(buttonClass("primary"), "ml-auto")}>
                <Sparkle size={14} weight="fill" /> {busy ? "Writing prompts..." : "Generate prompts"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && project && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">Review your prompts</h1>
              <p className="mt-1 text-[14px] text-muted">
                These are the questions we will ask every AI engine. Turn off any that don&apos;t fit, or add your own.
              </p>
            </div>
            <ul className="max-h-[420px] divide-y divide-line overflow-y-auto rounded-[12px] border border-line">
              {prompts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={p.is_active}
                    aria-label={`Track "${p.text}"`}
                    onClick={() => togglePrompt(p)}
                    className={cx("relative h-5 w-9 shrink-0 rounded-full transition-colors", p.is_active ? "bg-ink" : "bg-[#d9d9d6]")}
                  >
                    <span className={cx("absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left]", p.is_active ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <span className={cx("min-w-0 flex-1 text-[14px]", !p.is_active && "text-faint line-through")}>{p.text}</span>
                  <span className="hidden shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2 sm:inline">{CATEGORY_LABELS[p.category] ?? p.category}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={addPrompt} className="flex gap-2">
              <input name="text" required minLength={8} className={inputClass} placeholder="Add a question your buyers ask" aria-label="New prompt" />
              <button type="submit" disabled={busy} className={buttonClass("secondary")}>
                <Plus size={14} weight="bold" /> Add
              </button>
            </form>
            {error && <ErrorBanner message={error} />}
            <div className="flex items-center gap-3 border-t border-line pt-5">
              <span className="text-[13px] text-muted">{active} active prompts</span>
              <button type="button" onClick={() => setStep(3)} disabled={!active} className={cx(buttonClass("primary"), "ml-auto")}>
                Continue <ButtonArrow />
              </button>
            </div>
          </div>
        )}

        {step === 3 && project && (
          <div className="space-y-5 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-ink text-white">
              <Sparkle size={20} weight="fill" />
            </div>
            <div>
              <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">Ready for your first scan</h1>
              <p className="mx-auto mt-1 max-w-[440px] text-[14px] text-muted">
                We will ask {active} questions across ChatGPT, Perplexity and Gemini, then measure how often {project.brand_name} is mentioned and
                recommended.
              </p>
            </div>
            {error && <ErrorBanner message={error} />}
            <div className="flex justify-center gap-2">
              <button type="button" onClick={() => setStep(2)} className={buttonClass("secondary")}>
                <X size={14} /> Back
              </button>
              <button type="button" onClick={startScan} disabled={busy} className={buttonClass("primary")}>
                {busy ? "Starting..." : "Start scan"} <ButtonArrow />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
