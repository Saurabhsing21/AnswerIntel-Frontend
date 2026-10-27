"use client";

import { ArrowLeft, Check, CircleNotch, Lock, MagnifyingGlass, Plus, Sparkle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { BrandTile } from "@/components/app/brand-tile";
import { AnswerEstimate, EnginePicker, useEngines } from "@/components/app/engine-picker";
import { askUpgrade } from "@/components/app/pro-lock";
import { useProject } from "@/components/app/project-context";
import { ErrorBanner, Field, inputClass } from "@/components/app/ui";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { Competitor, Project, Prompt } from "@/lib/api/types";
import { brandColor } from "@/lib/brand";
import { cx } from "@/lib/cx";
import { CATEGORY_LABELS } from "@/lib/format";

const STEPS = ["Brand", "Competitors", "AI engines", "Questions"];
// The markets the engines can answer for (backend/app/providers/google_ai.py).
const MARKETS = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Brazil", "Mexico", "Singapore", "United Arab Emirates", "Ireland", "New Zealand", "South Africa", "Japan"];
const MAX_COMPETITORS = 10;
// Roughly what the generator writes, for the estimate shown before the questions exist.
const TYPICAL_PROMPTS = 25;

type Suggestion = { name: string; website: string; reason: string };
type Draft = { brand: string; website: string; category: string; country: string; description: string };

const MARKET_CODES: Record<string, string> = {
  US: "United States", USA: "United States", UK: "United Kingdom", GB: "United Kingdom", IN: "India", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", ES: "Spain", IT: "Italy", NL: "Netherlands", BR: "Brazil", MX: "Mexico", SG: "Singapore",
  AE: "United Arab Emirates", IE: "Ireland", NZ: "New Zealand", ZA: "South Africa", JP: "Japan",
};
const marketName = (value: string | null) =>
  value && MARKETS.includes(value) ? value : (value && MARKET_CODES[value.toUpperCase()]) || "United States";

const withScheme = (url: string) => (/^https?:\/\//.test(url.trim()) ? url.trim() : `https://${url.trim()}`);
const host = (url: string) => url.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[/?#].*$/, "");
/** halden.co -> Halden: a good first guess at the brand name, so most people only type their website. */
const brandFromSite = (url: string) => {
  const name = host(url).split(".")[0] ?? "";
  return name ? name[0].toUpperCase() + name.slice(1) : "";
};

export default function NewProjectPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <NewProjectWizard />
    </Suspense>
  );
}

function NewProjectWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const workspaceId = params.get("workspace");
  const { billing } = useProject();
  const { engines: engineOptions, failed: enginesFailed, retry: retryEngines } = useEngines();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => ({
    brand: params.get("brand") ?? "",
    website: params.get("website") ?? "",
    category: params.get("category") ?? "",
    country: marketName(params.get("country")),
    description: "",
  }));
  const [brandTouched, setBrandTouched] = useState(Boolean(params.get("brand")));
  const [siteChecked, setSiteChecked] = useState("");
  const [categoryIdeas, setCategoryIdeas] = useState<string[]>([]);
  const savedCompetitors = useRef(new Set<string>());
  const [showDescription, setShowDescription] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [sample, setSample] = useState(false);
  const [picked, setPicked] = useState<Suggestion[]>([]);
  const [engines, setEngines] = useState<string[] | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [busy, setBusy] = useState("");
  const maxCompetitors = Math.min(MAX_COMPETITORS, billing?.limits.competitors ?? MAX_COMPETITORS);
  const [error, setError] = useState("");

  async function run<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(label);
    setError("");
    try {
      return await fn();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy("");
    }
  }

  // Until they change it, the engines are the recommended ones.
  const lockedEngines = billing?.limits.locked_engines ?? [];
  const chosenEngines =
    engines ??
    project?.engines ??
    (engineOptions ?? [])
      .filter((e) => e.available && e.default && !lockedEngines.includes(e.key))
      .map((e) => e.key)
      .slice(0, billing?.limits.engines ?? undefined);
  const brandBody = () => ({
    brand_name: draft.brand.trim(), website: withScheme(draft.website), category: draft.category.trim(), country: draft.country,
    description: draft.description.trim() || null,
  });

  /** What the website says about itself: fills the brand name and description, and suggests categories. */
  async function lookUpSite() {
    const url = draft.website.trim();
    if (!url.includes(".") || url === siteChecked) return;
    setSiteChecked(url);
    const info = await api<{ name: string | null; description: string | null; categories: string[] }>(`/onboarding/site?url=${encodeURIComponent(url)}`).catch(() => null);
    if (!info) return;
    setDraft((d) => ({ ...d, brand: brandTouched || !info.name ? d.brand : info.name, description: d.description || info.description || "" }));
    if (info.description) setShowDescription(true);
    setCategoryIdeas(info.categories);
  }

  /** Step 1 -> 2. Nothing is created yet: leaving setup half-way leaves no half-built project behind. */
  function findCompetitors(e: React.FormEvent) {
    e.preventDefault();
    setStep(1);
    setSuggestions(null);
    api<{ suggestions: Suggestion[]; sample: boolean }>("/onboarding/competitors", { method: "POST", json: brandBody() })
      .then((r) => {
        setSuggestions(r.suggestions);
        setSample(r.sample);
        setPicked(r.suggestions.slice(0, 3));
      })
      .catch(() => setSuggestions([]));
  }

  function toggle(s: Suggestion) {
    if (picked.some((p) => p.name === s.name)) return setPicked((all) => all.filter((p) => p.name !== s.name));
    if (picked.length >= maxCompetitors) {
      if (maxCompetitors < MAX_COMPETITORS) askUpgrade(`The free scan tracks up to ${maxCompetitors} competitors. Paid plans track up to 100.`, "competitors");
      return;
    }
    setPicked((all) => [...all, s]);
  }

  function addOwn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const own = { name: f.name.trim(), website: withScheme(f.website), reason: "" };
    if (!own.name || picked.some((p) => p.name.toLowerCase() === own.name.toLowerCase())) return;
    setSuggestions((all) => [own, ...(all ?? [])]);
    setPicked((all) => (all.length < maxCompetitors ? [...all, own] : all));
    form.reset();
  }

  function saveCompetitors(chosen: Suggestion[]) {
    setPicked(chosen);
    setStep(2);
  }

  /** Creates the project now that everything is chosen (or updates it after going back), then writes the
   * questions, which use the competitors' names, the first time through. */
  async function saveEnginesAndWritePrompts() {
    const done = await run("prompts", async () => {
      let current = project;
      if (!current) {
        current = await api<Project>("/projects", { method: "POST", json: { ...brandBody(), engines: chosenEngines, workspace_id: workspaceId || undefined } });
        setProject(current);
      } else {
        await api<Project>(`/projects/${current.id}`, { method: "PUT", json: { engines: chosenEngines } });
      }
      for (const c of picked) {
        if (savedCompetitors.current.has(c.name)) continue;
        await api<Competitor>(`/projects/${current.id}/competitors`, { method: "POST", json: { name: c.name, website: c.website } });
        savedCompetitors.current.add(c.name);
      }
      if (prompts.length) return true; // came back from the questions: keep them as they are
      const result = await api<{ prompts: Prompt[] }>(`/projects/${current.id}/prompts/generate`, { method: "POST" });
      setPrompts(result.prompts);
      return true;
    });
    if (done) setStep(3);
  }

  async function togglePrompt(p: Prompt) {
    const updated = await run("", () => api<Prompt>(`/projects/${project!.id}/prompts/${p.id}`, { method: "PATCH", json: { is_active: !p.is_active } }));
    if (updated) setPrompts((all) => all.map((x) => (x.id === p.id ? updated : x)));
  }

  async function addPrompt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = String(new FormData(form).get("text") ?? "").trim();
    const created = await run("", () => api<Prompt>(`/projects/${project!.id}/prompts`, { method: "POST", json: { text, category: "BUYER_INTENT", intent: "PURCHASE" } }));
    if (created) {
      setPrompts((all) => [...all, created]);
      form.reset();
    }
  }

  async function startScan() {
    const scan = await run("scan", () => api(`/projects/${project!.id}/scans`, { method: "POST" }));
    if (scan) router.push(`/projects/${project!.id}`);
  }

  const active = prompts.filter((p) => p.is_active).length;
  const allowance = billing?.limits.answers_per_month;
  const trial = billing?.state === "free";
  const typical = Math.min(TYPICAL_PROMPTS, billing?.limits.active_prompts ?? TYPICAL_PROMPTS);

  return (
    <div className="mx-auto max-w-[720px] pt-2 pb-10">
      <Progress step={step} />

      <section className="mt-5 overflow-hidden rounded-[22px] border border-line-strong bg-surface shadow-[0_1px_0_rgb(0_0_0/0.02),0_24px_48px_-32px_rgb(0_0_0/0.18)]">
        {step === 0 && (
          <form onSubmit={findCompetitors}>
            <StepHead step={0} title="Let's start with your brand" body="Your website is enough to begin. We'll write the questions your buyers ask AI, in your market." />
            <div className="grid gap-4 px-7 pb-7 sm:grid-cols-2">
              <Field label="Website">
                <input
                  required
                  autoFocus
                  inputMode="url"
                  value={draft.website}
                  onChange={(e) => setDraft({ ...draft, website: e.target.value, brand: brandTouched ? draft.brand : brandFromSite(e.target.value) })}
                  onBlur={lookUpSite}
                  className={inputClass}
                  placeholder="halden.co"
                />
              </Field>
              <Field label="Brand name">
                <input
                  required
                  value={draft.brand}
                  onChange={(e) => {
                    setBrandTouched(true);
                    setDraft({ ...draft, brand: e.target.value });
                  }}
                  className={inputClass}
                  placeholder="Halden"
                />
              </Field>
              <Field label="What you sell" hint="In the words a buyer would search.">
                <input required value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={inputClass} placeholder="CRM software for startups" />
              </Field>
              {categoryIdeas.length > 0 && (
                <div className="-mt-2 flex flex-wrap items-center gap-1.5 sm:col-span-2">
                  <span className="text-[12px] text-muted">From your website:</span>
                  {categoryIdeas.map((c) => (
                    <button key={c} type="button" onClick={() => setDraft({ ...draft, category: c })}
                      className={cx("rounded-full border px-2.5 py-0.5 text-[12px] transition-colors", draft.category === c ? "border-ink bg-mark-soft/60 text-ink" : "border-line text-ink-2 hover:border-line-strong")}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <Field label="Market" hint="AI answers differ by country.">
                <select value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} className={inputClass}>
                  {MARKETS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                {showDescription ? (
                  <Field label="Who it's for, and what makes you different" hint="Optional. It makes the questions sharper.">
                    <textarea
                      rows={3}
                      autoFocus
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      className={cx(inputClass, "h-auto py-2.5")}
                      placeholder="A CRM founders set up in 10 minutes, with no sales team needed."
                    />
                  </Field>
                ) : (
                  <button type="button" onClick={() => setShowDescription(true)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink">
                    <Plus size={13} weight="bold" /> Add a short description <span className="font-normal text-faint">(optional)</span>
                  </button>
                )}
              </div>
            </div>
            <StepFoot error={error}>
              <button type="submit" disabled={!!busy} className={cx(buttonClass("primary"), "ml-auto")}>
                {busy && <CircleNotch size={14} className="animate-spin" />}
                {busy ? "Setting up..." : "Continue"} {!busy && <ButtonArrow />}
              </button>
            </StepFoot>
          </form>
        )}

        {step === 1 && (
          <>
            <StepHead step={1} title="Your competitors" body={`The brands buyers compare with ${draft.brand.trim()}. We picked the closest three; change them or skip.`} optional />
            <div className="space-y-3 px-7 pb-7">
              {sample && <p className="rounded-[10px] bg-amber-soft px-3 py-2 text-[12px] text-amber-ink">Sample names for now. Real suggestions appear once an AI key is connected.</p>}
              {suggestions === null ? (
                <div className="space-y-2" role="status">
                  <p className="flex items-center gap-2 text-[13px] text-muted">
                    <MagnifyingGlass size={14} className="animate-pulse" /> Searching the web for {draft.category || "your category"} brands in {draft.country}...
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-[56px] animate-pulse rounded-[12px] bg-sunken" />)}</div>
                </div>
              ) : suggestions.length === 0 ? (
                <p className="rounded-[12px] border border-dashed border-line-strong px-4 py-5 text-center text-[13px] text-muted">
                  We couldn&apos;t find competitors on our own. Add the ones you know, or skip.
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {suggestions.map((s) => {
                    const on = picked.some((p) => p.name === s.name);
                    return (
                      <li key={s.name}>
                        <button
                          type="button"
                          onClick={() => toggle(s)}
                          aria-pressed={on}
                          className={cx(
                            "flex h-[56px] w-full items-center gap-3 rounded-[12px] border px-3 text-left transition-[border-color,background-color,box-shadow] duration-150",
                            on ? "border-ink bg-mark-soft/45 shadow-[0_0_0_1px_var(--color-ink)]" : "border-line bg-surface hover:border-line-strong",
                          )}
                        >
                          <BrandTile name={s.name} color={on ? brandColor(s.name, false, picked.map((p) => p.name)) : "#b5b5b2"} size={28} website={s.website} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-medium text-ink">{s.name}</span>
                            <span className="block truncate text-[12px] text-muted">{s.reason || host(s.website)}</span>
                          </span>
                          <span className={cx("grid size-5 shrink-0 place-items-center rounded-full border transition-colors", on ? "border-mark-strong bg-mark text-ink" : "border-line-strong")}>
                            {on && <Check size={11} weight="bold" />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <form onSubmit={addOwn} className="flex gap-2">
                <input name="name" required className={inputClass} placeholder="Add a competitor" aria-label="Competitor name" />
                <input name="website" required className={inputClass} placeholder="their-site.com" aria-label="Competitor website" />
                <button type="submit" className={cx(buttonClass("secondary"), "shrink-0")} aria-label="Add competitor">
                  <Plus size={14} weight="bold" />
                </button>
              </form>
            </div>
            <StepFoot error={error}>
              <button type="button" onClick={() => setStep(0)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
                <ArrowLeft size={13} /> Back
              </button>
              <button type="button" onClick={() => saveCompetitors([])} disabled={!!busy} className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
                Skip
              </button>
              <button type="button" onClick={() => saveCompetitors(picked)} disabled={!!busy || suggestions === null} className={cx(buttonClass("primary"), "ml-auto")}>
                {busy && <CircleNotch size={14} className="animate-spin" />}
                {picked.length ? `Track ${picked.length} competitor${picked.length > 1 ? "s" : ""}` : "Continue"} {!busy && <ButtonArrow />}
              </button>
            </StepFoot>
          </>
        )}

        {step === 2 && (
          <>
            <StepHead step={2} title="Where should we ask?" body="Each AI engine answers on its own. We picked the ones buyers use most; add any others you care about." />
            <div className="space-y-4 px-7 pb-7">
              {engineOptions ? (
                <EnginePicker engines={engineOptions} value={chosenEngines} onChange={setEngines} locked={billing?.limits.locked_engines} max={billing?.limits.engines} />
              ) : enginesFailed ? (
                <p className="flex items-center gap-3 rounded-[12px] border border-dashed border-line-strong px-4 py-5 text-[13px] text-muted">
                  We couldn&apos;t load the AI engines.
                  <button type="button" onClick={retryEngines} className="font-medium text-ink underline underline-offset-2">Try again</button>
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-[52px] animate-pulse rounded-[12px] bg-sunken" />)}</div>
              )}
              <AnswerEstimate prompts={typical} engines={chosenEngines.length} allowance={allowance} trial={trial} />
            </div>
            <StepFoot error={error}>
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
                <ArrowLeft size={13} /> Back
              </button>
              <button type="button" onClick={saveEnginesAndWritePrompts} disabled={!!busy || chosenEngines.length === 0} className={cx(buttonClass("primary"), "ml-auto")}>
                {busy ? <CircleNotch size={14} className="animate-spin" /> : <Sparkle size={14} weight="fill" />}
                {busy ? (prompts.length ? "Saving..." : "Writing your questions...") : prompts.length ? "Continue" : "Write my questions"}
              </button>
            </StepFoot>
          </>
        )}

        {step === 3 && project && (
          <>
            <StepHead step={3} title="Your questions are ready" body="Written from your category, market and competitors. Untick any that don't fit, then run your first scan." />
            <div className="space-y-4 px-7 pb-7">
              {trial && prompts.some((p) => !p.is_active) && (
                <p className="rounded-[10px] bg-mark-soft/60 px-3 py-2 text-[12px] text-ink-2">
                  Your free scan asks the {active} ticked questions, the ones closest to a purchase. Swap any of them; plans track up to 160.
                </p>
              )}
              <PromptGroups prompts={prompts} onToggle={togglePrompt} full={active >= (billing?.limits.active_prompts ?? Infinity)} />
              <form onSubmit={addPrompt} className="flex gap-2">
                <input name="text" required minLength={8} className={inputClass} placeholder="Add a question your buyers ask" aria-label="New question" />
                <button type="submit" className={cx(buttonClass("secondary"), "shrink-0")} aria-label="Add question">
                  <Plus size={14} weight="bold" />
                </button>
              </form>
              <AnswerEstimate prompts={active} engines={chosenEngines.length} allowance={allowance} trial={trial} />
            </div>
            <StepFoot error={error}>
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
                <ArrowLeft size={13} /> Back
              </button>
              <span className="text-[13px] text-muted">
                <span className="font-medium text-ink tabular-nums">{active * chosenEngines.length}</span> answers in this scan
              </span>
              <button type="button" onClick={startScan} disabled={!!busy || !active} className={cx(buttonClass("primary"), "ml-auto")}>
                {busy && <CircleNotch size={14} className="animate-spin" />}
                {busy ? "Starting..." : trial ? "Run my free scan" : "Run first scan"} {!busy && <ButtonArrow />}
              </button>
            </StepFoot>
          </>
        )}
      </section>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 text-[12px]" aria-label="Setup progress">
      {STEPS.map((s, i) => (
        <li
          key={s}
          aria-current={i === step ? "step" : undefined}
          className={cx(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 transition-colors",
            i === step ? "bg-ink font-medium text-white" : i < step ? "text-ink-2" : "text-faint",
          )}
        >
          {i < step ? <Check size={11} weight="bold" className="text-up" /> : <span className={cx("font-mono text-[11px]", i === step && "text-mark")}>{i + 1}</span>}
          <span className="hidden sm:inline">{s}</span>
        </li>
      ))}
    </ol>
  );
}

function StepHead({ step, title, body, optional }: { step: number; title: string; body: string; optional?: boolean }) {
  return (
    <header className="px-7 pt-7 pb-6">
      <p className="flex items-center gap-2 text-[12px] text-muted">
        <span className="rounded-full bg-mark px-2 py-0.5 font-medium text-ink">Step {step + 1} of 4</span>
        {optional && <span>Optional</span>}
      </p>
      <h1 className="mt-3 font-display text-[28px] leading-[1.1] font-semibold tracking-[-0.035em]">{title}</h1>
      <p className="mt-2 max-w-[540px] text-[14px] leading-relaxed text-muted">{body}</p>
    </header>
  );
}

function StepFoot({ error, children }: { error: string; children: React.ReactNode }) {
  return (
    <footer className="border-t border-line bg-[#fbfbfa] px-7 py-4">
      {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
      <div className="flex items-center gap-3">{children}</div>
    </footer>
  );
}

/** `full`: the plan's prompt limit is reached, so switched-off prompts show a lock and open the upgrade prompt. */
function PromptGroups({ prompts, onToggle, full }: { prompts: Prompt[]; onToggle: (p: Prompt) => void; full: boolean }) {
  const groups = new Map<string, Prompt[]>();
  for (const p of prompts) groups.set(p.category, [...(groups.get(p.category) ?? []), p]);
  return (
    <div className="max-h-[400px] space-y-4 overflow-y-auto pr-1">
      {[...groups].map(([category, rows]) => (
        <div key={category}>
          <p className="mb-1.5 text-[12px] font-medium text-muted">
            {CATEGORY_LABELS[category] ?? category} <span className="text-faint">· {rows.filter((r) => r.is_active).length}/{rows.length}</span>
          </p>
          <ul className="divide-y divide-line overflow-hidden rounded-[12px] border border-line">
            {rows.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-[#fbfbfa]">
                  {full && !p.is_active ? (
                    <button
                      type="button"
                      onClick={() => askUpgrade("Your plan's question limit is reached. Paid plans track up to 160 questions.", "active_prompts")}
                      aria-label="Locked: upgrade to add this question"
                      className="grid size-4 shrink-0 place-items-center text-muted"
                    >
                      <Lock size={14} weight="bold" />
                    </button>
                  ) : (
                    <input type="checkbox" checked={p.is_active} onChange={() => onToggle(p)} className="size-4 shrink-0 accent-mark-strong" />
                  )}
                  <span className={cx("min-w-0 flex-1 text-[14px]", p.is_active ? "text-ink" : "text-ink-2")}>{p.text}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
