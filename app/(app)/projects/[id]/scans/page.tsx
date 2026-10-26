"use client";

import { ArrowRight, ArrowsClockwise, ChatsCircle, CheckCircle, CircleNotch, ClockCounterClockwise, Gauge, Globe, ListMagnifyingGlass, Play, Scales, ShieldCheck, Stack, Warning, XCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { isScanActive, useProject } from "@/components/app/project-context";
import { Card, EmptyState, PageHeader, Skeleton, StatStrip } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import type { Scan } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { timeAgo } from "@/lib/format";

const STATUS = {
  completed: { label: "Completed", icon: CheckCircle, tone: "text-up" },
  partial: { label: "Partial", icon: Warning, tone: "text-[#a16207]" },
  failed: { label: "Failed", icon: XCircle, tone: "text-down" },
  running: { label: "Running", icon: CircleNotch, tone: "text-ink" },
  queued: { label: "Queued", icon: CircleNotch, tone: "text-muted" },
} as const;

function duration(scan: Scan) {
  if (!scan.started_at || !scan.completed_at) return null;
  const s = Math.round((new Date(scan.completed_at).getTime() - new Date(scan.started_at).getTime()) / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

const HOW = [
  { icon: ChatsCircle, title: "We ask", body: "Every active prompt goes to ChatGPT, Perplexity and Gemini, exactly as a buyer would type it." },
  { icon: ListMagnifyingGlass, title: "We read the answers", body: "Who is mentioned, who is recommended, in what position, with what tone, and which sources are cited." },
  { icon: Scales, title: "We compare", body: "Your numbers against every competitor, then the gaps become ranked opportunities." },
  { icon: Globe, title: "We check your site", body: "Whether AI crawlers can reach and read your pages, so technical blockers show up too." },
];
const RELIABLE = [
  { icon: ArrowsClockwise, title: "Failed calls retry", body: "After 30 seconds, then 2 minutes, then 10 minutes, before a single answer is given up on." },
  { icon: Warning, title: "Partial is not lost", body: "A scan with a few failures finishes as partial and keeps every answer it collected." },
  { icon: ShieldCheck, title: "It survives restarts", body: "If a worker dies mid-scan, the scan resumes where it stopped and never repeats a finished call." },
  { icon: Gauge, title: "Cost stays predictable", body: "Up to 20 scans per project per day, and a project can only run one scan at a time." },
];

function ScanExtras() {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {[
        { title: "What happens in a scan", subtitle: "Four steps, about a minute", items: HOW },
        { title: "Built to keep going", subtitle: "What protects your data and your bill", items: RELIABLE },
      ].map((group) => (
        <Card key={group.title} title={group.title} subtitle={group.subtitle} className="flex flex-col">
          <ul className="flex flex-1 flex-col divide-y divide-line">
            {group.items.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex flex-1 items-center gap-3.5 px-5 py-3.5">
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
        </Card>
      ))}
    </div>
  );
}

export default function ScansPage() {
  const { id } = useParams<{ id: string }>();
  const { scans, latestScan, starting, startScan, projectsLoading } = useProject();
  const finished = scans.filter((s) => s.status === "completed" || s.status === "partial");
  const answers = finished.reduce((sum, s) => sum + s.completed_runs, 0);
  const healthy = scans.length ? Math.round((scans.filter((s) => s.status === "completed").length / scans.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Scan history"
        description="Every time we asked the AI engines your questions. Open a scan to see each answer."
        actions={
          <button type="button" onClick={startScan} disabled={starting || isScanActive(latestScan)} className={buttonClass("primary", "sm")}>
            {isScanActive(latestScan) ? <CircleNotch size={14} className="animate-spin" /> : <Play size={14} weight="fill" />} {isScanActive(latestScan) ? "Scanning" : "Run scan"}
          </button>
        }
      />

      <StatStrip
        stats={[
          { label: "Scans", value: scans.length, hint: "since you started", icon: <Stack size={18} />, tone: "blue" },
          { label: "Answers collected", value: answers.toLocaleString(), hint: "across all engines", icon: <CheckCircle size={18} />, tone: "violet" },
          { label: "Completed cleanly", value: `${healthy}%`, hint: "no failed calls", icon: <ClockCounterClockwise size={18} />, tone: "green" },
          { label: "Latest", value: latestScan ? `#${latestScan.id}` : "none", hint: latestScan ? timeAgo(latestScan.completed_at ?? latestScan.created_at) : "run your first scan", icon: <ArrowRight size={18} />, tone: "amber" },
        ]}
      />

      {projectsLoading && !scans.length ? (
        <Skeleton className="h-72" />
      ) : scans.length === 0 ? (
        <Card>
          <EmptyState icon={<ClockCounterClockwise size={30} />} title="No scans yet" body="Your first scan asks ChatGPT, Perplexity and Gemini every active prompt. It takes about a minute." action={<button type="button" onClick={startScan} disabled={starting} className={buttonClass("primary", "sm")}><Play size={14} weight="fill" /> Run first scan</button>} />
        </Card>
      ) : (
        <Card>
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.2fr_28px] gap-x-4 border-b border-line px-5 py-2 text-[11px] text-muted md:grid">
            <span>Scan</span>
            <span>Started</span>
            <span>Duration</span>
            <span>Answers</span>
            <span />
          </div>
          <ul className="divide-y divide-line">
            {scans.map((scan) => {
              const s = STATUS[scan.status];
              const Icon = s.icon;
              const done = scan.completed_runs + scan.failed_runs;
              return (
                <li key={scan.id}>
                  <Link href={`/projects/${id}/scans/${scan.id}`} className="group grid items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-[#fbfbfa] md:grid-cols-[1.4fr_1fr_1fr_1.2fr_28px]">
                    <span className="flex items-center gap-3">
                      <Icon size={20} weight="fill" className={cx(s.tone, (scan.status === "running" || scan.status === "queued") && "animate-spin")} />
                      <span>
                        <span className="block text-[13px] font-medium text-ink">Scan #{scan.id}</span>
                        <span className="block text-[11px] text-muted">
                          {s.label}
                          {scan.simulated ? " · sample data" : ""}
                        </span>
                      </span>
                    </span>
                    <span className="text-[13px] text-ink-2">{new Date(scan.started_at ?? scan.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="font-mono text-[13px] text-ink-2">{duration(scan) ?? "-"}</span>
                    <span>
                      <span className="flex items-center gap-2 font-mono text-[13px] text-ink">
                        {scan.completed_runs}/{scan.total_runs}
                        {scan.failed_runs > 0 && <span className="text-[11px] text-down">{scan.failed_runs} failed</span>}
                      </span>
                      <span className="mt-1.5 block h-1 rounded-full bg-sunken">
                        <span className="block h-full rounded-full bg-mark-strong" style={{ width: `${scan.total_runs ? Math.max(3, (done / scan.total_runs) * 100) : 0}%` }} />
                      </span>
                    </span>
                    <ArrowRight size={14} className="hidden text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink md:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <ScanExtras />
    </>
  );
}
