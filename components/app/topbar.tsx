"use client";

import { ArrowClockwise, Calendar, CircleNotch, Export, FileCsv, FileHtml, FilePdf, List, Play, Plus, SquaresFour } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { ReportSummary, Scan } from "@/lib/api/types";
import { BrandTile } from "@/components/app/brand-tile";
import { MenuItem, MenuLabel, Popover } from "@/components/app/popover";
import { isScanActive, useProject } from "@/components/app/project-context";
import { useToast } from "@/components/app/toast";
import { EngineIcon } from "@/components/product/engine-icon";
import { buttonClass } from "@/components/ui/button";
import { YOU_COLOR } from "@/lib/brand";
import { timeAgo } from "@/lib/format";

const chip = "inline-flex shrink-0 items-center gap-1.5 rounded-[6px] bg-sunken px-2 py-1 text-[12px] text-ink-2";

function scanLabel(scan: Scan | null) {
  if (!scan) return "No scans yet";
  if (isScanActive(scan)) return `Scanning ${scan.completed_runs + scan.failed_runs}/${scan.total_runs}`;
  const when = timeAgo(scan.completed_at ?? scan.created_at);
  return scan.status === "failed" ? `Scan failed ${when}` : `Scanned ${when}`;
}

function ExportMenu() {
  const { projectId, scans } = useProject();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function exportLatest(format: "pdf" | "html") {
    const finished = scans.find((s) => s.status === "completed" || s.status === "partial");
    if (!projectId || !finished) {
      toast.push("Run a scan first, so there is something to export.", "error");
      return;
    }
    setBusy(true);
    try {
      const reports = await api<ReportSummary[]>(`/projects/${projectId}/reports`);
      // Reuse the newest report when it already describes the latest finished scan.
      const report =
        reports[0]?.scan_id === finished.id
          ? reports[0]
          : await api<ReportSummary>(`/projects/${projectId}/reports`, { method: "POST", json: { type: "manual" } });
      window.open(`/api/backend/projects/${projectId}/reports/${report.id}/export?format=${format}`, "_blank");
    } catch (e) {
      toast.push((e as ApiError).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Popover
      align="right"
      className="w-56"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-[rgb(0_0_0/0.22)] disabled:opacity-60"
        >
          {busy ? <CircleNotch size={14} className="animate-spin" /> : <Export size={14} />}
          <span className="hidden sm:inline">Export</span>
        </button>
      )}
    >
      {(close) => (
        <>
          <MenuLabel>Latest results</MenuLabel>
          <MenuItem onClick={() => { close(); void exportLatest("pdf"); }}>
            <FilePdf size={16} /> Download PDF
          </MenuItem>
          <MenuItem onClick={() => { close(); void exportLatest("html"); }}>
            <FileHtml size={16} /> Open as web page
          </MenuItem>
          <MenuItem
            onClick={() => {
              close();
              const finished = scans.find((s) => s.status === "completed" || s.status === "partial");
              if (!finished) return toast.push("Run a scan first, so there is something to export.", "error");
              const link = document.createElement("a"); // a file download, not a page navigation
              link.href = `/api/backend/projects/${projectId}/scans/${finished.id}/export.csv`;
              link.download = "";
              link.click();
            }}
          >
            <FileCsv size={16} /> Every answer (CSV)
          </MenuItem>
          <div className="mt-1 border-t border-line pt-1">
            <MenuItem href={`/projects/${projectId}/reports`} onClick={close}>
              All reports
            </MenuItem>
          </div>
        </>
      )}
    </Popover>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { projectId, project, latestScan, scans, starting, startScan } = useProject();
  const active = isScanActive(latestScan);
  const progress = latestScan ? Math.max(3, latestScan.progress * 100) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="flex h-[52px] items-center gap-2 px-3 md:px-5">
        <button
          type="button"
          onClick={onMenu}
          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-sunken lg:hidden"
          aria-label="Open menu"
        >
          <List size={18} />
        </button>

        {project ? (
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            <Link href={`/projects/${project.id}`} className={`${chip} transition-colors hover:bg-[#e8e8e5]`}>
              <BrandTile name={project.brand_name} color={YOU_COLOR} size={14} />
              <span className="max-w-[120px] truncate">{project.brand_name}</span>
            </Link>
            <Link href={`/projects/${project.id}/scans`} className={`${chip} hidden transition-colors hover:bg-[#e8e8e5] sm:inline-flex`}>
              <Calendar size={13} />
              {scanLabel(latestScan)}
            </Link>
            <span className={`${chip} hidden md:inline-flex`}>
              <span className="flex -space-x-1">
                {(["chatgpt", "perplexity", "gemini"] as const).map((engine) => (
                  <span key={engine} className="grid size-[18px] place-items-center rounded-full border border-surface bg-surface">
                    <EngineIcon engine={engine} size={10} />
                  </span>
                ))}
              </span>
              3 engines
            </span>
          </div>
        ) : (
          <h1 className="flex items-center gap-2 text-[14px] font-medium">
            {pathname === "/projects/new" ? <Plus size={16} /> : <SquaresFour size={16} />}
            {pathname === "/projects/new" ? "New project" : "Projects"}
          </h1>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {latestScan?.simulated && (
            <span
              title="No AI provider key is configured, so answers are generated locally."
              className="hidden rounded-[6px] border border-dashed border-line-strong px-2 py-1 text-[12px] text-muted lg:inline"
            >
              Sample data
            </span>
          )}
          {projectId ? (
            <>
              <ExportMenu />
              <button type="button" onClick={startScan} disabled={active || starting} className={buttonClass("primary", "sm")}>
                {active || starting ? <CircleNotch size={14} className="animate-spin" /> : scans.length ? <ArrowClockwise size={14} weight="bold" /> : <Play size={14} weight="fill" />}
                {active ? "Scanning" : scans.length ? "Run scan" : "Run first scan"}
              </button>
            </>
          ) : (
            <Link href="/projects/new" className={buttonClass("primary", "sm")}>
              <Plus size={14} weight="bold" /> New project
            </Link>
          )}
        </div>
      </div>
      {active && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-sunken" role="progressbar" aria-label="Scan progress" aria-valuenow={Math.round(progress)}>
          <div className="h-full bg-ink transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
      )}
    </header>
  );
}
