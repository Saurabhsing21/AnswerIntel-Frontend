"use client";

import { ArrowRight, Check, CircleNotch, Hash, ListChecks, Play, Target, Trophy, Users } from "@phosphor-icons/react";
import Link from "next/link";
import { isScanActive } from "@/components/app/project-context";
import { Card } from "@/components/app/ui";
import { AppFrame } from "@/components/product/app-frame";
import { EngineIcon } from "@/components/product/engine-icon";
import { buttonClass } from "@/components/ui/button";
import type { Scan } from "@/lib/api/types";
import { cx } from "@/lib/cx";

type Step = { key: string; title: string; body: string; icon: typeof Users; done: boolean; href?: string; action: string; onAction?: () => void };

/** Shown until the first scan finishes: three steps, each with its own action. */
export function GetStarted({
  projectId,
  counts,
  scan,
  starting,
  onStartScan,
}: {
  projectId: string;
  counts: { competitors: number; active_prompts: number };
  scan: Scan | null;
  starting: boolean;
  onStartScan: () => void;
}) {
  const scanning = isScanActive(scan);
  const steps: Step[] = [
    { key: "competitors", title: "Add your competitors", body: "Up to five brands you lose deals to. AI answers are compared against them.", icon: Users, done: counts.competitors > 0, href: `/projects/${projectId}/competitors?add=1`, action: "Add competitors" },
    { key: "prompts", title: "Generate buyer questions", body: "We write the questions your buyers ask AI, then you edit or switch off any of them.", icon: Hash, done: counts.active_prompts > 0, href: `/projects/${projectId}/prompts`, action: "Generate prompts" },
    { key: "scan", title: "Run your first scan", body: "Every question goes to ChatGPT, Perplexity and Gemini. It takes about a minute.", icon: Play, done: Boolean(scan && !scanning && scan.status !== "failed"), action: "Run first scan", onAction: onStartScan },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const current = steps.findIndex((s) => !s.done);

  return (
    <div className="space-y-6">
    <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
      <Card title="Get your first AI visibility report" subtitle={`${doneCount} of ${steps.length} steps done`}>
        <div className="h-1 bg-sunken" role="progressbar" aria-label="Setup progress" aria-valuenow={doneCount} aria-valuemax={steps.length}>
          <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
        <ol className="divide-y divide-line">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isCurrent = i === current;
            return (
              <li key={s.key} className={cx("flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-5", isCurrent && "bg-[#fafaf9]")}>
                <span className={cx("grid size-10 shrink-0 place-items-center rounded-[12px]", s.done ? "bg-ink text-white" : "bg-sunken text-ink-2")}>
                  {s.done ? <Check size={18} weight="bold" /> : <Icon size={20} />}
                </span>
                <div className="min-w-0 flex-1 basis-[220px]">
                  <p className="text-[14px] font-medium text-ink">{s.title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{s.body}</p>
                  {s.key === "scan" && scanning && scan && (
                    <div className="mt-2.5" aria-live="polite">
                      <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
                        <div className="h-full rounded-full bg-ink transition-[width] duration-700" style={{ width: `${Math.max(4, scan.progress * 100)}%` }} />
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        {scan.completed_runs + scan.failed_runs}/{scan.total_runs} answers
                      </p>
                    </div>
                  )}
                </div>
                {!s.done && (
                  <div className="shrink-0">
                    {s.href ? (
                      <Link href={s.href} className={buttonClass(isCurrent ? "primary" : "secondary", "sm")}>
                        {s.action}
                        <ArrowRight size={14} weight="bold" />
                      </Link>
                    ) : (
                      <button type="button" onClick={s.onAction} disabled={scanning || starting || current !== i} className={buttonClass(isCurrent ? "primary" : "secondary", "sm")}>
                        {scanning || starting ? <CircleNotch size={14} className="animate-spin" /> : <Play size={14} weight="fill" />}
                        {scanning ? "Scanning" : s.action}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      <Card title="What you will get" subtitle="From one scan of your questions" className="flex flex-col">
        <ul className="flex flex-1 flex-col divide-y divide-line">
          {[
            { icon: Trophy, title: "Your standing against rivals", body: "How often AI mentions you, how often it recommends you, and your share of voice." },
            { icon: Target, title: "The questions you lose", body: "Every prompt where a competitor wins, and the sources AI trusts when it picks them." },
            { icon: ListChecks, title: "A ranked list of fixes", body: "Concrete actions with the evidence behind each one, so you know what to do first." },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-1 items-center gap-3.5 px-5 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-sunken text-ink-2">
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-[13px] font-medium text-ink">{title}</span>
                <span className="block text-[12px] text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 border-t border-line px-5 py-3 text-[12px] text-muted">
          <span className="flex gap-1.5">
            {(["chatgpt", "perplexity", "gemini"] as const).map((e) => (
              <span key={e} className="grid size-6 place-items-center rounded-full border border-line">
                <EngineIcon engine={e} size={11} />
              </span>
            ))}
          </span>
          Asks ChatGPT, Perplexity and Gemini
        </div>
      </Card>
    </div>

    <section aria-label="Dashboard preview">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="font-medium text-ink">This is what your dashboard will look like</span>
        <span className="rounded-[6px] border border-dashed border-line-strong px-2 py-0.5 text-[11px] text-muted">Sample data</span>
      </div>
      <AppFrame />
    </section>
    </div>
  );
}
