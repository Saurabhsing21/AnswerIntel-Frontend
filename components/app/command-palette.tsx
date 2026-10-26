"use client";

import { ArrowRight, ChartLine, Flask, MagnifyingGlass, Play, Plus, SquaresFour, UserPlus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandTile } from "@/components/app/brand-tile";
import { NAV } from "@/components/app/nav";
import { useProject } from "@/components/app/project-context";
import { YOU_COLOR } from "@/lib/brand";
import { cx } from "@/lib/cx";

export const OPEN_PALETTE_EVENT = "answerintel:palette";

type Command = { id: string; group: "Actions" | "Pages" | "Projects"; label: string; icon: React.ReactNode; run: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const show = () => setOpen(true);
    window.addEventListener("keydown", toggle);
    window.addEventListener(OPEN_PALETTE_EVENT, show);
    return () => {
      window.removeEventListener("keydown", toggle);
      window.removeEventListener(OPEN_PALETTE_EVENT, show);
    };
  }, []);

  // Mounted only while open, so every opening starts with an empty search.
  return open ? <PaletteDialog onClose={() => setOpen(false)} /> : null;
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { projectId, projects, startScan } = useProject();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const go = (path: string) => () => router.push(path);
    const base = projectId ? `/projects/${projectId}` : null;
    const list: Command[] = [];
    if (base) {
      list.push(
        { id: "scan", group: "Actions", label: "Run a new scan", icon: <Play size={16} />, run: () => void startScan() },
        { id: "report", group: "Actions", label: "Generate a weekly report", icon: <ChartLine size={16} />, run: go(`${base}/reports?new=weekly`) },
        { id: "experiment", group: "Actions", label: "Start an experiment", icon: <Flask size={16} />, run: go(`${base}/experiments?new=1`) },
        { id: "competitor", group: "Actions", label: "Add a competitor", icon: <UserPlus size={16} />, run: go(`${base}/competitors?add=1`) },
      );
      for (const group of NAV) {
        for (const { href, label, icon: Icon } of group.items) {
          list.push({ id: `page-${href}`, group: "Pages", label, icon: <Icon size={16} />, run: go(`${base}${href}`) });
        }
      }
    }
    list.push({ id: "new-project", group: "Actions", label: "New project", icon: <Plus size={16} />, run: go("/projects/new") });
    list.push({ id: "all-projects", group: "Pages", label: "All projects", icon: <SquaresFour size={16} />, run: go("/projects") });
    for (const p of projects) {
      list.push({ id: `project-${p.id}`, group: "Projects", label: p.brand_name, icon: <BrandTile name={p.brand_name} color={YOU_COLOR} size={16} website={p.website} />, run: go(`/projects/${p.id}`) });
    }
    return list;
  }, [projectId, projects, router, startScan]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  const choose = (command?: Command) => {
    if (!command) return;
    onClose();
    command.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[cursor]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 px-4 pt-[12vh]" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Quick search" onKeyDown={onKeyDown} className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[16px] border border-line-strong bg-surface shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]">
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <MagnifyingGlass size={16} className="text-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Search pages, actions and projects"
            aria-label="Search"
            className="h-12 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
          />
          <kbd className="rounded-[4px] border border-line px-1.5 font-mono text-[10px] text-faint">esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-1.5" role="listbox">
          {results.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-muted">Nothing matches &ldquo;{query}&rdquo;.</li>}
          {results.map((c, i) => {
            const header = c.group !== lastGroup;
            lastGroup = c.group;
            return (
              <li key={c.id} role="option" aria-selected={i === cursor}>
                {header && <p className="px-2.5 pt-2 pb-1 text-[11px] text-faint">{c.group}</p>}
                <button
                  type="button"
                  onClick={() => choose(c)}
                  onPointerMove={() => setCursor(i)}
                  className={cx("flex w-full items-center gap-3 rounded-[8px] px-2.5 py-2 text-left text-[13px]", i === cursor ? "bg-sunken text-ink" : "text-ink-2")}
                >
                  <span className="grid size-5 place-items-center text-ink-2">{c.icon}</span>
                  <span className="flex-1 truncate">{c.label}</span>
                  {i === cursor && <ArrowRight size={13} className="text-faint" />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-faint">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
        </div>
      </div>
    </div>
  );
}
