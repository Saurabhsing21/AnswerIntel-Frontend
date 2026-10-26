"use client";

import { Buildings, CaretUpDown, Check, MagnifyingGlass, Plus, SignOut, SquaresFour, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api, useApi } from "@/lib/api/client";
import { PlanCard } from "@/components/app/billing";
import { BrandTile } from "@/components/app/brand-tile";
import { OPEN_PALETTE_EVENT } from "@/components/app/command-palette";
import { NAV } from "@/components/app/nav";
import { MenuItem, MenuLabel, Popover } from "@/components/app/popover";
import { ProBadge, usePro } from "@/components/app/pro-lock";
import { useProject } from "@/components/app/project-context";
import { EngineIcon } from "@/components/product/engine-icon";
import { Logo } from "@/components/ui/logo";
import type { Me } from "@/lib/api/types";
import { YOU_COLOR } from "@/lib/brand";
import { cx } from "@/lib/cx";
import { formatHour, nextRun, relativeDay, WEEKDAYS } from "@/lib/schedule";

const itemClass = (active: boolean) =>
  cx(
    "flex items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[13px] transition-colors",
    active ? "bg-mark-soft font-medium text-ink" : "text-ink-2 hover:bg-black/[0.04] hover:text-ink",
  );

const STATUS_COLOR = { completed: "bg-up", partial: "bg-[#eab308]", failed: "bg-down", queued: "bg-ink", running: "bg-ink" } as const;

function ProjectSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { project, projects, workspaces } = useProject();
  const workspaceName = workspaces.find((w) => w.id === project?.workspace_id)?.name;

  return (
    <Popover
      className="w-[calc(100%)] min-w-[232px]"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex w-full items-center gap-2.5 rounded-[10px] border border-line bg-surface px-2.5 py-2 text-left transition-colors hover:border-line-strong"
        >
          {project ? <BrandTile name={project.brand_name} color={YOU_COLOR} size={24} website={project.website} /> : <SquaresFour size={22} className="text-ink-2" />}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-tight text-ink">{project?.brand_name ?? "All projects"}</span>
            <span className="block truncate text-[11px] leading-tight text-muted">{workspaceName ?? "Choose a project"}</span>
          </span>
          <CaretUpDown size={14} className="shrink-0 text-faint" />
        </button>
      )}
    >
      {(close) => (
        <div className="max-h-[60vh] overflow-y-auto">
          {workspaces.map((w) => {
            const inWorkspace = projects.filter((p) => p.workspace_id === w.id);
            return (
              <div key={w.id}>
                <MenuLabel>{w.name}</MenuLabel>
                {inWorkspace.length === 0 && <p className="px-2 pb-1.5 text-[12px] text-faint">No projects yet</p>}
                {inWorkspace.map((p) => (
                  <MenuItem
                    key={p.id}
                    href={`/projects/${p.id}`}
                    active={p.id === project?.id}
                    onClick={() => {
                      close();
                      onNavigate?.();
                    }}
                  >
                    <BrandTile name={p.brand_name} color={YOU_COLOR} size={18} website={p.website} />
                    <span className="min-w-0 flex-1 truncate">{p.brand_name}</span>
                    {p.id === project?.id && <Check size={13} weight="bold" />}
                  </MenuItem>
                ))}
              </div>
            );
          })}
          <div className="mt-1.5 border-t border-line pt-1.5">
            <MenuItem href="/projects" onClick={() => { close(); onNavigate?.(); }}>
              <SquaresFour size={16} /> All projects
            </MenuItem>
            <MenuItem href="/projects/new" onClick={() => { close(); onNavigate?.(); }}>
              <Plus size={16} /> New project
            </MenuItem>
            <MenuItem href="/workspaces/new" onClick={() => { close(); onNavigate?.(); }}>
              <Buildings size={16} /> New workspace
            </MenuItem>
          </div>
        </div>
      )}
    </Popover>
  );
}

const NUDGE_KEY = "seenlens:weekly-off-dismissed";

