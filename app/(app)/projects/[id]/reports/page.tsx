"use client";

import { CalendarCheck, ChartLine, CircleNotch, EnvelopeSimple, FilePdf, LinkSimple, ListChecks, Plus, ShareNetwork, Target, Trophy } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { MenuItem, Popover } from "@/components/app/popover";
import { useProject } from "@/components/app/project-context";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, PageHeader, Skeleton, StatStrip } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Report, ReportSummary, ReportType } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { askUpgrade, ProBadge, usePro } from "@/components/app/pro-lock";
import { REPORT_LABELS, timeAgo } from "@/lib/format";
import { formatHour, WEEKDAYS } from "@/lib/schedule";

const range = (r: ReportSummary) => {
  const f = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${f(r.period_start)} to ${f(r.period_end)}`;
};

/** Always shown under the list, so the page is never a short list on a blank canvas. */
function ReportExtras({ projectId, weeklyOn }: { projectId: string; weeklyOn: boolean }) {
  const inside = [
    { icon: ListChecks, title: "A plain-English summary", body: "The three or four things that changed, in sentences you can forward." },
    { icon: Trophy, title: "Your numbers against rivals", body: "Mentions, recommendations and share of voice, with the change since the previous scan." },
    { icon: Target, title: "What to do next", body: "The highest-impact fixes, each with the action to take." },
  ];
  const share = [
    { icon: LinkSimple, title: "A private link", body: "Anyone with it can read the report. No account needed, and you can revoke it." },
    { icon: FilePdf, title: "A PDF", body: "Attach it to an investor update or a client email." },
    { icon: EnvelopeSimple, title: "An email", body: weeklyOn ? "Sent to you automatically after every weekly scan." : "Turn on the weekly scan and it arrives on its own." },
  ];
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {[
        { title: "What is inside a report", subtitle: "Built from your latest scan", items: inside },
        { title: "Share it your way", subtitle: "Three ways out of the app", items: share },
      ].map((group) => (
        <Card key={group.title} title={group.title} subtitle={group.subtitle} className="flex flex-col">
          <ul className="flex flex-1 flex-col divide-y divide-line">
            {group.items.map(({ icon: Icon, title, body }) => (
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
          {group.title.startsWith("Share") && !weeklyOn && (
            <Link href={`/projects/${projectId}/settings`} className="border-t border-line px-5 py-3 text-[12px] font-medium text-ink-2 transition-colors hover:text-ink">
              Turn on the weekly email in Settings
            </Link>
          )}
        </Card>
      ))}
    </div>
  );
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
          <Popover
            align="right"
            className="w-60"
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={pro ? toggle : () => askUpgrade("Reports are on paid plans: a weekly summary by email, PDF exports and share links.")}
                aria-expanded={open}
                disabled={!hasData || generating !== null}
                className={buttonClass("primary", "sm")}
              >
                {generating ? <CircleNotch size={14} className="animate-spin" /> : <Plus size={14} weight="bold" />} Generate report {!pro && <ProBadge />}
              </button>
            )}
          >
            {(close) => (
              <>
                {(["weekly", "monthly", "manual"] as const).map((type) => (
                  <MenuItem key={type} onClick={() => { close(); void generate(type); }}>
                    <ChartLine size={16} /> {REPORT_LABELS[type]}
                  </MenuItem>
                ))}
              </>
            )}
          </Popover>
        }
      />

      <StatStrip
        stats={[
          { label: "Reports", value: reports.length, hint: "kept as a frozen snapshot", icon: <ChartLine size={18} />, tone: "blue" },
          { label: "Shared links", value: reports.filter((r) => r.shared).length, hint: "readable without an account", icon: <ShareNetwork size={18} />, tone: "violet" },
          { label: "Emailed", value: reports.filter((r) => r.emailed_at).length, hint: "sent to you", icon: <EnvelopeSimple size={18} />, tone: "green" },
          { label: "Weekly email", value: schedule?.enabled ? "On" : "Off", hint: schedule?.enabled ? `${WEEKDAYS[schedule.day_of_week]} ${formatHour(schedule.hour)}` : "turn on in Settings", icon: <CalendarCheck size={18} />, tone: "amber" },
        ]}
      />

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[76px]" />)}</div>
      ) : reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ChartLine size={30} />}
            title={hasData ? "No reports yet" : "Run a scan to create your first report"}
            body="A report freezes today's numbers into a clean summary you can send to a teammate, a client or an investor."
            action={hasData ? <button type="button" onClick={() => generate("weekly")} className={buttonClass("primary", "sm")}><Plus size={14} weight="bold" /> Generate weekly report</button> : undefined}
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <span className={cx("grid size-10 shrink-0 place-items-center rounded-[12px]", REPORT_TILE[r.type])}>
                  {r.type === "weekly" ? <CalendarCheck size={20} /> : <ChartLine size={20} />}
                </span>
                <Link href={`/projects/${id}/reports/${r.id}`} className="group min-w-0 flex-1 basis-[220px]">
                  <span className="block text-[14px] font-medium text-ink group-hover:underline">{REPORT_LABELS[r.type]}</span>
                  <span className="block text-[12px] text-muted">
                    {range(r)} · created {timeAgo(r.created_at)}
                  </span>
                </Link>
                <div className="flex items-center gap-1.5 text-[11px]">
                  {r.shared && <span className="inline-flex items-center gap-1 rounded-full bg-blue-soft px-2 py-0.5 text-blue-ink"><ShareNetwork size={11} /> Shared</span>}
                  {r.emailed_at && <span className="inline-flex items-center gap-1 rounded-full bg-up-soft px-2 py-0.5 text-up-ink"><EnvelopeSimple size={11} /> Emailed</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => copyLink(r)} className={buttonClass("secondary", "sm")}>
                    <LinkSimple size={14} /> Copy link
                  </button>
                  <a href={`/api/backend/projects/${id}/reports/${r.id}/export?format=pdf`} target="_blank" rel="noreferrer" className={buttonClass("secondary", "sm")}>
                    <FilePdf size={14} /> PDF
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!loading && <ReportExtras projectId={id} weeklyOn={Boolean(schedule?.enabled)} />}
    </>
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
