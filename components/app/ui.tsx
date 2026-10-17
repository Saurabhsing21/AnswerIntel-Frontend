"use client";

import { ArrowDownRight, ArrowUpRight, WarningCircle } from "@phosphor-icons/react";
import type { Verdict } from "@/lib/api/types";
import { cx } from "@/lib/cx";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em] md:text-[26px]">{title}</h1>
        {description && <p className="mt-0.5 max-w-[680px] text-[13px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto">{actions}</div>}
    </div>
  );
}

/** Pill-style tabs for filtering a list. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  label: string;
  options: { key: T; label: string; count?: number; icon?: React.ReactNode }[];
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-[12px] bg-sunken p-1">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.key)}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-colors",
              on ? "bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted hover:text-ink",
            )}
          >
            {o.icon}
            {o.label}
            {o.count != null && <span className="font-mono text-[11px] text-faint">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** A row of headline numbers that sits above a list, so the page opens with the answer. */
export function StatStrip({ stats }: { stats: { label: string; value: string | number; hint?: string; icon?: React.ReactNode }[] }) {
  return (
    <dl className="mb-4 grid grid-cols-2 overflow-hidden rounded-[16px] border border-line-strong bg-surface lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={s.label} className={cx("flex items-center gap-3 px-5 py-4", i % 2 === 1 && "border-l border-line", i > 1 && "border-t border-line lg:border-t-0", i > 0 && "lg:border-l lg:border-line")}>
          {s.icon && <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-sunken text-ink-2">{s.icon}</span>}
          <div className="min-w-0">
            <dt className="text-[12px] text-muted">{s.label}</dt>
            <dd className="font-mono text-[22px] leading-tight tabular-nums text-ink">{s.value}</dd>
            {s.hint && <dd className="truncate text-[11px] text-faint">{s.hint}</dd>}
          </div>
        </div>
      ))}
    </dl>
  );
}

export function Card({ title, subtitle, action, className, children }: { title?: string; subtitle?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cx("overflow-hidden rounded-[16px] border border-line-strong bg-surface", className)}>
      {(title || action) && (
        <header className="flex items-start gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-[14px] font-medium text-ink">{title}</h2>}
            {subtitle && <p className="text-[12px] text-muted">{subtitle}</p>}
          </div>
          {action && <div className="ml-auto shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function VerdictPill({ verdict, position }: { verdict: Verdict; position?: number | null }) {
  const label = verdict === "recommended" ? "Recommended" : verdict === "mentioned" ? "Mentioned" : "Not mentioned";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        verdict === "recommended" && "bg-ink text-white",
        verdict === "mentioned" && "bg-sunken text-ink",
        verdict === "absent" && "border border-dashed border-line-strong text-muted",
      )}
    >
      {label}
      {position != null && <span className="font-mono opacity-70">#{position}</span>}
    </span>
  );
}

export function Delta({ value, suffix = "pts" }: { value: number | null | undefined; suffix?: string }) {
  if (value == null) return null;
  if (value === 0) return <span className="whitespace-nowrap font-mono text-[11px] text-faint">no change</span>;
  const up = value > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cx("inline-flex items-center gap-0.5 whitespace-nowrap font-mono text-[11px]", up ? "text-up" : "text-down")}>
      <Icon size={11} weight="bold" />
      {Math.abs(Math.round(value * 1000) / 10)} {suffix}
    </span>
  );
}

export function ImpactPill({ impact }: { impact: "high" | "medium" | "low" }) {
  return (
    <span
      className={cx(
        "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
        impact === "high" && "bg-[#fdf2f2] text-[#b91c1c]",
        impact === "medium" && "bg-[#fdf6dd] text-[#a16207]",
        impact === "low" && "bg-sunken text-ink-2",
      )}
    >
      {impact} impact
    </span>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-3 text-faint">{icon}</div>}
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {body && <p className="mt-1 max-w-[420px] text-[13px] text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-[12px] border border-[#f3c4c4] bg-[#fdf3f3] px-4 py-3 text-[13px] text-[#b42318]">
      <WarningCircle size={16} className="mt-px shrink-0" />
      {message}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-[10px] bg-sunken", className)} />;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-[12px] text-down">{error}</span>}
    </label>
  );
}

export const inputClass =
  "h-10 w-full rounded-[10px] border border-line-strong bg-surface px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink";
