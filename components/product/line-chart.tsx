"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { ease } from "@/lib/motion";
import type { Brand } from "@/lib/data";

const W = 560;
const H = 200;
const PAD = { top: 12, right: 12, bottom: 26, left: 12 };

type Line = { brand: Brand; values: number[] };

function toPoints(values: number[], min: number, max: number) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  return values.map((v, i) => [
    PAD.left + (i / (values.length - 1)) * innerW,
    PAD.top + (1 - (v - min) / (max - min)) * innerH,
  ]);
}

// Catmull-Rom to cubic Bezier: smooth curves that pass through every point.
function smoothPath(pts: number[][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function LineChart({
  lines,
  labels,
  defaultIndex = 3,
}: {
  lines: Line[];
  labels: string[];
  defaultIndex?: number;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(defaultIndex);

  const all = lines.flatMap((l) => l.values);
  const min = Math.floor(Math.min(...all) / 10) * 10 - 5;
  const max = Math.ceil(Math.max(...all) / 10) * 10 + 5;
  const plotted = lines.map((l) => ({ ...l, pts: toPoints(l.values, min, max) }));
  const x = plotted[0].pts[active][0];
  const flip = active >= labels.length - 2;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const i = Math.round(ratio * (labels.length - 1));
    setActive(Math.max(0, Math.min(labels.length - 1, i)));
  }

  const ranked = [...plotted].sort((a, b) => b.values[active] - a.values[active]);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerLeave={() => setActive(defaultIndex)}
        role="img"
        aria-label="Sample visibility trend for five brands over six months"
      >
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + t * (H - PAD.top - PAD.bottom)}
            y2={PAD.top + t * (H - PAD.top - PAD.bottom)}
            stroke="rgb(0 0 0 / 0.06)"
            strokeDasharray="3 4"
          />
        ))}
        <motion.line
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke="rgb(0 0 0 / 0.14)"
          animate={{ x1: x, x2: x }}
          transition={{ duration: reduce ? 0 : 0.25, ease }}
        />
        {plotted.map((l, i) => (
          <motion.path
            key={l.brand.id}
            fill="none"
            stroke={l.brand.color}
            strokeWidth={l.brand.you ? 2.25 : 1.75}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0, d: smoothPath(l.pts) }}
            animate={{ d: smoothPath(l.pts) }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{
              pathLength: { duration: 1.2, delay: i * 0.08, ease },
              d: { duration: reduce ? 0 : 0.5, ease },
            }}
          />
        ))}
        {plotted.map((l) => (
          <motion.circle
            key={l.brand.id}
            r={3.5}
            fill="#fff"
            stroke={l.brand.color}
            strokeWidth={1.75}
            animate={{ cx: l.pts[active][0], cy: l.pts[active][1] }}
            transition={{ duration: reduce ? 0 : 0.25, ease }}
          />
        ))}
        {labels.map((label, i) => (
          <text
            key={label}
            x={plotted[0].pts[i][0]}
            y={H - 6}
            textAnchor="middle"
            className="fill-faint text-[10px]"
          >
            {label}
          </text>
        ))}
      </svg>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-2 w-[168px] rounded-[10px] bg-night p-2.5 text-white shadow-[0_8px_24px_rgb(0_0_0/0.18)]"
        animate={{
          left: `${(x / W) * 100}%`,
          x: flip ? "calc(-100% - 12px)" : "12px",
        }}
        transition={{ duration: reduce ? 0 : 0.25, ease }}
      >
        <p className="mb-1.5 text-[11px] font-medium">{labels[active]} 2026</p>
        <ul className="space-y-1">
          {ranked.map((l) => (
            <li key={l.brand.id} className="flex items-center gap-2 text-[11px]">
              <span className="size-2 rounded-[2px]" style={{ background: l.brand.color }} />
              <span className={l.brand.you ? "text-white" : "text-white/60"}>{l.brand.name}</span>
              <span className="ml-auto font-mono tabular-nums">{l.values[active]}%</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
