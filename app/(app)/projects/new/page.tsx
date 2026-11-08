"use client";

import { ArrowLeft, Check, CircleNotch, Lock, MagnifyingGlass, Plus, Sparkle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { BrandTile } from "@/components/app/brand-tile";
import { CreditEstimate, EnginePicker, useEngines } from "@/components/app/engine-picker";
import { askUpgrade } from "@/components/app/pro-lock";
import { useProject } from "@/components/app/project-context";
import { PoolFullNotice } from "@/components/app/pool-full";
import { ErrorBanner, inputClass } from "@/components/app/ui";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { api, ApiError, type PoolDetails } from "@/lib/api/client";
import type { Competitor, Project, Prompt } from "@/lib/api/types";
import { MAX_PROMPTS, monthlyCredits } from "@/lib/billing/plans";
import { brandColor } from "@/lib/brand";
import { cx } from "@/lib/cx";
import { CATEGORY_LABELS, formatCredits } from "@/lib/format";

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

/** Looks like a real address (has a dot and a letters-only ending), so we do not look up "hal" or "halden.c". */
const looksLikeUrl = (value: string) => /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)*\.[a-z]{2,}([/?#]\S*)?$/i.test(value.trim());

// Three soft tones from the palette, rotated across the category pills.
const CHIP_TONES = [
  "bg-blue-soft text-blue-ink",
  "bg-violet-soft text-violet-ink",
  "bg-amber-soft text-amber-ink",
];

const primaryInput =
  "h-11 w-full rounded-[10px] border border-line-strong bg-surface px-3.5 text-[15px] font-medium text-ink outline-none transition-colors placeholder:font-normal placeholder:text-faint focus:border-ink";

function FromSite() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-mark-soft px-1.5 py-px text-[10.5px] font-medium text-ink-2">
      <Sparkle size={9} weight="fill" className="text-mark-strong" /> From your website
    </span>
  );
}

