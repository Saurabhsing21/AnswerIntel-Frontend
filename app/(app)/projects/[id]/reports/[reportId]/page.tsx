"use client";

import { CaretLeft, CheckCircle, CircleNotch, EnvelopeSimple, LinkSimple, ShareNetwork, Target } from "@phosphor-icons/react";
import Link from "next/link";
import { PdfButton } from "@/components/app/pdf-button";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BrandLineChart, type BrandSeries } from "@/components/app/charts";
import { BrandTile } from "@/components/app/brand-tile";
import { Popover } from "@/components/app/popover";
import { useToast } from "@/components/app/toast";
import { Card, ErrorBanner, ImpactPill, Skeleton } from "@/components/app/ui";
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
    { label: "Mentions", value: c.visibility.mention_rate ?? 0, delta: c.visibility.deltas.mention_rate },
    { label: "Recommendations", value: c.visibility.recommendation_rate ?? 0, delta: c.visibility.deltas.recommendation_rate },
    { label: "Share of voice", value: c.visibility.share_of_voice ?? 0, delta: c.visibility.deltas.share_of_voice },
    { label: "Cited", value: c.visibility.citation_rate ?? 0, delta: c.visibility.deltas.citation_rate },
  ];
  const ranked = [...c.competitors].sort((a, b) => b.mention_rate - a.mention_rate);
  const leader = ranked.find((r) => !r.is_you && r.mention_rate > (c.visibility.mention_rate ?? 0)) ?? null;
  const meta = c.meta;
  // Same formula as the PDF: 40% mentions, 40% recommendations, 20% citations.
  const score = Math.round(100 * (0.4 * (c.visibility.mention_rate ?? 0) + 0.4 * (c.visibility.recommendation_rate ?? 0) + 0.2 * (c.visibility.citation_rate ?? 0)));
  const findings = c.summary.filter((line) => !line.startsWith("Top opportunity:"));
  const first = c.top_opportunities[0];
  const lost = (c.questions ?? []).filter((q) => (q.status === "absent" || q.status === "mentioned") && q.winners.length > 0);
  const why = c.why_not_you ?? [];
  const gaps = (c.sources ?? []).filter((s) => !s.with_you && s.owner !== c.brand).slice(0, 8);

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/projects/${id}/reports`} className="inline-flex items-center gap-1 text-[12px] text-muted transition-colors hover:text-ink">
          <CaretLeft size={12} weight="bold" /> Reports
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="font-display text-[22px] font-semibold tracking-[-0.03em]">{REPORT_LABELS[report.type]}</h1>
            <p className="mt-0.5 text-[13px] text-muted">
              {day(report.period_start)} to {day(report.period_end)} · scan #{report.scan_id}
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
            <PdfButton href={`/api/backend${base}/export?format=pdf`} />
            <button type="button" onClick={email} disabled={busy === "email"} className={buttonClass("primary", "sm")}>
              {busy === "email" ? <CircleNotch size={14} className="animate-spin" /> : <EnvelopeSimple size={14} />} {report.emailed_at ? "Email again" : "Email me"}
            </button>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[20px] bg-night px-6 py-6 text-white md:px-8 md:py-7">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[320px] rounded-full border border-white/10" />
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-[190px] rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/60">
              <span className="size-1.5 rounded-full bg-mark" /> AI visibility report
            </p>
            <h2 className="mt-2 truncate font-display text-[34px] font-semibold leading-none tracking-[-0.035em] md:text-[42px]">{c.brand}</h2>
            <p className="mt-3 text-[13px] text-white/60">
              {[c.category, meta?.engines?.length ? `${meta.engines.length} AI engines` : null, meta?.questions ? `${meta.questions} buyer questions` : null, meta?.answers ? `${meta.answers} answers read` : null].filter(Boolean).join("  ·  ")}
            </p>
          </div>
          <ScoreRing score={score} />
        </div>
        <div className="relative mt-6 grid gap-px overflow-hidden rounded-[14px] bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="bg-night/80 px-4 py-3.5 backdrop-blur-sm" style={{ backgroundColor: "rgb(255 255 255 / 0.04)" }}>
              <p className="text-[12px] text-white/60">{t.label}</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[26px] font-medium leading-none tabular-nums">{pct(t.value)}</span>
                {t.delta != null && Math.round(t.delta * 100) !== 0 && (
                  <span className={`font-mono text-[11px] ${t.delta > 0 ? "text-mark" : "text-[#ff8a8f]"}`}>
                    {t.delta > 0 ? "+" : ""}{Math.round(t.delta * 100)} pts
                  </span>
                )}
              </p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-mark" style={{ width: `${Math.max(t.value > 0 ? 2 : 0, Math.round(t.value * 100))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Key findings" subtitle="The short version, in sentences you can forward">
          <ol className="divide-y divide-line">
            {findings.map((line, i) => (
              <li key={line} className="flex items-start gap-3 px-5 py-3.5 text-[14px] leading-relaxed text-ink">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sunken font-mono text-[11px] font-medium text-ink-2">{i + 1}</span>
                {line}
              </li>
            ))}
          </ol>
        </Card>
        <div className="flex flex-col rounded-[16px] border border-mark-strong/40 bg-mark-soft/70 p-5">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
            <Target size={14} weight="bold" /> Do this first
          </p>
          {first ? (
            <>
              <p className="mt-2 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-ink">{first.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{first.recommended_action}</p>
              {first.steps?.length ? (
                <ul className="mt-3 space-y-1.5 text-[13px] text-ink">
                  {first.steps.slice(0, 3).map((step) => (
                    <li key={step} className="flex gap-2"><CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-mark-strong" />{step}</li>
                  ))}
                </ul>
              ) : null}
              <Link href={`/projects/${id}/opportunities`} className={`${buttonClass("primary", "sm")} mt-4 self-start`}>
                Open the to-do list
              </Link>
            </>
          ) : (
            <p className="mt-2 text-[14px] text-ink">Nothing urgent. AI recommends you wherever it recommends a competitor.</p>
          )}
        </div>
      </div>

      <Section n={1} title="Where you stand" lead="How often AI names and recommends you, against the brand it names most, and engine by engine.">
        {leader && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
              <p className="text-[14px] font-medium text-ink">You vs {leader.name}</p>
              <div className="flex items-center gap-3 text-[12px] text-muted">
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: YOU_COLOR }} />{c.brand}</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: brandColor(leader.name, false, rivals) }} />{leader.name}</span>
              </div>
            </div>
            <div className="space-y-3.5 px-5 pb-5 pt-4">
              {([
                ["Mentions", c.visibility.mention_rate ?? 0, leader.mention_rate],
                ["Recommendations", c.visibility.recommendation_rate ?? 0, leader.recommendation_rate],
                ["Share of voice", c.visibility.share_of_voice ?? 0, leader.share_of_voice],
              ] as const).map(([label, mine, theirs]) => (
                <div key={label} className="grid grid-cols-[8.5rem_1fr] items-center gap-4 text-[13px]">
                  <span className="text-ink-2">{label}</span>
                  <div className="space-y-1">
                    <Meter value={mine} color={YOU_COLOR} />
                    <Meter value={theirs} color={brandColor(leader.name, false, rivals)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {c.engines.length > 0 && (
          <Card className={leader ? "mt-4" : ""}>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-faint">
                  <th className="px-5 py-2.5 font-medium">Engine</th>
                  <th className="px-3 py-2.5 text-right font-medium">Answers</th>
                  <th className="w-[28%] px-3 py-2.5 font-medium">Mentioned</th>
                  <th className="w-[28%] px-5 py-2.5 font-medium">Recommended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {c.engines.map((e) => (
                  <tr key={e.key}>
                    <td className="px-5 py-2.5 font-medium text-ink">{e.name}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted">{e.responses}</td>
                    <td className="px-3 py-2.5"><Meter value={e.mention_rate} color="var(--color-ink)" compact /></td>
                    <td className="px-5 py-2.5"><Meter value={e.recommendation_rate} color="var(--color-mark-strong)" compact /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        {n > 1 ? (
          <Card title="Mentions by brand" subtitle={`Across ${n} scans`} className="mt-4">
            <div className="px-4 py-4">
              <BrandLineChart series={series} dates={c.trend.map((p) => p.date)} metricKey="mention_rate" label="Mentions" />
            </div>
          </Card>
        ) : (
          <p className="mt-3 text-[12px] text-muted">This is your first scan. Tracking starts with the next one, and later reports show what changed.</p>
        )}
      </Section>

      <Section n={2} title="Who AI recommends instead" lead="Every tracked brand in the same answers, and who won the questions you did not.">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card title="Brands" subtitle="Ranked by mentions">
            <ol className="divide-y divide-line">
              {ranked.map((r, i) => (
                <li key={r.name} className={`flex items-center gap-3 px-5 py-2.5 ${r.is_you ? "bg-[#f7f7f6]" : ""}`}>
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
          <Card title="Questions you lost" subtitle={lost.length ? `${lost.length} of ${c.questions?.length ?? 0} questions` : "None in this scan"}>
            {lost.length ? (
              <ul className="divide-y divide-line">
                {lost.slice(0, 8).map((q) => (
                  <li key={q.text} className="px-5 py-3">
                    <p className="text-[13px] text-ink">{q.text}</p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {q.status === "mentioned" ? "Mentioned, not recommended" : "Not named"}. AI picked <span className="font-medium text-ink">{q.winners.join(", ")}</span>.
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-[13px] text-muted">You were recommended wherever a competitor was.</p>
            )}
          </Card>
        </div>
      </Section>

      {why.length > 0 && (
        <Section n={3} title="Why AI skips you" lead="The reason the engine gave on your biggest losses, with the sentence from its answer.">
          <Card>
            <ul className="divide-y divide-line">
              {why.map((w) => (
                <li key={w.question} className="px-5 py-4">
                  <p className="text-[14px] font-medium text-ink">{w.question}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    {w.engine} recommended <span className="font-medium text-ink">{w.winner}</span> and {w.mentioned ? "only mentioned you" : "did not name you"}.
                    {w.reason && <> Why: {w.reason.replace(/\.$/, "")}.</>}
                  </p>
                  {w.quote && <blockquote className="mt-2 border-l-2 border-mark-strong bg-sunken px-3 py-2 text-[13px] italic text-ink-2">{w.quote}</blockquote>}
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {gaps.length > 0 && (
        <Section n={why.length ? 4 : 3} title="Sources AI trusts" lead="Sites AI cited in this scan that never backed an answer naming you. Getting listed on them is one of the strongest fixes.">
          <Card>
            <ul className="divide-y divide-line">
              {gaps.map((s) => (
                <li key={s.domain} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                  <span className="min-w-0 flex-1 truncate font-medium text-ink">{s.domain}</span>
                  <span className="text-muted">{s.owner ?? "Independent"}</span>
                  <span className="w-24 text-right font-mono tabular-nums text-muted">{s.citations} {s.citations === 1 ? "citation" : "citations"}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      <Section n={1 + 2 + (why.length ? 1 : 0) + (gaps.length ? 1 : 0)} title="What to do first" lead="Ranked by expected impact on how often AI recommends you.">
        {c.top_opportunities.length > 0 ? (
          <Card>
            <ul className="divide-y divide-line">
              {c.top_opportunities.map((o) => (
                <li key={o.title} className="flex items-start gap-3.5 px-5 py-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-sunken text-ink-2">
                    <Target size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <ImpactPill impact={o.impact} />
                    <p className="mt-1 text-[14px] font-medium text-ink">{o.title}</p>
                    {o.steps?.length ? (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[13px] text-muted">
                        {o.steps.map((step) => <li key={step}>{step}</li>)}
                      </ul>
                    ) : (
                      <p className="mt-0.5 text-[13px] text-muted">{o.recommended_action}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <p className="text-[13px] text-muted">No open gaps were found in this scan.</p>
        )}
      </Section>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const label = score < 10 ? "Not visible" : score < 30 ? "Emerging" : score < 60 ? "Visible" : "Leading";
  const r = 46;
  const length = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4 md:flex-col md:gap-2">
      <div className="relative size-[116px] shrink-0">
        <svg viewBox="0 0 116 116" className="size-full -rotate-90">
          <circle cx="58" cy="58" r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="9" />
          <circle cx="58" cy="58" r={r} fill="none" stroke="var(--color-mark)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(Math.min(score, 100) / 100) * length} ${length}`} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-mono text-[32px] font-medium leading-none tabular-nums">{score}</p>
            <p className="mt-1 text-[10px] text-white/50">of 100</p>
          </div>
        </div>
      </div>
      <div className="md:text-center">
        <p className="text-[11px] text-white/50">AI visibility score</p>
        <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-mark">{label}</span>
      </div>
    </div>
  );
}

function Meter({ value, color, compact }: { value: number; color: string; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex-1 overflow-hidden rounded-full bg-sunken ${compact ? "h-1.5" : "h-2"}`}>
        <div className="h-full rounded-full" style={{ width: `${Math.max(value > 0 ? 2 : 0, Math.round(value * 100))}%`, background: color }} />
      </div>
      <span className="w-9 text-right font-mono text-[12px] tabular-nums text-ink">{pct(value)}</span>
    </div>
  );
}

function Section({ n, title, lead, children }: { n: number; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section className="pt-4">
      <p className="font-mono text-[12px] font-medium text-faint">{String(n).padStart(2, "0")}</p>
      <h2 className="mt-0.5 font-display text-[19px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      <p className="mb-3 mt-0.5 text-[13px] text-muted">{lead}</p>
      {children}
    </section>
  );
}
