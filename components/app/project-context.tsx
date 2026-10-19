"use client";

import { usePathname, useParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Billing, Project, Scan, Schedule, Workspace } from "@/lib/api/types";
import { useToast } from "@/components/app/toast";

export const isScanActive = (scan?: Scan | null) => scan?.status === "queued" || scan?.status === "running";

type ProjectState = {
  projectId: string | null;
  project: Project | null;
  projects: Project[];
  projectsLoading: boolean;
  workspaces: Workspace[];
  scans: Scan[];
  latestScan: Scan | null;
  schedule: Schedule | null;
  /** Plan, status and usage of the current project's workspace. */
  billing: Billing | null;
  /** Changes whenever the latest scan starts or finishes, so pages know to re-fetch their numbers. */
  scanKey: string;
  starting: boolean;
  startScan: () => Promise<void>;
  reloadScans: () => void;
  reloadSchedule: () => void;
  reloadProjects: () => void;
  reloadBilling: () => void;
};

const ProjectContext = createContext<ProjectState | null>(null);

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside <ProjectProvider>");
  return ctx;
}

/** Run `reload` whenever a scan starts or finishes, but not on first render. */
export function useRefreshOnScan(reload: () => void) {
  const { scanKey } = useProject();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    reload();
  }, [scanKey, reload]);
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id?: string }>();
  const pathname = usePathname();
  const projects = useApi<Project[]>("/projects");
  const workspaces = useApi<Workspace[]>("/workspaces");
  const { reload: reloadProjects } = projects;

  // New projects should appear in the switcher as soon as you land back in the app.
  useEffect(() => reloadProjects(), [pathname, reloadProjects]);

  // Keyed by project: switching projects drops the previous project's scans and schedule instead of flashing them.
  return (
    <ScopedProvider
      key={id ?? "none"}
      projectId={id ?? null}
      projects={projects.data ?? []}
      projectsLoading={projects.loading}
      workspaces={workspaces.data ?? []}
      reloadProjects={reloadProjects}
    >
      {children}
    </ScopedProvider>
  );
}

function ScopedProvider({
  projectId,
  projects,
  projectsLoading,
  workspaces,
  reloadProjects,
  children,
}: {
  projectId: string | null;
  projects: Project[];
  projectsLoading: boolean;
  workspaces: Workspace[];
  reloadProjects: () => void;
  children: React.ReactNode;
}) {
  const toast = useToast();
  const scansQ = useApi<Scan[]>(projectId ? `/projects/${projectId}/scans` : null, (d) => (d?.some(isScanActive) ? 2000 : undefined));
  const scheduleQ = useApi<Schedule>(projectId ? `/projects/${projectId}/schedule` : null);
  const workspaceId = projects.find((p) => p.id === projectId)?.workspace_id;
  const billingQ = useApi<Billing>(workspaceId ? `/workspaces/${workspaceId}/billing` : null);
  const [starting, setStarting] = useState(false);
  const { reload: reloadScans } = scansQ;
  const { reload: reloadBilling } = billingQ;

  const scans = scansQ.data ?? [];
  const latestScan = scans[0] ?? null;
  const scanKey = `${latestScan?.id ?? 0}:${latestScan?.status ?? "none"}`;

  const startScan = useCallback(async () => {
    if (!projectId) return;
    setStarting(true);
    try {
      await api(`/projects/${projectId}/scans`, { method: "POST" });
      toast.push("Scan started. Answers arrive in about a minute.", "info");
      reloadScans();
      reloadBilling(); // scans today
    } catch (e) {
      if (!(e as ApiError).limit) toast.push((e as ApiError).message, "error"); // plan limits get the upgrade prompt instead
    } finally {
      setStarting(false);
    }
  }, [projectId, reloadScans, reloadBilling, toast]);

  const value = useMemo<ProjectState>(
    () => ({
      projectId,
      project: projects.find((p) => p.id === projectId) ?? null,
      projects,
      projectsLoading,
      workspaces,
      scans,
      latestScan,
      schedule: scheduleQ.data,
      billing: billingQ.data,
      scanKey,
      starting,
      startScan,
      reloadScans,
      reloadSchedule: scheduleQ.reload,
      reloadProjects,
      reloadBilling,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, projects, projectsLoading, workspaces, scansQ.data, scheduleQ.data, billingQ.data, scanKey, starting, startScan, reloadScans, scheduleQ.reload, reloadProjects, reloadBilling],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
