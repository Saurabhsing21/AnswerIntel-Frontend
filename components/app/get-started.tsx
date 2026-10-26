"use client";

import { ArrowRight, Check, CircleNotch, Hash, Play, Users } from "@phosphor-icons/react";
import Link from "next/link";
import { isScanActive, useProject } from "@/components/app/project-context";
import { Card } from "@/components/app/ui";
import { BrandTile } from "@/components/app/brand-tile";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import { useApi } from "@/lib/api/client";
import { YOU_COLOR } from "@/lib/brand";
import { buttonClass } from "@/components/ui/button";
import type { Competitor, Scan } from "@/lib/api/types";
import { cx } from "@/lib/cx";

type Step = { key: string; title: string; body: string; icon: typeof Users; done: boolean; href?: string; action: string; onAction?: () => void };

/** What this project is set up to ask, so someone who left setup half-way sees exactly what was saved. */
function SetupSummary({ projectId, questions }: { projectId: string; questions: number }) {
  const { project } = useProject();
  const competitors = useApi<Competitor[]>(`/projects/${projectId}/competitors`);
  const base = `/projects/${projectId}`;
  const row = (label: string, href: string, children: React.ReactNode) => (
    <li className="flex items-start gap-3 px-5 py-3.5">
      <span className="w-[92px] shrink-0 pt-0.5 text-[12px] text-muted">{label}</span>
      <span className="min-w-0 flex-1 text-[13px] text-ink">{children}</span>
      <Link href={href} className="shrink-0 text-[12px] font-medium text-ink-2 underline-offset-2 hover:text-ink hover:underline">Edit</Link>
    </li>
  );
  return (
    <Card title="Your setup" subtitle="Saved. Change anything before your first scan." className="flex flex-col">
      <ul className="flex-1 divide-y divide-line">
        {project &&
          row("Brand", `${base}/settings`, (
            <span className="flex items-center gap-2.5">
              <BrandTile name={project.brand_name} color={YOU_COLOR} size={24} website={project.website} />
              <span className="min-w-0">
                <span className="block font-medium">{project.brand_name}</span>
                <span className="block truncate text-[12px] text-muted">{project.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} · {project.category} · {project.country}</span>
              </span>
            </span>
          ))}
        {row("Competitors", `${base}/competitors`, competitors.data?.length ? (
          <span className="flex flex-wrap gap-1.5">
            {competitors.data.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full border border-line py-0.5 pr-2 pl-0.5 text-[12px]">
                <BrandTile name={c.name} color="#a3a3a3" size={18} website={c.website} /> {c.name}
              </span>
            ))}
          </span>
        ) : <span className="text-muted">None yet. AI answers are still measured for you alone.</span>)}
        {project &&
          row("AI engines", `${base}/settings`, (
            <span className="flex flex-wrap gap-1.5">
              {project.engines.map((e) => (
                <span key={e} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[12px]">
                  <EngineIcon engine={e} size={12} /> {engineNames[e]}
                </span>
              ))}
            </span>
          ))}
        {row("Questions", `${base}/prompts`, questions ? <span><span className="font-medium">{questions}</span> buyer questions, switched on</span> : <span className="text-muted">Not written yet</span>)}
      </ul>
    </Card>
  );
}

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
  const { project } = useProject();
  const engineList = (project?.engines ?? []).map((e) => engineNames[e]).join(", ");
  const steps: Step[] = [
    { key: "competitors", title: "Add your competitors", body: "Up to five brands you lose deals to. AI answers are compared against them.", icon: Users, done: counts.competitors > 0, href: `/projects/${projectId}/competitors?add=1`, action: "Add competitors" },
    { key: "prompts", title: "Generate buyer questions", body: "We write the questions your buyers ask AI, then you edit or switch off any of them.", icon: Hash, done: counts.active_prompts > 0, href: `/projects/${projectId}/prompts`, action: "Generate prompts" },
    { key: "scan", title: "Run your first scan", body: `Every question goes to ${engineList || "each AI engine"}. It takes about a minute.`, icon: Play, done: Boolean(scan && !scanning && scan.status !== "failed"), action: "Run first scan", onAction: onStartScan },
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

      <SetupSummary projectId={projectId} questions={counts.active_prompts} />
    </div>

    </div>
  );
}
