"use client";

import { ArrowRight, CircleNotch, Link as LinkIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { ErrorBanner, Field, inputClass } from "@/components/app/ui";
import { EngineIcon } from "@/components/product/engine-icon";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import type { FreeCheck } from "@/lib/api/types";
import { cx } from "@/lib/cx";

type Answer = NonNullable<FreeCheck["result"]>["prompts"][number]["answers"][number];

function Verdict({ a }: { a: Answer }) {
  const label = a.recommended ? "Recommended" : a.mentioned ? "Mentioned" : "Not mentioned";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        a.recommended ? "bg-up-soft text-up-ink" : a.mentioned ? "bg-blue-soft text-blue-ink" : "border border-dashed border-line-strong text-muted",
      )}
    >
      {label}
      {a.position != null && <span className="font-mono opacity-70">#{a.position}</span>}
    </span>
  );
}

function Result({ check }: { check: FreeCheck }) {
  const r = check.result!;
  const { answers, mentioned, recommended } = r.summary;
  const verdict =
    recommended > 0
      ? `AI recommended ${check.brand_name} in ${recommended} of ${answers} answers.`
      : mentioned > 0
        ? `AI mentioned ${check.brand_name} in ${mentioned} of ${answers} answers, but never recommended it.`
        : `AI did not mention ${check.brand_name} in any of ${answers} answers.`;
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-night p-7 text-white md:p-9">
        <p className="text-[13px] text-white/50">
          {check.website} · {check.category} · {check.country}
          {r.simulated && " · sample answers (no AI key on this server)"}
        </p>
        <p className="mt-3 font-display text-[28px] leading-tight font-semibold tracking-[-0.03em] md:text-[34px]">{verdict}</p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            ["Answers", answers],
            ["Mentioned", mentioned],
            ["Recommended", recommended],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[14px] bg-white/[0.06] px-3 py-4">
              <p className="font-mono text-[28px] tabular-nums">{value}</p>
              <p className="text-[12px] text-white/55">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-line-strong bg-surface">
        {r.prompts.map((p, i) => (
          <div key={p.text} className={cx("px-5 py-4", i > 0 && "border-t border-line")}>
            <p className="text-[15px] text-ink">&ldquo;{p.text}&rdquo;</p>
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
              {p.answers.map((a) => (
                <span key={a.engine} className="flex items-center gap-2 text-[13px] text-ink-2">
                  <EngineIcon engine={a.engine} size={13} /> {a.engine_name} <Verdict a={a} />
                </span>
              ))}
            </div>
            {p.answers.filter((a) => a.evidence).slice(0, 1).map((a) => (
              <p key={a.engine} className="mt-2 rounded-[10px] bg-mark-soft/60 px-3 py-2 text-[13px] text-ink-2">{a.evidence}</p>
            ))}
          </div>
        ))}
      </div>

      {r.top_sources.length > 0 && (
        <div className="rounded-[20px] border border-line-strong bg-surface px-5 py-4">
          <p className="text-[13px] font-medium text-ink">Sources AI cited</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {r.top_sources.map((s) => (
              <li key={s.domain} className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-[12px] text-ink-2">
                <LinkIcon size={12} /> {s.domain} <span className="text-faint">×{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col items-start gap-4 rounded-[20px] border border-line-strong bg-surface p-6 md:flex-row md:items-center">
        <div>
          <p className="text-[16px] font-medium text-ink">This was 5 questions on 2 engines, once.</p>
          <p className="text-[14px] text-muted">Track up to 160 questions on ChatGPT, Perplexity, Gemini and Google AI every week, against your competitors.</p>
        </div>
        <a href="/pricing" className={cx(buttonClass("primary"), "shrink-0 md:ml-auto")}>
          See plans <ButtonArrow />
        </a>
      </div>
    </div>
  );
}

export function FreeCheckForm() {
  const [check, setCheck] = useState<FreeCheck | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = check && (check.status === "queued" || check.status === "running");

  // The check runs in the background; poll until it is done.
  useEffect(() => {
    if (!pending || !check) return;
    const t = window.setInterval(async () => {
      const res = await fetch(`/api/free-check/${check.id}`).catch(() => null);
      if (res?.ok) setCheck(await res.json());
    }, 2000);
    return () => window.clearInterval(t);
  }, [pending, check]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/free-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Something went wrong.");
      setCheck(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (check?.status === "done" && check.result) return <Result check={check} />;

  return (
    <div className="rounded-[24px] border border-line-strong bg-surface p-6 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.3)] md:p-8">
      {pending ? (
        <div className="flex flex-col items-center py-10 text-center">
          <CircleNotch size={28} className="animate-spin" />
          <p className="mt-4 text-[16px] font-medium text-ink">Asking ChatGPT and Perplexity about {check!.category}…</p>
          <p className="mt-1 text-[14px] text-muted">Usually under a minute. Keep this page open.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Brand name">
            <input name="brand_name" required maxLength={120} className={inputClass} placeholder="Halden" />
          </Field>
          <Field label="Website">
            <input name="website" required maxLength={300} className={inputClass} placeholder="halden.co" />
          </Field>
          <Field label="What you sell" hint="The category buyers search for, e.g. CRM software.">
            <input name="category" required maxLength={120} className={inputClass} placeholder="CRM software" />
          </Field>
          <Field label="Market">
            <input name="country" maxLength={80} defaultValue="United States" className={inputClass} />
          </Field>
          {(error || check?.status === "failed") && (
            <div className="md:col-span-2">
              <ErrorBanner message={error || "The check could not finish. Please try again."} />
            </div>
          )}
          <div className="md:col-span-2">
            <button type="submit" disabled={busy} className={cx(buttonClass("primary"), "w-full md:w-auto")}>
              {busy ? <CircleNotch size={16} className="animate-spin" /> : null}
              Run free check <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
