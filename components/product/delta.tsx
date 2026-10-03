import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react/ssr";
import { cx } from "@/lib/cx";

export function Delta({ value }: { value: number }) {
  if (value === 0) {
    return <span className="font-mono text-[11px] text-faint">0.0</span>;
  }
  const up = value > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-0.5 font-mono text-[11px] tabular-nums",
        up ? "text-up" : "text-down",
      )}
    >
      <Icon size={11} weight="bold" aria-hidden />
      {Math.abs(value).toFixed(1)}
    </span>
  );
}

export function SentimentChip({ value }: { value: number }) {
  const color = value >= 80 ? "#16a34a" : value >= 70 ? "#eab308" : "#e5484d";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-line-strong bg-surface px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-ink">
      <span aria-hidden className="h-3 w-[3px] rounded-full" style={{ background: color }} />
      {value}
    </span>
  );
}

export function PositionChip({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[5px] border border-line-strong bg-surface px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-ink">
      <span aria-hidden className="text-faint">#</span>
      {value.toFixed(1)}
    </span>
  );
}
