"use client";

import { Check, Globe } from "@phosphor-icons/react";
import { EngineIcon } from "@/components/product/engine-icon";
import { useApi } from "@/lib/api/client";
import type { EngineOption } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { askUpgrade, ProBadge } from "@/components/app/pro-lock";

/** Weekly tracking runs about 4.3 times a month. */
export const RUNS_PER_MONTH = 4.3;

/** The engine catalog, with a retry when it fails to load. */
export function useEngines() {
  const { data, error, reload } = useApi<EngineOption[]>("/engines");
  return { engines: data, failed: Boolean(error), retry: reload };
}

/** Pick the AI engines a project scans. `value` holds engine keys; unavailable engines can't be chosen.
 * On the free trial, `locked` engines show a Pro badge and `max` caps how many can be picked. */
export function EnginePicker({ engines, value, onChange, wide, locked = [], max = null }: {
  engines: EngineOption[]; value: string[]; onChange: (keys: string[]) => void; wide?: boolean; locked?: string[]; max?: number | null;
}) {
  const selectable = engines.filter((e) => e.available && !locked.includes(e.key));
  const capped = (keys: string[]) => (max == null ? keys : keys.slice(0, max));
  const toggle = (key: string) => {
    if (locked.includes(key)) return askUpgrade(`${engines.find((e) => e.key === key)?.name ?? "This engine"} is on paid plans. Paid plans scan every AI engine.`, "engines");
    if (value.includes(key)) return onChange(value.filter((k) => k !== key));
    if (max != null && value.length >= max) return askUpgrade(`The free scan uses up to ${max} AI engines. Paid plans use all of them.`, "engines");
    onChange([...value, key]);
  };
  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-[12px]">
        <span className="text-muted">{value.length} of {max ?? selectable.length} selected{max != null && " on the free scan"}</span>
        <span className="ml-auto flex gap-3">
          <button type="button" onClick={() => onChange(capped(selectable.filter((e) => e.default).map((e) => e.key)))} className="font-medium text-ink-2 hover:text-ink">
            Recommended
          </button>
          {max == null && (
            <button type="button" onClick={() => onChange(selectable.map((e) => e.key))} className="font-medium text-ink-2 hover:text-ink">
              All
            </button>
          )}
        </span>
      </div>
      <ul className={cx("grid gap-2 sm:grid-cols-2", wide && "lg:grid-cols-3 2xl:grid-cols-4")}>
        {engines.map((e) => {
          const on = value.includes(e.key);
          return (
            <li key={e.key}>
              <button
                type="button"
                disabled={!e.available}
                onClick={() => toggle(e.key)}
                aria-pressed={on}
                className={cx(
                  "flex h-[52px] w-full items-center gap-3 rounded-[12px] border px-3 text-left transition-[border-color,background-color,box-shadow] duration-150",
                  !e.available
                    ? "cursor-not-allowed border-dashed border-line bg-transparent opacity-60"
                    : locked.includes(e.key)
                    ? "border-line bg-[#fbfbfa] hover:border-line-strong"
                    : on
                      ? "border-ink bg-mark-soft/45 shadow-[0_0_0_1px_var(--color-ink)]"
                      : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-line bg-surface">
                  <EngineIcon engine={e.key} size={16} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{e.name}</span>
                {e.available && locked.includes(e.key) ? (
                  <ProBadge />
                ) : !e.available ? (
                  <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-muted">{e.key === "google" ? "Needs setup" : "Coming soon"}</span>
                ) : (
                  e.web_search && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted" title="Searches the web before answering, like the real app">
                      <Globe size={12} /> Web
                    </span>
                  )
                )}
                {e.available && !locked.includes(e.key) && (
                  <span className={cx("grid size-5 shrink-0 place-items-center rounded-full border transition-colors", on ? "border-mark-strong bg-mark text-ink" : "border-line-strong")}>
                    {on && <Check size={11} weight="bold" />}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** How many AI answers this choice uses against the plan's allowance: a month of weekly scans, or one free scan. */
export function AnswerEstimate({ prompts, engines, allowance, trial }: { prompts: number; engines: number; allowance?: number; trial?: boolean }) {
  const total = trial ? prompts * engines : Math.round(prompts * engines * RUNS_PER_MONTH);
  const over = allowance != null && total > allowance;
  return (
    <p className={cx("text-[12px]", over ? "text-down" : "text-muted")}>
      {prompts} questions × {engines} engines{trial ? " = " : ", weekly ≈ "}
      <span className="font-medium tabular-nums">{total.toLocaleString()}</span> AI answers{trial ? " in your free scan" : " a month"}
      {allowance != null && <> of your {allowance.toLocaleString()}</>}
      {over && `. Switch off some ${trial ? "engines" : "questions or engines"} to stay within your ${trial ? "free trial" : "plan"}.`}
    </p>
  );
}
