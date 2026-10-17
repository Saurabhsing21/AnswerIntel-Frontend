"use client";

import { ArrowRight, CalendarCheck, ChartLine, Crown, Lightbulb, Plus, ShareNetwork, ShieldCheck, User, UsersThree } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandTile } from "@/components/app/brand-tile";
import { useProject } from "@/components/app/project-context";
import { PageHeader, Skeleton } from "@/components/app/ui";
import { YOU_COLOR } from "@/lib/brand";
import type { Project, Role } from "@/lib/api/types";

const ROLE = { owner: { label: "Owner", icon: Crown }, admin: { label: "Admin", icon: ShieldCheck }, member: { label: "Member", icon: User } } as const;
const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function ProjectCard({ project }: { project: Project }) {
  const base = `/projects/${project.id}`;
  return (
    <div className="group flex flex-col rounded-[16px] border border-line-strong bg-surface transition-shadow hover:shadow-[0_16px_40px_-24px_rgb(0_0_0/0.3)]">
      <Link href={base} className="flex flex-1 flex-col p-5">
        <span className="flex items-center gap-3">
          <BrandTile name={project.brand_name} color={YOU_COLOR} size={36} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-medium text-ink">{project.brand_name}</span>
            <span className="block truncate text-[12px] text-muted">{host(project.website)}</span>
          </span>
          <ArrowRight size={15} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
        </span>
        <span className="mt-4 text-[13px] text-muted">
          {project.category} · {project.country}
        </span>
        {project.description && <span className="mt-1 line-clamp-2 text-[12px] text-faint">{project.description}</span>}
      </Link>
      <div className="flex divide-x divide-line border-t border-line text-[12px] font-medium text-ink-2">
        <Link href={`${base}/opportunities`} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 transition-colors hover:bg-[#fbfbfa] hover:text-ink">
          <Lightbulb size={14} /> Opportunities
        </Link>
        <Link href={`${base}/reports`} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 transition-colors hover:bg-[#fbfbfa] hover:text-ink">
          <ChartLine size={14} /> Reports
        </Link>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, projectsLoading, workspaces } = useProject();

  useEffect(() => {
    if (!projectsLoading && projects.length === 0 && workspaces.length > 0) router.replace("/projects/new");
  }, [projects, projectsLoading, workspaces, router]);

  return (
    <>
      <PageHeader title="Projects" description="Each project tracks one brand in one market. They live in workspaces you share with your team." />
      {projectsLoading && projects.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[170px]" />)}</div>
      ) : (
        <div className="space-y-8">
          {workspaces.map((workspace) => {
            const mine = projects.filter((p) => p.workspace_id === workspace.id);
            const Role = ROLE[workspace.role as Role].icon;
            return (
              <section key={workspace.id} aria-label={workspace.name}>
                <div className="mb-3 flex items-center gap-2.5">
                  <h2 className="text-[14px] font-medium text-ink">{workspace.name}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium text-ink-2">
                    <Role size={11} /> {ROLE[workspace.role as Role].label}
                  </span>
                  <span className="text-[12px] text-faint">
                    {mine.length} {mine.length === 1 ? "project" : "projects"}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {mine.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                  <Link
                    href={`/projects/new?workspace=${workspace.id}`}
                    className="flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-line-strong bg-transparent p-5 text-center text-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-sunken">
                      <Plus size={18} weight="bold" />
                    </span>
                    <span className="text-[13px] font-medium">Add a project</span>
                    <span className="max-w-[200px] text-[12px] text-faint">Track another brand or market in {workspace.name}.</span>
                  </Link>
                </div>
              </section>
            );
          })}

          {projects[0] && (
            <section aria-label="Suggested next steps">
              <h2 className="mb-3 text-[14px] font-medium text-ink">Suggested next steps</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { icon: UsersThree, title: "Invite a cofounder", body: "Everyone in a workspace sees all of its projects and reports.", href: `/projects/${projects[0].id}/team` },
                  { icon: CalendarCheck, title: "Turn on the weekly scan", body: "Track changes on their own and get the report by email.", href: `/projects/${projects[0].id}/settings` },
                  { icon: ShareNetwork, title: "Share a report", body: "Send investors or clients a private link or a PDF.", href: `/projects/${projects[0].id}/reports` },
                ].map(({ icon: Icon, title, body, href }) => (
                  <Link key={title} href={href} className="group flex items-start gap-3.5 rounded-[16px] border border-line-strong bg-surface p-5 transition-shadow hover:shadow-[0_16px_40px_-24px_rgb(0_0_0/0.3)]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-sunken text-ink-2">
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-ink">{title}</span>
                      <span className="mt-0.5 block text-[12px] text-muted">{body}</span>
                    </span>
                    <ArrowRight size={14} className="mt-1 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