function NextScanCard() {
  const { projectId, schedule } = useProject();
  const pro = usePro();
  // The scan card is a notice: dismissable, and back on the next visit (sessionStorage, not localStorage).
  const [dismissed, setDismissed] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem(NUDGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  // Waits for the schedule: no "off" flash while it loads, and the server render never differs from the browser.
  if (!projectId || !schedule) return null;
  const next = schedule.enabled ? nextRun(schedule.day_of_week, schedule.hour) : null;
  if (dismissed) return null;
  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(NUDGE_KEY, "1");
    } catch {
      // storage blocked: hidden until reload, which is fine
    }
  };
  return (
    <div className="mx-3 mb-3 rounded-[12px] border border-line bg-surface p-3 text-[11px]">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-medium text-ink">{next ? "Next scan" : pro ? "Weekly scan is off" : <>Weekly tracking <ProBadge /></>}</p>
          <p className="mt-0.5 text-muted">
            {next ? `${WEEKDAYS[schedule.day_of_week]} ${formatHour(schedule.hour)}, ${relativeDay(next)}` : "Track changes automatically."}
          </p>
        </div>
        {!next && pro && (
          <Link href={`/projects/${projectId}/settings`} className="shrink-0 rounded-full bg-ink px-2.5 py-1 font-medium text-white transition-colors hover:bg-[#2b2b2b]">
            Turn on
          </Link>
        )}
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="-mt-0.5 -mr-1 grid size-6 shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-sunken hover:text-ink">
          <X size={12} />
        </button>
      </div>
      {/* Decorative: dropped on short screens so the navigation above it stays reachable. */}
      <div className="mt-2.5 flex items-center gap-1.5 [@media(max-height:820px)]:hidden">
        {(["chatgpt", "perplexity", "gemini"] as const).map((engine) => (
          <span key={engine} className="grid size-6 place-items-center rounded-full border border-line">
            <EngineIcon engine={engine} size={11} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { projectId, scans } = useProject();
  const me = useApi<Me>("/auth/me");
  const base = projectId ? `/projects/${projectId}` : null;

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col bg-[#fbfbfb]">
      <div className="px-4 pt-4 pb-3">
        <Link href="/projects" aria-label="All projects" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <div className="space-y-2 px-3">
        <ProjectSwitcher onNavigate={onNavigate} />
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
          className="flex w-full items-center gap-2 rounded-[8px] border border-line bg-surface px-2.5 py-1.5 text-[12px] text-faint transition-colors hover:border-line-strong hover:text-muted"
        >
          <MagnifyingGlass size={14} />
          Quick search
          <kbd className="ml-auto rounded-[4px] border border-line px-1 font-mono text-[10px]">⌘K</kbd>
        </button>
      </div>

      <nav aria-label="Main" className="mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        {base ? (
          <>
            {NAV.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="px-2 pb-1 text-[11px] text-faint">{group.label}</p>
                {group.items.map(({ href, label, icon: Icon }) => {
                  const target = `${base}${href}`;
                  const active = href === "" ? pathname === target : pathname.startsWith(target);
                  return (
                    <Link key={href} href={target} onClick={onNavigate} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                      <Icon size={16} />
                      {label}
                    </Link>
                  );
                })}
                {group.label === "More" && scans.length > 0 && (
                  <div className="mt-3">
                    <p className="px-2 pb-1 text-[11px] text-faint">Recent scans</p>
                    {scans.slice(0, 3).map((scan, i) => (
                      <Link
                        key={scan.id}
                        href={`${base}/scans/${scan.id}`}
                        onClick={onNavigate}
                        className={cx("flex items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[12px] text-ink-2 transition-colors hover:bg-black/[0.04] hover:text-ink", i === 2 && "[@media(max-height:820px)]:hidden")}
                      >
                        <span className={cx("size-1.5 shrink-0 rounded-full", STATUS_COLOR[scan.status], scan.status === "running" && "animate-pulse")} aria-label={scan.status} />
                        {new Date(scan.completed_at ?? scan.created_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        {scan.kind === "retest" && <span className="rounded-[4px] bg-sunken px-1 text-[10px] text-muted">Re-test</span>}
                        <span className="ml-auto font-mono text-faint">
                          {scan.completed_runs}/{scan.total_runs}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="mb-3">
            <p className="px-2 pb-1 text-[11px] text-faint">General</p>
            <Link href="/projects" onClick={onNavigate} className={itemClass(pathname === "/projects")}>
              <SquaresFour size={16} /> Projects
            </Link>
            <Link href="/projects/new" onClick={onNavigate} className={itemClass(pathname === "/projects/new")}>
              <Plus size={16} /> New project
            </Link>
          </div>
        )}
      </nav>

      <PlanCard onNavigate={onNavigate} />
      <NextScanCard />

      <div className="flex items-center gap-2.5 border-t border-line px-4 py-3">
        <Link href="/account" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[8px] transition-colors hover:text-ink" title="Account settings">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white" aria-hidden>
            {(me.data?.name || me.data?.email)?.[0]?.toUpperCase() ?? "?"}
          </span>
          <span className="min-w-0 flex-1 truncate text-[12px] text-ink-2">{me.data?.name || me.data?.email || "Signed in"}</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink"
          aria-label="Log out"
        >
          <SignOut size={16} />
        </button>
      </div>
    </div>
  );
}
