"use client";

import { ArrowRight, ChartLine, EnvelopeSimple, LockSimple, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProject } from "@/components/app/project-context";
import { useToast } from "@/components/app/toast";
import { buttonClass } from "@/components/ui/button";
import { useApi } from "@/lib/api/client";
import type { ReportSummary } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { siteHref } from "@/lib/urls";

/** The sections every report has, in order. The free trial sees them locked. */
export const REPORT_SECTIONS = [
  { title: "Where you stand", body: "Mention, recommendation and share-of-voice numbers, engine by engine." },
  { title: "Who AI recommends instead", body: "The brand AI picks on each question you lose." },
  { title: "Why AI skips you", body: "The reason AI gave on your biggest losses, quoted from the answer." },
  { title: "Sources AI trusts", body: "Sites AI cites for your competitors and not for you." },
  { title: "What to do first", body: "Ranked fixes, each with the evidence behind it." },
];

const seenKey = (reportId: number) => `seenlens:report-seen:${reportId}`;

// Reports come from the API, so this only runs in the browser.
function wasSeen(reportId: number) {
  try {
    return localStorage.getItem(seenKey(reportId)) === "1";
  } catch {
    return false;
  }
}

/** The first scan's answers to "what did you find, why, and what do I do first", shown once on the Overview. */
export type FirstScan = { found: string; why: string; actions: { id: number; title: string }[] };

/** Paid plans: "your report is ready" for the latest scan. The free trial: what the report holds, locked.
 * After the first scan both lead with the results in three short answers. */
export function ReportReady({ projectId, brand, first }: { projectId: string; brand: string; first?: FirstScan }) {
  const { billing } = useProject();
  if (!billing) return null;
  return billing.limits.pro ? <ReadyBanner projectId={projectId} first={first} /> : <LockedPreview brand={brand} projectId={projectId} first={first} />;
}

