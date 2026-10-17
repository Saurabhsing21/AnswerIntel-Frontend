"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

/** A small dropdown. Closes on outside click and Escape; the trigger decides what it looks like. */
export function Popover({
  trigger,
  children,
  align = "left",
  className,
}: {
  trigger: (state: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={cx(
            "absolute z-40 mt-1.5 min-w-full rounded-[12px] border border-line-strong bg-surface p-1.5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.25)]",
            align === "right" ? "right-0" : "left-0",
            className ?? "w-64",
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

const itemClass = "flex w-full items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-left text-[13px] text-ink-2 transition-colors hover:bg-black/[0.04] hover:text-ink";

export function MenuItem({ href, onClick, children, active }: { href?: string; onClick?: () => void; children: React.ReactNode; active?: boolean }) {
  const cls = cx(itemClass, active && "bg-sunken font-medium text-ink");
  return href ? (
    <Link href={href} onClick={onClick} className={cls}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-2 pt-1.5 pb-1 text-[11px] text-faint">{children}</p>;
}