/** A labelled field with room beside the label for a badge or status, and quiet helper text. */
function FieldRow({ label, aside, hint, children }: { label: string; aside?: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex min-h-5 items-center gap-2 text-[13px] font-medium text-ink">
        {label}
        {aside}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-faint">{hint}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3.5">
      <h2 className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
        {title}
        <span className="h-px flex-1 bg-line" />
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

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
  // "Touched": the person typed in the field themselves, so a website lookup must not overwrite it.
  const brandTouched = useRef(Boolean(params.get("brand")));
  const descriptionTouched = useRef(false);
  const [fromSite, setFromSite] = useState({ brand: false, description: false });
  const [reading, setReading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryIdeas, setCategoryIdeas] = useState<string[]>([]);
  const lookup = useRef({ id: 0, url: "", controller: null as AbortController | null });
  const savedCompetitors = useRef(new Set<string>());
  const [project, setProject] = useState<Project | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [picked, setPicked] = useState<Suggestion[]>([]);
  const [engines, setEngines] = useState<string[] | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [busy, setBusy] = useState("");
  const maxCompetitors = Math.min(MAX_COMPETITORS, billing?.limits.competitors ?? MAX_COMPETITORS);
  const [error, setError] = useState("");
  // The plan's question pool is full: why the list may be unticked, or why a tick was refused.
  const [full, setFull] = useState<{ pool: PoolDetails; message: string; onlyWhileEmpty: boolean } | null>(null);

  async function run<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(label);
    setError("");
    setFull(null);
    try {
      return await fn();
    } catch (e) {
      const err = e as ApiError;
      if (err.details) setFull({ pool: err.details, message: err.message, onlyWhileEmpty: false });
      else setError(err.message);
    } finally {
      setBusy("");
    }
  }

  // Until they change it, the engines are the recommended ones.
  const allowedEngines = billing?.limits.allowed_engines;
  const chosenEngines = (
    engines ??
    project?.engines ??
    (engineOptions ?? []).filter((e) => e.available && e.default).map((e) => e.key)
  ).filter((k) => !allowedEngines || allowedEngines.includes(k));
  const brandBody = () => ({
    brand_name: draft.brand.trim(), website: withScheme(draft.website), category: draft.category.trim(), country: draft.country,
    description: draft.description.trim() || null,
  });

  /** What the website says about itself. The name and description come back fast and are shown at once; the
   * AI-written category ideas follow in a second call. A newer lookup cancels an older one. */
  const lookUpSite = useCallback(async (raw: string) => {
    const url = raw.trim();
    const state = lookup.current;
    if (!looksLikeUrl(url) || url === state.url) return;
    state.controller?.abort();
    const controller = new AbortController();
    const id = ++state.id;
    state.url = url;
    state.controller = controller;
    const current = () => id === lookup.current.id;
    setReading(true);
    const info = await api<{ name: string | null; description: string | null }>(`/onboarding/site?url=${encodeURIComponent(url)}&categories=false`, { signal: controller.signal }).catch(() => null);
    if (!current()) return;
    setReading(false);
    if (!info) return;
    const takeBrand = !brandTouched.current && Boolean(info.name);
    const takeDescription = !descriptionTouched.current && Boolean(info.description);
    setDraft((d) => ({ ...d, brand: takeBrand ? info.name! : d.brand, description: takeDescription ? info.description! : d.description }));
    if (takeBrand) setFromSite((f) => ({ ...f, brand: true }));
    if (takeDescription) setFromSite((f) => ({ ...f, description: true }));
    if (!info.name && !info.description) return;
    setCategoriesLoading(true);
    const found = await api<{ categories: string[] }>("/onboarding/categories", { method: "POST", json: { name: info.name, description: info.description }, signal: controller.signal }).catch(() => null);
    if (!current()) return;
    setCategoriesLoading(false);
    setCategoryIdeas(found?.categories ?? []);
  }, []);

  /** The website changed: drop everything learned from the old one and stop its requests. */
  function changeWebsite(value: string) {
    const state = lookup.current;
    state.controller?.abort();
    state.id++;
    state.url = "";
    setReading(false);
    setCategoriesLoading(false);
    setCategoryIdeas([]);
    setDraft((d) => ({
      ...d,
      website: value,
      brand: brandTouched.current ? d.brand : brandFromSite(value),
      description: fromSite.description && !descriptionTouched.current ? "" : d.description,
    }));
    setFromSite((f) => ({ brand: false, description: f.description && descriptionTouched.current }));
  }

  // Look the site up shortly after they stop typing; leaving the field does it straight away.
  useEffect(() => {
    if (step !== 0 || !looksLikeUrl(draft.website)) return;
    const timer = setTimeout(() => void lookUpSite(draft.website), 600);
    return () => clearTimeout(timer);
  }, [draft.website, step, lookUpSite]);
  useEffect(() => () => lookup.current.controller?.abort(), []);

  /** Step 1 -> 2. Nothing is created yet: leaving setup half-way leaves no half-built project behind. */
  function findCompetitors(e: React.FormEvent) {
    e.preventDefault();
    setStep(1);
    setSuggestions(null);
    api<{ suggestions: Suggestion[] }>("/onboarding/competitors", { method: "POST", json: brandBody() })
      .then((r) => {
        setSuggestions(r.suggestions);
        setPicked(r.suggestions.slice(0, 3));
      })
      .catch((e) => {
        setError((e as ApiError).message);
        setSuggestions([]);
      });
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
      const result = await api<{ prompts: Prompt[]; pool_full: (PoolDetails & { message: string }) | null }>(`/projects/${current.id}/prompts/generate`, { method: "POST" });
      setPrompts(result.prompts);
      if (result.pool_full) setFull({ pool: result.pool_full, message: result.pool_full.message, onlyWhileEmpty: true });
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
  const allowance = billing?.limits.credits_per_month;
  const trial = billing?.state === "free";
  const typical = Math.min(TYPICAL_PROMPTS, billing?.limits.active_prompts ?? TYPICAL_PROMPTS);

  return (
    <div className="mx-auto max-w-[720px] pt-2 pb-10">
      <Progress step={step} />

      <section className="mt-5 overflow-hidden rounded-[22px] border border-line-strong bg-surface shadow-[0_1px_0_rgb(0_0_0/0.02),0_24px_48px_-32px_rgb(0_0_0/0.18)]">
        {step === 0 && (
          <form onSubmit={findCompetitors}>
            <StepHead step={0} title="Let's start with your brand" body="Your website is enough to begin. We'll write the questions your buyers ask AI, in your market." />
            <div className="space-y-7 px-7 pb-7">
              <Section title="Your website">
                <FieldRow
                  label="Website"
                  aside={
                    reading && (
                      <span role="status" className="inline-flex items-center gap-1 text-[12px] font-normal text-muted">
                        <CircleNotch size={11} className="animate-spin" /> Reading your website...
                      </span>
                    )
                  }
                >
                  <input
                    required
                    autoFocus
                    inputMode="url"
                    value={draft.website}
                    onChange={(e) => changeWebsite(e.target.value)}
                    onBlur={() => void lookUpSite(draft.website)}
                    className={primaryInput}
                    placeholder="halden.co"
                  />
                </FieldRow>
                <FieldRow label="Brand name" aside={fromSite.brand && <FromSite />}>
                  <input
                    required
                    value={draft.brand}
                    onChange={(e) => {
                      brandTouched.current = e.target.value.trim() !== "";
                      setFromSite((f) => ({ ...f, brand: false }));
                      setDraft({ ...draft, brand: e.target.value });
                    }}
                    className={primaryInput}
                    placeholder="Halden"
                  />
                </FieldRow>
              </Section>

              <Section title="How buyers find you">
                <div className="sm:col-span-2">
                  <FieldRow label="What you sell" hint="In the words a buyer would search.">
                    <input required value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={primaryInput} placeholder="CRM software for startups" />
                  </FieldRow>
                </div>
                {(categoriesLoading || categoryIdeas.length > 0) && (
                  <div className="-mt-1 sm:col-span-2" aria-busy={categoriesLoading}>
                    {categoriesLoading ? (
                      <p role="status" className="flex items-center gap-2 text-[12px] text-muted">
                        <CircleNotch size={12} className="animate-spin" /> Finding categories...
                        <span className="h-6 w-28 animate-pulse rounded-full bg-sunken" />
                        <span className="hidden h-6 w-36 animate-pulse rounded-full bg-sunken sm:block" />
                      </p>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <FromSite />
                        {categoryIdeas.map((c, i) => {
                          const on = draft.category.trim() === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setDraft({ ...draft, category: c })}
                              className={cx(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition-[box-shadow,border-color,transform] duration-150 active:scale-[0.98]",
                                CHIP_TONES[i % CHIP_TONES.length],
                                on ? "border-ink shadow-[0_0_0_2px_var(--color-mark)]" : "border-transparent hover:border-current/30",
                              )}
                            >
                              {on ? <Check size={12} weight="bold" /> : <Sparkle size={12} weight="fill" />}
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                <FieldRow label="Market" hint="AI answers differ by country.">
                  <select value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} className={inputClass}>
                    {MARKETS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </FieldRow>
              </Section>

              <Section title="What makes you different">
                <div className="sm:col-span-2">
                  <FieldRow label="Who it's for, and what makes you different" aside={fromSite.description ? <FromSite /> : <span className="text-[12px] font-normal text-faint">Optional</span>} hint="It makes the questions sharper.">
                    <textarea
                      rows={3}
                      value={draft.description}
                      onChange={(e) => {
                        descriptionTouched.current = e.target.value.trim() !== "";
                        setFromSite((f) => ({ ...f, description: false }));
                        setDraft({ ...draft, description: e.target.value });
                      }}
                      className={cx(inputClass, "h-auto py-2.5")}
                      placeholder="A CRM founders set up in 10 minutes, with no sales team needed."
                    />
                  </FieldRow>
                </div>
              </Section>
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
                <EnginePicker engines={engineOptions} value={chosenEngines} onChange={setEngines} />
              ) : enginesFailed ? (
                <p className="flex items-center gap-3 rounded-[12px] border border-dashed border-line-strong px-4 py-5 text-[13px] text-muted">
                  We couldn&apos;t load the AI engines.
                  <button type="button" onClick={retryEngines} className="font-medium text-ink underline underline-offset-2">Try again</button>
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-[52px] animate-pulse rounded-[12px] bg-sunken" />)}</div>
              )}
              <CreditEstimate prompts={typical} engines={chosenEngines} allowance={allowance} trial={trial} />
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
                  Your free scan asks the {active} ticked questions, the ones closest to a purchase. Swap any of them; plans track up to {MAX_PROMPTS}.
                </p>
              )}
              {full && (!full.onlyWhileEmpty || !active) && (
                <PoolFullNotice
                  pool={full.pool}
                  projectId={project.id}
                  message={full.onlyWhileEmpty ? `We wrote your questions but left them all unticked, because your plan's question limit is already used up. ${full.message}` : full.message}
                />
              )}
              <PromptGroups prompts={prompts} onToggle={togglePrompt} full={active >= (billing?.limits.active_prompts ?? Infinity)} />
              <form onSubmit={addPrompt} className="flex gap-2">
                <input name="text" required minLength={8} className={inputClass} placeholder="Add a question your buyers ask" aria-label="New question" />
                <button type="submit" className={cx(buttonClass("secondary"), "shrink-0")} aria-label="Add question">
                  <Plus size={14} weight="bold" />
                </button>
              </form>
              <CreditEstimate prompts={active} engines={chosenEngines} allowance={allowance} trial={trial} />
            </div>
            <StepFoot error={error}>
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
                <ArrowLeft size={13} /> Back
              </button>
              <span className="text-[13px] text-muted">
                <span className="font-medium text-ink tabular-nums">{formatCredits(monthlyCredits(active, chosenEngines, 1))}</span> credits in this scan
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
                      onClick={() => askUpgrade(`Your plan's question limit is reached. Paid plans track up to ${MAX_PROMPTS} questions.`, "active_prompts")}
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