function FirstResults({ projectId, first, action }: { projectId: string; first: FirstScan; action: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-ink bg-surface">
      <div className="flex flex-col gap-3 bg-mark-soft/60 px-5 py-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold tracking-[-0.01em] text-ink">Your results are ready</p>
          <p className="mt-0.5 text-[13px] text-ink-2">What AI says about you today, why, and the first things to fix.</p>
        </div>
        {action}
      </div>
      <div className="grid divide-y divide-line border-t border-ink/15 md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="px-5 py-4">
          <p className="text-[12px] font-medium text-muted">What we found</p>
          <p className="mt-1 text-[14px] text-ink">{first.found}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[12px] font-medium text-muted">Why</p>
          <p className="mt-1 text-[14px] text-ink">{first.why}</p>
          <Link href={`/projects/${projectId}/prompts`} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-ink-2 hover:text-ink">
            Read the answers <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
        <div className="px-5 py-4">
          <p className="text-[12px] font-medium text-muted">What to do first</p>
          {first.actions.length ? (
            <ol className="mt-1 space-y-1 text-[14px] text-ink">
              {first.actions.map((a, i) => (
                <li key={a.id} className="flex gap-2">
                  <span className="font-mono text-[12px] leading-[21px] text-faint">{i + 1}</span>
                  <Link href={`/projects/${projectId}/opportunities`} className="hover:underline">{a.title}</Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-1 text-[14px] text-ink">Nothing urgent. AI recommends you wherever it recommends a competitor.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadyBanner({ projectId, first }: { projectId: string; first?: FirstScan }) {
  const toast = useToast();
  const { scans } = useProject();
  const scan = scans.find((s) => s.kind !== "retest" && (s.status === "completed" || s.status === "partial"));
  // The report is written a few seconds after the scan finishes, so look again until it lands.
  const [openedAt] = useState(() => Date.now());
  const recent = scan?.completed_at && openedAt - new Date(scan.completed_at).getTime() < 3 * 60_000;
  const { data } = useApi<ReportSummary[]>(`/projects/${projectId}/reports`, (d) =>
    recent && !d?.some((r) => r.scan_id === scan?.id) ? 3000 : undefined,
  );
  const report = data?.find((r) => r.scan_id === scan?.id) ?? null;
  const [dismissedId, setDismissedId] = useState<number | null>(null);
  const hadReport = useRef<boolean | null>(null);

  // Tell people who watched the scan finish, not people opening the page later.
  useEffect(() => {
    if (!data) return;
    if (hadReport.current === false && report) {
      toast.push(report.emailed_at ? "Your report is ready. We emailed you a copy." : "Your report is ready.", "success");
    }
    hadReport.current = Boolean(report);
  }, [data, report, toast]);

  if (first) {
    return (
      <FirstResults
        projectId={projectId}
        first={first}
        action={report ? (
          <Link href={`/projects/${projectId}/reports/${report.id}`} className={buttonClass("primary", "sm")}>
            View full report <ArrowRight size={14} weight="bold" />
          </Link>
        ) : data ? (
          <span className="text-[12px] text-muted">Writing your report...</span>
        ) : null}
      />
    );
  }

  if (!report || dismissedId === report.id || wasSeen(report.id)) return null;

  function dismiss() {
    try {
      localStorage.setItem(seenKey(report!.id), "1");
    } catch {}
    setDismissedId(report!.id);
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-ink bg-mark-soft/60 px-5 py-4 sm:flex-row sm:items-center">
      <span className="hidden size-10 shrink-0 place-items-center rounded-[12px] bg-surface text-ink sm:grid">
        <ChartLine size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">Your report is ready</p>
        <p className="mt-0.5 text-[13px] text-ink-2">
          {report.emailed_at ? (
            <span className="inline-flex items-center gap-1.5">
              <EnvelopeSimple size={14} /> We emailed you a copy {timeAgo(report.emailed_at)}.
            </span>
          ) : (
            "Where you stand, who AI picks instead, why, and what to fix first. Open it, download the PDF or share a link."
          )}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Link href={`/projects/${projectId}/reports/${report.id}`} onClick={dismiss} className={buttonClass("primary", "sm")}>
          View report <ArrowRight size={14} weight="bold" />
        </Link>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="grid size-8 place-items-center rounded-[8px] text-muted transition-colors hover:bg-sunken hover:text-ink">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function LockedPreview({ brand, projectId, first }: { brand: string; projectId: string; first?: FirstScan }) {
  const unlock = (
    <a href={siteHref("/pricing")} className={buttonClass("primary", "sm")}>
      Unlock the full report
    </a>
  );
  const locked = (
    <ol className="grid border-t border-ink/15 bg-surface/70 sm:grid-cols-5 sm:divide-x sm:divide-line">
      {REPORT_SECTIONS.map((s) => (
        <li key={s.title} className="flex gap-2.5 px-5 py-3 sm:flex-col sm:gap-1">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink">
            <LockSimple size={12} weight="bold" className="text-muted" /> {s.title}
          </span>
          <span className="hidden text-[11px] leading-snug text-muted sm:block">{s.body}</span>
        </li>
      ))}
    </ol>
  );
  if (first) {
    return (
      <div className="space-y-2">
        <FirstResults projectId={projectId} first={first} action={unlock} />
        <div className="overflow-hidden rounded-[16px] border border-line-strong">
          <p className="px-5 pt-3 pb-2 text-[12px] font-medium text-muted">In the full report, on Pro</p>
          {locked}
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-[16px] border border-ink bg-mark-soft/60">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink">Your free scan is ready. The full report is on Pro.</p>
          <p className="mt-0.5 text-[13px] text-ink-2">
            Pro turns every scan of {brand} into a report you can read, forward and download, and emails it to you.
            Plans from $20 a month.
          </p>
        </div>
        {unlock}
      </div>
      {locked}
    </div>
  );
}
