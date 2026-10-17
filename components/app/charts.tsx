"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { pct } from "@/lib/format";

export type BrandSeries = { name: string; color: string; isYou: boolean; values: (number | null)[] };

/** A tiny trend line for KPI tiles. */
export function Sparkline({ values, color = "#171717", width = 76, height = 24 }: { values: number[]; color?: string; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const span = Math.max(Math.max(...values) - min, 0.02);
  const points = values.map((v, i) => [2 + (i / (values.length - 1)) * (width - 4), height - 3 - ((v - min) / span) * (height - 6)] as const);
  const last = points[points.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" points={points.map((p) => p.join(",")).join(" ")} />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill="#fff" stroke={color} strokeWidth={1.75} />
    </svg>
  );
}

/** Catmull-Rom spline through the points, as a cubic Bezier path. */
function smooth(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const W = 720;
const H = 300;
const PAD = { t: 16, r: 22, b: 30, l: 42 };

function labelFor(dates: string[], i: number) {
  const sameDay = new Set(dates.map((d) => new Date(d).toDateString())).size === 1;
  const date = new Date(dates[i]);
  return sameDay ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** One line per brand across scans. Hover shows every brand's value for that scan. */
export function BrandLineChart({ series, dates, metricKey, label }: { series: BrandSeries[]; dates: string[]; metricKey: string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const n = dates.length;
  const ceiling = Math.max(0.05, ...series.flatMap((s) => s.values.filter((v): v is number => v != null)));
  // Round gridlines (5, 10, 20 or 25 points apart), with room above the highest line.
  const step = [0.05, 0.1, 0.2, 0.25].find((s) => ceiling / s <= 4) ?? 0.25;
  const top = Math.max(step * 2, Math.ceil((ceiling * 1.04) / step) * step);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const x = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / top) * (H - PAD.t - PAD.b);
  const active = hover ?? n - 1;
  const ordered = [...series.filter((s) => !s.isYou), ...series.filter((s) => s.isYou)]; // your line is drawn on top
  const labelEvery = Math.ceil(n / 6);
  const readout = [...series].sort((a, b) => (b.values[active] ?? 0) - (a.values[active] ?? 0));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-pan-y"
        role="img"
        aria-label={`${label} for each brand across ${n} scans. Latest: ${readout.map((s) => `${s.name} ${pct(s.values[n - 1])}`).join(", ")}.`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(n - 1, Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (n - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((value, t) => (
          <g key={value}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(value)} y2={y(value)} stroke="rgb(0 0 0 / 0.06)" strokeDasharray={t ? "3 5" : undefined} />
            <text x={PAD.l - 10} y={y(value) + 3.5} textAnchor="end" className="fill-faint text-[11px]">
              {Math.round(value * 100)}%
            </text>
          </g>
        ))}
        {hover !== null && <line x1={x(active)} x2={x(active)} y1={PAD.t} y2={H - PAD.b} stroke="rgb(0 0 0 / 0.14)" />}
        {ordered.map((s) => {
          const points = s.values.map((v, i) => (v == null ? null : ([x(i), y(v)] as [number, number]))).filter((p): p is [number, number] => p !== null);
          const end = points[points.length - 1];
          return (
            <g key={`${s.name}-${metricKey}`}>
              <motion.path
                d={smooth(points)}
                fill="none"
                stroke={s.color}
                strokeWidth={s.isYou ? 2.75 : 2}
                strokeLinecap="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
              {end && <circle cx={hover === null ? end[0] : x(active)} cy={hover === null ? end[1] : y(s.values[active] ?? 0)} r={4} fill="#fff" stroke={s.color} strokeWidth={2.25} />}
            </g>
          );
        })}
        {dates.map((_, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-faint text-[11px]">
              {labelFor(dates, i)}
            </text>
          ) : null,
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-3 z-10 min-w-[150px] rounded-[10px] bg-night px-3 py-2 text-[11px] text-white shadow-[0_12px_32px_-12px_rgb(0_0_0/0.6)]"
          style={{ left: `${(x(active) / W) * 100}%`, transform: `translateX(${active > n / 2 ? "calc(-100% - 12px)" : "12px"})` }}
        >
          <p className="mb-1.5 text-white/60">{labelFor(dates, active)}</p>
          {readout.map((s) => (
            <p key={s.name} className="flex items-center gap-2 py-0.5">
              <span className="h-[3px] w-3 rounded-full" style={{ background: s.color }} />
              <span className={s.isYou ? "font-medium" : "text-white/80"}>{s.name}</span>
              <span className="ml-auto pl-3 font-mono tabular-nums">{pct(s.values[active])}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** Today's value per brand as bars. Used until a second scan makes a trend possible. */
export function BrandBars({ series, label }: { series: BrandSeries[]; label: string }) {
  const rows = series.map((s) => ({ ...s, value: s.values[s.values.length - 1] ?? 0 })).sort((a, b) => b.value - a.value);
  const max = Math.max(0.01, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3" aria-label={`${label} by brand`}>
      {rows.map((r) => (
        <li key={r.name} className="grid grid-cols-[96px_1fr_44px] items-center gap-3 text-[13px]">
          <span className={r.isYou ? "truncate font-medium text-ink" : "truncate text-ink-2"}>{r.name}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-sunken">
            <motion.span
              className="block h-full rounded-full"
              style={{ background: r.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </span>
          <span className="text-right font-mono tabular-nums text-ink">{pct(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}
