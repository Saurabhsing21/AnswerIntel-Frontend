"use client";

import { WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useProject } from "@/components/app/project-context";
import type { PoolDetails } from "@/lib/api/client";
import { siteHref } from "@/lib/urls";

/**
 * Shown when the plan's question pool, shared by every project, has no room left. Names the projects holding it
 * and links to where to turn questions off, or to plans.
 */
export function PoolFullNotice({ pool, projectId, message }: { pool: PoolDetails; projectId: string; message: string }) {
  const { billing } = useProject();
  const plans = billing?.state === "free" ? siteHref("/pricing") : `/projects/${projectId}/billing`;
  return (
    <div role="alert" className="rounded-[12px] border border-[#f3d9a4] bg-[#fdf8ec] px-4 py-3 text-[13px] text-[#7a4d00]">
      <p className="flex items-start gap-2">
        <WarningCircle size={16} className="mt-px shrink-0" />
        {message}
      </p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-6 font-medium">
        {pool.holders.filter((h) => h.project_id !== projectId).map((h) => (
          <Link key={h.project_id} href={`/projects/${h.project_id}/prompts`} className="underline underline-offset-2">
            Turn off questions in {h.brand} ({h.active})
          </Link>
        ))}
        <a href={plans} className="underline underline-offset-2">See plans</a>
      </p>
    </div>
  );
}
