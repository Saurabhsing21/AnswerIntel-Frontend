"use client";

import { ArrowClockwise, Info, Play } from "@phosphor-icons/react";
import { useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { Scan } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { ErrorBanner } from "@/components/app/ui";
import { cx } from "@/lib/cx";

const STEPS = ["Preparing scan", "Asking AI engines", "Analyzing answers", "Calculating visibility"];

export function isActive(scan: Scan | null | undefined) {
  return scan?.status === "queued" || scan?.status === "running";
}

export function ScanBanner({ projectId, scan, onStarted }: { projectId: string; scan: Scan | null; onStarted: () => void }) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setStarting(true);
    setError("");
    try {
      await api(`/projects/${projectId}/scans`, { method: "POST" });
      onStarted();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setStarting(false);
    }
  }

  const active = isActive(scan);
  const step = !scan ? 0 : scan.status === "queued" ? 0 : scan.progress < 1 ? 1 : 3;

  return (
    <div className="mb-6 space-y-3">
      {scan?.simulated && (
        <div className="flex items-start gap-2 rounded-[12px] border border-dashed border-line-strong bg-surface px-4 py-3 text-[13px] text-ink-2">
          <Info size={16} className="mt-px shrink-0" />
          <span>
            <strong className="font-medium text-ink">Simulated data.</strong> No AI provider key is configured, so these answers are generated
            locally. Add <code className="rounded bg-sunken px-1 font-mono text-[12px]">OPENROUTER_API_KEY</code> to the API to scan real engines.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-[16px] border border-line-strong bg-surface p-4 sm:flex-row sm:items-center">
        {active && scan ? (
          <div className="min-w-0 flex-1" aria-live="polite">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-ink/40" />
                <span className="relative size-2 rounded-full bg-ink" />
              </span>
              <span className="font-medium text-ink">{STEPS[step]}</span>
              <span className="ml-auto font-mono text-[12px] text-muted">
                {scan.completed_runs + scan.failed_runs}/{scan.total_runs}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sunken">
              <div className="h-full rounded-full bg-ink transition-[width] duration-700 ease-out" style={{ width: `${Math.max(3, scan.progress * 100)}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
              {STEPS.map((s, i) => (
                <span key={s} className={cx(i < step && "text-ink", i === step && "font-medium text-ink")}>
                  {i < step ? "✓ " : ""}
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1 text-[13px]">
            {scan ? (
              <>
                <span className="font-medium text-ink">
                  Last scan {scan.status === "completed" ? "completed" : scan.status === "partial" ? "partially completed" : "failed"}
                </span>{" "}
                <span className="text-muted">
                  {timeAgo(scan.completed_at ?? scan.created_at)} · {scan.completed_runs} answers
                  {scan.failed_runs ? `, ${scan.failed_runs} failed` : ""}
                </span>
                {scan.status !== "completed" && scan.error_message && <p className="mt-1 text-[12px] text-down">{scan.error_message}</p>}
              </>
            ) : (
              <span className="text-muted">No scans yet. Run your first scan to see how AI talks about you.</span>
            )}
          </div>
        )}
        <button type="button" onClick={start} disabled={active || starting} className={cx(buttonClass("primary", "sm"), "shrink-0")}>
          {scan ? <ArrowClockwise size={14} weight="bold" /> : <Play size={14} weight="fill" />}
          {active ? "Scan running" : starting ? "Starting..." : scan ? "Run new scan" : "Run first scan"}
        </button>
      </div>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}
