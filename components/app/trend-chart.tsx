"use client";

import { useState } from "react";
import type { Dashboard } from "@/lib/api/types";
import { pct } from "@/lib/format";

const SERIES = [
  { key: "mention_rate", label: "Mentions", color: "#171717" },
  { key: "recommendation_rate", label: "Recommendations", color: "#8f8f8c" },
  { key: "share_of_voice", label: "Share of voice", color: "#c9c9c6" },
] as const;

const W = 640;
const H = 200;
const PAD = { t: 14, r: 16, b: 26, l: 36 };

export function TrendChart({ trend }: { trend: Dashboard["trend"] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (trend.length < 2) {
    return (
      <div className="grid h-[200px] place-items-center px-6 text-center text-[13px] text-muted">
        Run another scan to see how your visibility changes over time.
      </div>
    );
  }
  const x = (i: number) => PAD.l + (i / (trend.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);
  const active = hover ?? trend.length - 1;
  // Several scans on one day: label points by time instead of a repeated date.
  const sameDay = new Set(trend.map((p) => new Date(p.date).toDateString())).size === 1;

  return (
    <div className="relative px-2 pb-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Visibility trend across scans"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const ratio = ((e.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(trend.length - 1, Math.round(((ratio - PAD.l) / (W - PAD.l - PAD.r)) * (trend.length - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="rgb(0 0 0 / 0.06)" strokeDasharray={t ? "3 4" : undefined} />
            <text x={PAD.l - 8} y={y(t) + 3} textAnchor="end" className="fill-faint text-[10px]">{Math.round(t * 100)}%</text>
          </g>
        ))}
        <line x1={x(active)} x2={x(active)} y1={PAD.t} y2={H - PAD.b} stroke="rgb(0 0 0 / 0.12)" />
        {SERIES.map((s) => (
          <g key={s.key}>
            <polyline
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              points={trend.map((p, i) => `${x(i)},${y(p[s.key])}`).join(" ")}
            />
            <circle cx={x(active)} cy={y(trend[active][s.key])} r={3.5} fill="#fff" stroke={s.color} strokeWidth={2} />
          </g>
        ))}
        {trend.map((p, i) => (
          <text key={p.scan_id} x={x(i)} y={H - 8} textAnchor="middle" className="fill-faint text-[10px]">
            {sameDay
              ? new Date(p.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
              : new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </text>
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 text-[12px]">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-muted">
            <span className="h-[3px] w-3 rounded-full" style={{ background: s.color }} />
            {s.label} <span className="font-mono text-ink">{pct(trend[active][s.key])}</span>
          </span>
        ))}
        <span className="ml-auto text-faint">Scan #{trend[active].scan_id}</span>
      </div>
    </div>
  );
}
