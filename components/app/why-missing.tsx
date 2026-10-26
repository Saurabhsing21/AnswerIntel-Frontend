"use client";

import { ArrowUpRight, Lightbulb } from "@phosphor-icons/react";
import { Skeleton } from "@/components/app/ui";
import { useApi } from "@/lib/api/client";
import type { Diagnosis, DiagnosisCause } from "@/lib/api/types";

function Evidence({ cause }: { cause: DiagnosisCause }) {
  const ev = cause.evidence;
  if (ev.pages?.length)
    return (
      <ul className="mt-2 space-y-1.5">
        {ev.pages.map((p) => (
          <li key={p.url} className="text-[12px]">
            <a href={p.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-medium text-ink underline-offset-2 hover:underline">
              {p.title || p.domain} <ArrowUpRight size={11} />
            </a>
            <span className="text-muted"> names {p.competitors.join(", ")}</span>
          </li>
        ))}
      </ul>
    );
  if (ev.winners?.length)
    return (
      <ul className="mt-2 space-y-1.5">
        {ev.winners.map((w) => (
          <li key={w.name} className="text-[12px] text-ink-2">
            <span className="font-medium text-ink">{w.name}</span>: {w.quote ? <q className="text-muted">{w.quote}</q> : w.reason}
          </li>
        ))}
      </ul>
    );
  if (ev.quote) return <q className="mt-2 block text-[12px] text-muted">{ev.quote}</q>;
  const link = ev.url ?? ev.sitemap;
  if (link)
    return (
      <a href={link} target="_blank" rel="noreferrer noopener" className="mt-2 inline-flex items-center gap-1 text-[12px] text-muted underline-offset-2 hover:underline">
        {ev.pages_checked ? `${ev.pages_checked} pages checked in your sitemap` : link} <ArrowUpRight size={11} />
      </a>
    );
  return null;
}

/** Why the brand is missing from one answer: each cause with the evidence behind it and one thing to do.
 * `wide`: the panel has the full width, so the causes sit side by side instead of stacking. */
export function WhyMissing({ projectId, responseId, wide }: { projectId: string; responseId: number; wide?: boolean }) {
  const { data, loading, error } = useApi<Diagnosis>(`/projects/${projectId}/responses/${responseId}/diagnosis`);
  if (error || data?.status === "recommended") return null;
  return (
    <div>
      <p className="mb-2 text-[12px] text-muted">{data?.status === "mentioned" ? "Why you weren't recommended" : "Why you're missing"}</p>
      {loading || !data ? (
        <Skeleton className="h-24" />
      ) : data.causes.length === 0 ? (
        <p className="rounded-[12px] border border-line px-3.5 py-3 text-[13px] text-muted">
          We found no clear cause in this answer&apos;s sources or your site. The Opportunities page shows patterns across all answers.
        </p>
      ) : (
        <ol className={wide ? "grid gap-2 lg:grid-cols-2" : "overflow-hidden rounded-[12px] border border-line"}>
          {data.causes.map((c, i) => (
            <li key={c.code} className={wide ? "rounded-[12px] border border-line px-3.5 py-3" : "border-b border-line px-3.5 py-3 last:border-0"}>
              <p className="flex gap-2 text-[13px] font-medium text-ink">
                <span className="font-mono text-faint">{i + 1}</span> {c.title}
              </p>
              <div className="pl-5">
                <p className="mt-1 text-[12px] text-muted">{c.detail}</p>
                <Evidence cause={c} />
                <p className="mt-2.5 flex gap-1.5 rounded-[8px] bg-mark-soft/50 px-2.5 py-2 text-[12px] text-ink-2">
                  <Lightbulb size={14} className="mt-px shrink-0 text-ink" /> {c.action}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
