"use client";

import { CaretDown } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { BrandMark } from "@/components/product/brand-mark";
import { Delta, PositionChip, SentimentChip } from "@/components/product/delta";
import { competitorRows } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

export function CompetitorTable({ interactive = true }: { interactive?: boolean }) {
  const reduce = useReducedMotion();
  const [desc, setDesc] = useState(true);
  const rows = [...competitorRows].sort((a, b) =>
    desc ? b.visibility - a.visibility : a.visibility - b.visibility,
  );

  return (
    <table className="w-full text-left text-[12px]">
      <thead className="text-[11px] text-muted">
        <tr className="border-b border-line">
          <th className="w-7 py-2 pl-3 font-normal">#</th>
          <th className="py-2 font-normal">Brand</th>
          <th className="py-2 font-normal">
            {interactive ? (
              <button
                type="button"
                onClick={() => setDesc((d) => !d)}
                className="inline-flex items-center gap-1 rounded-[4px] transition-colors hover:text-ink"
                aria-label={`Sort by visibility, ${desc ? "ascending" : "descending"}`}
              >
                Visibility
                <CaretDown
                  size={10}
                  weight="bold"
                  className={cx("transition-transform duration-200", !desc && "rotate-180")}
                />
              </button>
            ) : (
              "Visibility"
            )}
          </th>
          <th className="hidden py-2 font-normal sm:table-cell">Sentiment</th>
          <th className="py-2 pr-3 font-normal">Position</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <motion.tr
            key={row.brand.id}
            layout={!reduce}
            transition={{ duration: 0.35, ease }}
            className={cx("border-b border-line last:border-0", row.brand.you && "bg-[#f6f8ff]")}
          >
            <td className="py-2.5 pl-3 font-mono text-faint">{i + 1}</td>
            <td className="py-2.5">
              <span className="flex items-center gap-2 font-medium text-ink">
                <BrandMark brand={row.brand} size={16} />
                {row.brand.name}
                {row.brand.you && (
                  <span className="rounded-[4px] bg-ink px-1 py-px text-[9px] font-medium text-white">
                    You
                  </span>
                )}
              </span>
            </td>
            <td className="py-2.5">
              <span className="flex items-center gap-2">
                <span className="font-mono tabular-nums">{row.visibility}%</span>
                <Delta value={row.visibilityDelta} />
              </span>
            </td>
            <td className="hidden py-2.5 sm:table-cell">
              <SentimentChip value={row.sentiment} />
            </td>
            <td className="py-2.5 pr-3">
              <PositionChip value={row.position} />
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}
