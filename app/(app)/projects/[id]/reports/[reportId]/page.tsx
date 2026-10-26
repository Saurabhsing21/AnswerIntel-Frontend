"use client";

import { CaretLeft, CheckCircle, CircleNotch, EnvelopeSimple, FilePdf, LinkSimple, ShareNetwork, Target } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BrandLineChart, type BrandSeries } from "@/components/app/charts";
import { BrandTile } from "@/components/app/brand-tile";
import { Popover } from "@/components/app/popover";
import { useToast } from "@/components/app/toast";
import { Card, Delta, ErrorBanner, ImpactPill, Skeleton } from "@/components/app/ui";
import { PositionChip } from "@/components/product/delta";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Report } from "@/lib/api/types";
import { brandColor, YOU_COLOR } from "@/lib/brand";
import { pct, REPORT_LABELS } from "@/lib/format";

const day = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function ReportPage() {
  const { id, reportId } = useParams<{ id: string; reportId: string }>();
  const toast = useToast();
  const { data: report, error, loading, reload } = useApi<Report>(`/projects/${id}/reports/${reportId}`);
  const [busy, setBusy] = useState<"share" | "email" | null>(null);
  const [link, setLink] = useState<string | null>(null);

  if (error) return <ErrorBanner message={error.message} />;
  if (loading || !report) return <div className="space-y-4"><Skeleton className="h-10 w-72" /><Skeleton className="h-40" /><Skeleton className="h-[360px]" /></div>;

  const c = report.content;
  const base = `/projects/${id}/reports/${report.id}`;
  const rivals = c.competitors.filter((r) => !r.is_you).map((r) => r.name);
  const n = c.trend.length;
  const series: BrandSeries[] = [
    { name: c.brand, color: YOU_COLOR, isYou: true, values: c.trend.map((p) => p.mention_rate) },
    ...rivals.map((name) => ({ name, color: brandColor(name, false, rivals), isYou: false, values: c.trend.map((p) => p.competitors?.[name]?.mention_rate ?? null) })),
  ];
  const shareUrl = (token: string) => `${window.location.origin}/api/shared/${token}?format=html`;

  async function share() {
    setBusy("share");
    try {
      const { token } = await api<{ token: string }>(`${base}/share`, { method: "POST" });
      setLink(shareUrl(token));
      reload();
    } catch (e) {
      toast.push((e as ApiError).message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function stopSharing() {
    try {
      await api(`${base}/share`, { method: "DELETE" });
      setLink(null);
      toast.push("Link revoked. It no longer works.", "success");
      reload();
    } catch (e) {
      toast.push((e as ApiError).message, "error");
    }
  }

  async function email() {
    setBusy("email");
    try {
      const sent = await api<{ to: string }>(`${base}/send`, { method: "POST" });
      toast.push(`Sent to ${sent.to}.`, "success");
      reload();
    } catch (e) {
      const err = e as ApiError;
      toast.push(err.code === "EMAIL_NOT_CONFIGURED" ? "Email sending is not set up on this server yet. Use the link or the PDF instead." : err.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const tiles = [
    { label: "Mentions", value: c.visibility.mention_rate, delta: c.visibility.deltas.mention_rate },
    { label: "Recommendations", value: c.visibility.recommendation_rate, delta: c.visibility.deltas.recommendation_rate },
    { label: "Share of voice", value: c.visibility.share_of_voice, delta: c.visibility.deltas.share_of_voice },
    { label: "Citation rate", value: c.visibility.citation_rate, delta: c.visibility.deltas.citation_rate },
  ];
  const ranked = [...c.competitors].sort((a, b) => b.mention_rate - a.mention_rate);

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/projects/${id}/reports`} className="inline-flex items-center gap-1 text-[12px] text-muted transition-colors hover:text-ink">
          <CaretLeft size={12} weight="bold" /> Reports
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em] md:text-[26px]">{REPORT_LABELS[report.type]}</h1>
            <p className="mt-0.5 text-[13px] text-muted">
              {c.brand} · {day(report.period_start)} to {day(report.period_end)} · scan #{report.scan_id}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Popover
              align="right"
              className="w-[340px]"
              trigger={({ open, toggle }) => (
                <button type="button" onClick={() => { toggle(); if (!open) void share(); }} className={buttonClass("secondary", "sm")}>
                  {busy === "share" ? <CircleNotch size={14} className="animate-spin" /> : <ShareNetwork size={14} />} {report.shared ? "Shared" : "Share"}
                </button>
              )}
            >
              {(close) => (
                <div className="p-2">
                  <p className="text-[13px] font-medium text-ink">Anyone with the link can read this report</p>
                  <p className="mt-0.5 text-[12px] text-muted">No account needed. You can revoke it at any time.</p>
                  <div className="mt-3 flex gap-1.5">
                    <input readOnly value={link ?? "Creating link..."} aria-label="Share link" className="h-9 min-w-0 flex-1 rounded-[8px] border border-line-strong bg-[#fafaf9] px-2.5 text-[12px] text-ink-2" onFocus={(e) => e.currentTarget.select()} />
                    <button
                      type="button"
                      disabled={!link}
                      onClick={async () => {
                        await navigator.clipboard.writeText(link!);
                        toast.push("Link copied.", "success");
                      }}
                      className={buttonClass("primary", "sm")}
                    >
                      <LinkSimple size={14} /> Copy
                    </button>
                  </div>
                  <button type="button" onClick={() => { close(); void stopSharing(); }} className="mt-2 text-[12px] text-muted underline-offset-2 hover:text-down hover:underline">
                    Stop sharing
                  </button>
                </div>
              )}
            </Popover>
            <a href={`/api/backend${base}/export?format=pdf`} target="_blank" rel="noreferrer" className={buttonClass("secondary", "sm")}>
              <FilePdf size={14} /> PDF
            </a>
            <button type="button" onClick={email} disabled={busy === "email"} className={buttonClass("primary", "sm")}>
              {busy === "email" ? <CircleNotch size={14} className="animate-spin" /> : <EnvelopeSimple size={14} />} {report.emailed_at ? "Email again" : "Email me"}
            </button>
          </div>
        </div>
      </div>

      <Card title="Summary" subtitle="The short version">
        <ul className="divide-y divide-line">
          {c.summary.map((line) => (
            <li key={line} className="flex items-start gap-3 px-5 py-3.5 text-[14px] text-ink">
              <CheckCircle size={18} weight="fill" className="mt-px shrink-0 text-ink" />
              {line}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid overflow-hidden rounded-[16px] border border-line-strong bg-surface sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <div key={t.label} className={`px-5 py-4 ${i > 0 ? "border-t border-line sm:border-t-0 sm:border-l" : ""}`}>
            <p className="text-[12px] text-muted">{t.label}</p>
            <p className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono text-[28px] leading-none tabular-nums">{pct(t.value)}</span>
              <Delta value={t.delta} />
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Mentions by brand" subtitle={n > 1 ? `Across ${n} scans` : "Latest scan"} className="flex flex-col">
          <div className="flex-1 px-4 py-4">
            <BrandLineChart series={series} dates={c.trend.map((p) => p.date)} metricKey="mention_rate" label="Mentions" />
          </div>
        </Card>
        <Card title="Competitors" subtitle="Ranked by mentions" className="flex flex-col">
          <ol className="flex flex-1 flex-col divide-y divide-line">
            {ranked.map((r, i) => (
              <li key={r.name} className={`flex flex-1 items-center gap-3 px-5 py-2.5 ${r.is_you ? "bg-[#f7f7f6]" : ""}`}>
                <span className="w-4 font-mono text-[12px] text-faint">{i + 1}</span>
                <BrandTile name={r.name} color={brandColor(r.name, r.is_you, rivals)} size={22} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{r.name}</span>
                {r.is_you && <span className="rounded-[4px] bg-ink px-1.5 py-px text-[10px] font-medium text-white">You</span>}
                <span className="font-mono text-[13px] tabular-nums">{pct(r.mention_rate)}</span>
                {r.average_position != null && <PositionChip value={r.average_position} />}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {c.top_opportunities.length > 0 && (
        <Card title="What to do next" subtitle="Highest impact first">
          <ul className="divide-y divide-line">
            {c.top_opportunities.map((o) => (
              <li key={o.title} className="flex items-start gap-3.5 px-5 py-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-sunken text-ink-2">
                  <Target size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ImpactPill impact={o.impact} />
                  </div>
                  <p className="mt-1 text-[14px] font-medium text-ink">{o.title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{o.recommended_action}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
