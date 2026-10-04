"use client";

import { ArrowRight, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApi } from "@/lib/api/client";
import type { Project } from "@/lib/api/types";
import { buttonClass } from "@/components/ui/button";
import { PageHeader, Skeleton } from "@/components/app/ui";

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects, loading } = useApi<Project[]>("/projects");

  useEffect(() => {
    if (projects && projects.length === 0) router.replace("/projects/new");
  }, [projects, router]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Each project tracks one brand in one market."
        actions={
          <Link href="/projects/new" className={buttonClass("primary", "sm")}>
            <Plus size={14} weight="bold" /> New project
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
        {projects?.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="group rounded-[16px] border border-line-strong bg-surface p-5 transition-shadow hover:shadow-[0_16px_40px_-24px_rgb(0_0_0/0.3)]"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-[10px] bg-ink font-semibold text-white">{p.brand_name[0]?.toUpperCase()}</span>
              <div className="min-w-0">
                <p className="truncate font-medium">{p.brand_name}</p>
                <p className="truncate text-[12px] text-muted">{p.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</p>
              </div>
              <ArrowRight size={15} className="ml-auto text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </div>
            <p className="mt-4 text-[13px] text-muted">
              {p.category} · {p.country}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
