"use client";

import { ArrowRight, ChartLine, EnvelopeSimple, Lightbulb, LockSimple, X } from "@phosphor-icons/react";
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
export type FirstScan = {
  mention: number;
  recommend: number;
  answers: number;
  rank: number;
  brands: { name: string; mention: number; isYou: boolean; color: string }[]; // most named first
  why: string;
  actions: { id: number; title: string; impact: "high" | "medium" | "low" }[];
};

const pct = (v: number) => `${Math.round(v * 100)}%`;
const IMPACT = {
  high: { label: "High impact", className: "bg-up-soft text-up-ink" },
  medium: { label: "Medium", className: "bg-amber-soft text-amber-ink" },
  low: { label: "Low", className: "bg-sunken text-muted" },
};

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-0.5 font-mono text-[30px] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">{pct(value)}</p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sunken">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(value > 0 ? 3 : 0, Math.round(value * 100))}%` }} />
      </div>
    </div>
  );
}

/** Paid plans: "your report is ready" for the latest scan. The free trial: what the report holds, locked.
 * After the first scan both lead with the results in three short answers. */
export function ReportReady({ projectId, brand, first }: { projectId: string; brand: string; first?: FirstScan }) {
  const { billing } = useProject();
  if (!billing) return null;
  return billing.limits.pro ? <ReadyBanner projectId={projectId} first={first} /> : <LockedPreview brand={brand} projectId={projectId} first={first} />;
}

function FirstResults({ projectId, first, action }: { projectId: string; first: FirstScan; action: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-line-strong bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      <div className="flex flex-col gap-3 border-b border-line bg-mark-soft/60 px-5 py-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
            <span className="size-1.5 rounded-full bg-mark-strong" /> First scan · {first.answers} AI answers read
          </p>
          <p className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink">Your results are ready</p>
          <p className="mt-0.5 text-[13px] text-ink-2">What AI says about you today, why, and the first things to fix.</p>
        </div>
        {action}
      </div>
      <div className="grid divide-y divide-line lg:grid-cols-[1fr_1fr_1.25fr] lg:divide-x lg:divide-y-0">
        <section className="px-5 py-5">
          <h3 className="text-[12px] font-medium text-muted">What we found</h3>
          <div className="mt-3 grid grid-cols-2 gap-5">
            <Stat label="Mentioned" value={first.mention} tone="bg-ink" />
            <Stat label="Recommended" value={first.recommend} tone="bg-mark-strong" />
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[12px] text-muted">
              How often AI names each brand · you rank <span className="font-medium text-ink">#{first.rank} of {first.brands.length}</span>
            </p>
            <ul className="mt-2.5 space-y-2">
              {first.brands.slice(0, 4).map((b) => (
                <li key={b.name} className="grid grid-cols-[minmax(0,6.5rem)_1fr_2.5rem] items-center gap-3 text-[13px]">
                  <span className={`truncate ${b.isYou ? "font-semibold text-ink" : "text-ink-2"}`}>{b.isYou ? `${b.name} (you)` : b.name}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-sunken">
                    <span className="block h-full rounded-full" style={{ width: `${Math.max(b.mention > 0 ? 3 : 0, Math.round(b.mention * 100))}%`, background: b.color }} />
                  </span>
                  <span className="text-right font-mono text-[12px] text-ink tabular-nums">{pct(b.mention)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="px-5 py-5">
          <h3 className="text-[12px] font-medium text-muted">Why</h3>
          <div className="mt-3 flex gap-3">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px] bg-amber-soft text-amber-ink">
              <Lightbulb size={15} weight="bold" />
            </span>
            <p className="text-[14px] leading-relaxed text-ink">{first.why}</p>
          </div>
          <Link href={`/projects/${projectId}/prompts`} className="mt-3 ml-10 inline-flex items-center gap-1 text-[12px] font-medium text-ink-2 hover:text-ink">
            Read the answers <ArrowRight size={12} weight="bold" />
          </Link>
        </section>
        <section className="px-3 py-3 sm:px-5 sm:py-5">
          <h3 className="px-2 text-[12px] font-medium text-muted sm:px-0">What to do first</h3>
          {first.actions.length ? (
            <ol className="mt-2 space-y-0.5">
              {first.actions.map((a, i) => (
                <li key={a.id}>
                  <Link
                    href={`/projects/${projectId}/opportunities`}
                    className="group -mx-2 flex items-start gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-sunken"
                  >
                    <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-ink font-mono text-[11px] font-medium text-white">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] leading-snug text-ink">{a.title}</span>
                      <span className={`mt-1 inline-block rounded-full px-1.5 py-px text-[10.5px] font-medium ${IMPACT[a.impact].className}`}>{IMPACT[a.impact].label}</span>
                    </span>
                    <ArrowRight size={14} className="mt-1 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 px-2 text-[14px] text-ink sm:px-0">Nothing urgent. AI recommends you wherever it recommends a competitor.</p>
          )}
        </section>
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
