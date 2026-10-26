"use client";

import { ArrowLeft, Check, CircleNotch, Sparkle, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { ErrorBanner, inputClass } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { Prompt } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { CATEGORY_LABELS } from "@/lib/format";

type Suggestion = { text: string; category: string; intent: string; importance: number | null };

const IDEAS = ["Pricing and cost questions", "Questions from small agencies", "Switching from a competitor", "Integrations with Slack and HubSpot", "Questions a CFO would ask"];
const COUNTS = [5, 10, 20];

/** "Generate more": the user says what kind of prompts they want, reviews what we write, and keeps only the good ones. */
export function GeneratePrompts({ projectId, open, onClose, onAdded }: { projectId: string; open: boolean; onClose: () => void; onAdded: (prompts: Prompt[], inactive: number) => void }) {
  const [instructions, setInstructions] = useState("");
  const [count, setCount] = useState(10);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [kept, setKept] = useState<Set<number>>(new Set());
  const [sample, setSample] = useState(false);
  const [busy, setBusy] = useState<"" | "writing" | "adding">("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function write(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy("writing");
    setError("");
    try {
      const r = await api<{ prompts: Suggestion[]; sample: boolean }>(`/projects/${projectId}/prompts/suggest`, { method: "POST", json: { instructions, count } });
      setSuggestions(r.prompts);
      setKept(new Set(r.prompts.map((_, i) => i)));
      setSample(r.sample);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy("");
    }
  }

  async function add() {
    if (!suggestions) return;
    setBusy("adding");
    setError("");
    try {
      const chosen = suggestions.filter((_, i) => kept.has(i));
      const r = await api<{ prompts: Prompt[]; inactive: number }>(`/projects/${projectId}/prompts/accept`, { method: "POST", json: { prompts: chosen } });
      onAdded(r.prompts, r.inactive);
      reset();
      onClose();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy("");
    }
  }

  function reset() {
    setSuggestions(null);
    setKept(new Set());
    setError("");
  }

  const toggle = (i: number) => setKept((s) => {
    const next = new Set(s);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Generate prompts">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/20" />
      <div className="relative flex h-full w-full max-w-[560px] flex-col border-l border-line-strong bg-surface shadow-2xl">
        <header className="flex items-center gap-2 border-b border-line px-5 py-4">
          {suggestions && (
            <button type="button" onClick={reset} className="grid size-8 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink" aria-label="Back to instructions">
              <ArrowLeft size={15} />
            </button>
          )}
          <Sparkle size={16} weight="fill" className="text-ink" />
          <span className="text-[14px] font-medium">{suggestions ? "Review new prompts" : "Generate prompts"}</span>
          <button type="button" onClick={onClose} className="ml-auto grid size-8 place-items-center rounded-full hover:bg-sunken" aria-label="Close">
            <X size={15} />
          </button>
        </header>

        {!suggestions ? (
          <form onSubmit={write} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div>
                <label htmlFor="instructions" className="text-[14px] font-medium text-ink">What kind of prompts do you want?</label>
                <p className="mt-0.5 text-[13px] text-muted">Describe a topic, an audience or a buying moment. We write buyer questions around it, using your brand, market and competitors.</p>
                <textarea
                  id="instructions"
                  autoFocus
                  required
                  minLength={3}
                  maxLength={300}
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className={cx(inputClass, "mt-3 h-auto py-2.5")}
                  placeholder="e.g. Questions small marketing agencies ask when they outgrow spreadsheets"
                />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {IDEAS.map((idea) => (
                    <button key={idea} type="button" onClick={() => setInstructions(idea)} className="rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:border-line-strong hover:text-ink">
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink">How many</p>
                <div className="mt-2 inline-flex rounded-full bg-sunken p-1">
                  {COUNTS.map((n) => (
                    <button key={n} type="button" onClick={() => setCount(n)} aria-pressed={count === n}
                      className={cx("rounded-full px-3.5 py-1 text-[13px] transition-colors", count === n ? "bg-surface font-medium text-ink shadow-sm" : "text-muted hover:text-ink")}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {error && <ErrorBanner message={error} />}
            </div>
            <footer className="flex items-center gap-3 border-t border-line bg-[#fbfbfa] px-5 py-4">
              <span className="text-[12px] text-muted">Nothing is added until you pick.</span>
              <button type="submit" disabled={!!busy || instructions.trim().length < 3} className={cx(buttonClass("primary", "sm"), "ml-auto")}>
                {busy ? <CircleNotch size={14} className="animate-spin" /> : <Sparkle size={14} weight="fill" />}
                {busy ? "Writing..." : "Generate"}
              </button>
            </footer>
          </form>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              <p className="text-[13px] text-muted">
                For <span className="font-medium text-ink">&ldquo;{instructions}&rdquo;</span>. Untick any you don&apos;t want.
              </p>
              {sample && <p className="rounded-[10px] bg-amber-soft px-3 py-2 text-[12px] text-amber-ink">Simple stand-ins for now. Real AI-written prompts appear once an AI key is connected.</p>}
              {suggestions.length === 0 ? (
                <p className="rounded-[12px] border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-muted">
                  Everything we came up with is already in your list. Try different instructions.
                </p>
              ) : (
                <ul className="divide-y divide-line overflow-hidden rounded-[12px] border border-line">
                  {suggestions.map((s, i) => {
                    const on = kept.has(i);
                    return (
                      <li key={s.text}>
                        <button type="button" onClick={() => toggle(i)} aria-pressed={on}
                          className={cx("flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors", on ? "bg-surface" : "bg-[#fbfbfa]")}>
                          <span className={cx("mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors", on ? "border-mark-strong bg-mark text-ink" : "border-line-strong")}>
                            {on && <Check size={11} weight="bold" />}
                          </span>
                          <span className={cx("min-w-0 flex-1 text-[14px]", on ? "text-ink" : "text-faint line-through")}>{s.text}</span>
                          <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{CATEGORY_LABELS[s.category] ?? s.category}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {error && <ErrorBanner message={error} />}
            </div>
            <footer className="flex items-center gap-3 border-t border-line bg-[#fbfbfa] px-5 py-4">
              <button type="button" onClick={() => write()} disabled={!!busy} className="text-[13px] font-medium text-muted hover:text-ink">
                {busy === "writing" ? "Writing..." : "Try again"}
              </button>
              <button type="button" onClick={() => { reset(); onClose(); }} disabled={!!busy} className={cx(buttonClass("secondary", "sm"), "ml-auto")}>
                Discard
              </button>
              <button type="button" onClick={add} disabled={!!busy || kept.size === 0} className={buttonClass("primary", "sm")}>
                {busy === "adding" && <CircleNotch size={14} className="animate-spin" />}
                Add {kept.size} prompt{kept.size === 1 ? "" : "s"}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
