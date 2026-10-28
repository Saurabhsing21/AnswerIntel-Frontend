"use client";

import { ArrowRight, CalendarCheck, ChartLine, CircleNotch, EnvelopeSimple, FilePdf, LinkSimple, Plus, ShareNetwork } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { PdfButton } from "@/components/app/pdf-button";
import { useProject } from "@/components/app/project-context";
import { REPORT_SECTIONS } from "@/components/app/report-ready";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, PageHeader, Skeleton, StatStrip } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Report, ReportSummary, ReportType } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { askUpgrade, ProBadge, usePro } from "@/components/app/pro-lock";
import { pct, REPORT_LABELS, timeAgo } from "@/lib/format";
import { formatHour, WEEKDAYS } from "@/lib/schedule";

const range = (r: ReportSummary) => {
  const f = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${f(r.period_start)} to ${f(r.period_end)}`;
};

/** Always shown under the list: what a report holds and the ways to send it. */
function ReportExtras({ projectId, weeklyOn }: { projectId: string; weeklyOn: boolean }) {
  const ways = [
    { icon: LinkSimple, title: "Private link", body: "No account needed; revoke any time" },
    { icon: FilePdf, title: "PDF", body: "13 pages, ready for an investor update" },
    { icon: EnvelopeSimple, title: "Email", body: "Sent to you after every scan" },
  ];
  return (
    <div className="mt-4 overflow-hidden rounded-[16px] border border-line-strong bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
        <p className="text-[14px] font-medium text-ink">Inside every report</p>
        <p className="text-[12px] text-muted">Built from the scan it belongs to, and never changed afterwards</p>
      </div>
      <ol className="mt-3 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-5">
        {REPORT_SECTIONS.map((section, i) => (
          <li key={section.title} className="bg-surface px-5 py-4">
            <span className="font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-1 text-[13px] font-medium text-ink">{section.title}</p>
            <p className="mt-0.5 text-[12px] leading-snug text-muted">{section.body}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 border-t border-line bg-[#fafaf9] px-5 py-3.5 md:flex-row md:items-center">
        <p className="text-[12px] font-medium text-ink-2">Send it</p>
        <ul className="flex flex-1 flex-wrap gap-x-6 gap-y-2">
          {ways.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-2 text-[12px]">
              <Icon size={15} className="text-ink-2" />
              <span className="font-medium text-ink">{title}</span>
              <span className="text-muted">{body}</span>
            </li>
          ))}
        </ul>
        {!weeklyOn && (
          <Link href={`/projects/${projectId}/settings`} className="text-[12px] font-medium text-ink-2 hover:text-ink">
            Turn on weekly scans
          </Link>
        )}
      </div>
    </div>
  );
}

const scoreTone = (score: number) =>
  score < 10 ? "bg-down-soft text-down-ink" : score < 30 ? "bg-amber-soft text-amber-ink" : score < 60 ? "bg-blue-soft text-blue-ink" : "bg-up-soft text-up-ink";

function Change({ now, before }: { now: number; before?: number }) {
  if (before == null) return null;
  const pts = Math.round((now - before) * 100);
  if (pts === 0) return <span className="font-mono text-[11px] text-faint">±0</span>;
  return <span className={cx("font-mono text-[11px]", pts > 0 ? "text-up-ink" : "text-down-ink")}>{pts > 0 ? "+" : ""}{pts}</span>;
}

function ReportsInner() {
  const { id } = useParams<{ id: string }>();
  const pro = usePro();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { schedule, scans } = useProject();
  const { data, loading, error, reload } = useApi<ReportSummary[]>(`/projects/${id}/reports`);
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const started = useRef(false);
  const hasData = scans.some((s) => s.status === "completed" || s.status === "partial");

  async function generate(type: ReportType) {
    setGenerating(type);
    try {
      const report = await api<Report>(`/projects/${id}/reports`, { method: "POST", json: { type } });
      toast.push(`${REPORT_LABELS[type]} created.`, "success");
      router.push(`/projects/${id}/reports/${report.id}`);
    } catch (e) {
      toast.push((e as ApiError).message, "error");
      setGenerating(null);
    }
  }

  // Arriving from "Generate a weekly report" (quick search or the Overview) creates it straight away.
  const requested = params.get("new");
  useEffect(() => {
    if (!requested || started.current || !["weekly", "monthly", "manual"].includes(requested)) return;
    started.current = true;
    void generate(requested as ReportType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested]);

  async function copyLink(r: ReportSummary) {
    try {
      const { token } = await api<{ token: string }>(`/projects/${id}/reports/${r.id}/share`, { method: "POST" });
      await navigator.clipboard.writeText(`${window.location.origin}/api/shared/${token}?format=html`);
      toast.push("Link copied. Anyone with it can read this report.", "success");
      reload();
    } catch (e) {
      toast.push((e as ApiError).message, "error");
    }
  }

  if (error) return <ErrorBanner message={error.message} />;
  const reports = data ?? [];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Shareable summaries of where you stand, as a link, a PDF or an email."
        actions={
          <button
            type="button"
            onClick={pro ? () => void generate("manual") : () => askUpgrade("Reports are on paid plans: a report after every scan, by email, as a PDF and as a share link.")}
            disabled={!hasData || generating !== null}
            className={buttonClass("primary", "sm")}
          >
            {generating ? <CircleNotch size={14} className="animate-spin" /> : <Plus size={14} weight="bold" />} New report from latest scan {!pro && <ProBadge />}
          </button>
        }
      />

      <StatStrip
        stats={[
          { label: "Reports", value: reports.length, hint: "kept as a frozen snapshot", icon: <ChartLine size={18} />, tone: "blue" },
          { label: "Shared links", value: reports.filter((r) => r.shared).length, hint: "readable without an account", icon: <ShareNetwork size={18} />, tone: "violet" },
          { label: "Emailed", value: reports.filter((r) => r.emailed_at).length, hint: "sent to you", icon: <EnvelopeSimple size={18} />, tone: "green" },
          { label: "Weekly scan", value: schedule?.enabled ? "On" : "Off", hint: schedule?.enabled ? `${WEEKDAYS[schedule.day_of_week]} ${formatHour(schedule.hour)}` : "turn on in Settings", icon: <CalendarCheck size={18} />, tone: "amber" },
        ]}
      />

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[76px]" />)}</div>
      ) : reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ChartLine size={30} />}
            title={hasData ? "No reports yet" : "Run a scan to create your first report"}
            body="Every scan now creates a report on its own. You can also make one from your latest scan to send to a teammate, a client or an investor."
            action={hasData ? <button type="button" onClick={() => generate("manual")} className={buttonClass("primary", "sm")}><Plus size={14} weight="bold" /> New report from latest scan</button> : undefined}
          />
        </Card>
      ) : (
        <>
          <LatestReport projectId={id} report={reports[0]} previous={reports[1]} onCopy={() => copyLink(reports[0])} />
          {reports.length > 1 && (
            <Card title="Earlier reports" subtitle="Each one is the snapshot of its own scan" className="mt-4">
              <ul className="divide-y divide-line">
                {reports.slice(1).map((r, i) => {
                  const before = reports[i + 2]?.headline;
                  return (
                    <li key={r.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3.5">
                      <span className={cx("grid size-10 shrink-0 place-items-center rounded-[12px] font-mono text-[14px] font-medium tabular-nums", r.headline ? scoreTone(r.headline.score) : REPORT_TILE[r.type])}>
                        {r.headline ? r.headline.score : <ChartLine size={20} />}
                      </span>
                      <Link href={`/projects/${id}/reports/${r.id}`} className="group min-w-0 flex-1 basis-[200px]">
                        <span className="block text-[14px] font-medium text-ink group-hover:underline">{REPORT_LABELS[r.type]}</span>
                        <span className="block text-[12px] text-muted">{range(r)} · created {timeAgo(r.created_at)}</span>
                      </Link>
                      {r.headline && (
                        <div className="flex items-center gap-5 text-[12px]">
                          {([["Mentioned", "mention_rate"], ["Recommended", "recommendation_rate"]] as const).map(([label, key]) => (
                            <span key={key} className="text-right">
                              <span className="block text-muted">{label}</span>
                              <span className="font-mono text-[13px] text-ink tabular-nums">{pct(r.headline![key])}</span>{" "}
                              <Change now={r.headline![key]} before={before?.[key]} />
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        {r.shared && <span className="inline-flex items-center gap-1 rounded-full bg-blue-soft px-2 py-0.5 text-[11px] text-blue-ink"><ShareNetwork size={11} /> Shared</span>}
                        <button type="button" onClick={() => copyLink(r)} aria-label="Copy share link" className={buttonClass("secondary", "sm")}>
                          <LinkSimple size={14} />
                        </button>
                        <PdfButton href={`/api/backend/projects/${id}/reports/${r.id}/export?format=pdf`} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      {!loading && <ReportExtras projectId={id} weeklyOn={Boolean(schedule?.enabled)} />}
    </>
  );
}

function LatestReport({ projectId, report, previous, onCopy }: { projectId: string; report: ReportSummary; previous?: ReportSummary; onCopy: () => void }) {
  const h = report.headline;
  const stats = h
    ? ([["Mentioned", "mention_rate"], ["Recommended", "recommendation_rate"], ["Share of voice", "share_of_voice"]] as const)
    : [];
  return (
    <section className="relative overflow-hidden rounded-[20px] bg-night px-6 py-5 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 size-[280px] rounded-full border border-white/10" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {h && (
            <div className="grid size-[68px] shrink-0 place-items-center rounded-[16px] bg-white/[0.06] text-center">
              <div>
                <p className="font-mono text-[24px] font-medium leading-none tabular-nums text-mark">{h.score}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-white/50">score</p>
              </div>
            </div>
          )}
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/55">
              <span className="size-1.5 rounded-full bg-mark" /> Latest report · {timeAgo(report.created_at)}
            </p>
            <p className="mt-1 text-[19px] font-semibold tracking-[-0.02em]">{REPORT_LABELS[report.type]}</p>
            <p className="mt-0.5 text-[12px] text-white/55">
              {range(report)}
              {report.shared ? " · shared" : ""}
              {report.emailed_at ? " · emailed" : ""}
            </p>
          </div>
        </div>
        {h && (
          <div className="grid grid-cols-3 gap-6 lg:gap-8">
            {stats.map(([label, key]) => (
              <div key={key}>
                <p className="text-[11px] text-white/55">{label}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-[22px] font-medium leading-none tabular-nums">{pct(h[key])}</span>
                  {previous?.headline && (() => {
                    const pts = Math.round((h[key] - previous.headline[key]) * 100);
                    return (
                      <span className={cx("font-mono text-[11px]", pts > 0 ? "text-mark" : pts < 0 ? "text-[#ff8a8f]" : "text-white/40")}>
                        {pts > 0 ? `+${pts}` : pts < 0 ? pts : "±0"}
                      </span>
                    );
                  })()}
                </p>
                <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-mark" style={{ width: `${Math.max(h[key] > 0 ? 3 : 0, Math.round(h[key] * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 lg:ml-4">
          <Link href={`/projects/${projectId}/reports/${report.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-mark px-4 text-[13px] font-medium text-ink transition-transform active:scale-[0.98]">
            Open report <ArrowRight size={14} weight="bold" />
          </Link>
          <button type="button" onClick={onCopy} aria-label="Copy share link" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 hover:text-white">
            <LinkSimple size={15} />
          </button>
          <PdfButton href={`/api/backend/projects/${projectId}/reports/${report.id}/export?format=pdf`} tone="dark" />
        </div>
      </div>
    </section>
  );
}

const REPORT_TILE = { weekly: "bg-mark-soft text-ink", monthly: "bg-blue-soft text-blue-ink", manual: "bg-violet-soft text-violet-ink" } as const;

export default function ReportsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-72" />}>
      <ReportsInner />
    </Suspense>
  );
}
