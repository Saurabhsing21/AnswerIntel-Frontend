"use client";

import { Check, Globe, LockSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useProject } from "@/components/app/project-context";
import { EngineIcon } from "@/components/product/engine-icon";
import { useApi } from "@/lib/api/client";
import type { EngineOption } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { PLANS } from "@/lib/billing/plans";
import { siteHref } from "@/lib/urls";

/** Weekly tracking runs about 4.3 times a month. */
export const RUNS_PER_MONTH = 4.3;

/** The engine catalog, with a retry when it fails to load. */
export function useEngines() {
  const { data, error, reload } = useApi<EngineOption[]>("/engines");
  return { engines: data, failed: Boolean(error), retry: reload };
}

/** Where "Upgrade to X" goes: the plans on the website for the free trial, the billing page for everyone else. */
function useUpgradeHref() {
  const { billing, projectId, projects } = useProject();
  const id = projectId ?? projects[0]?.id;
  return billing?.state === "free" || !id ? siteHref("/pricing") : `/projects/${id}/billing`;
}

const planName = (key: string) => PLANS.find((p) => p.key === key)?.name;

/** Pick the AI engines a project scans. `value` holds engine keys. Every engine is listed: ones the plan doesn't
 * include show a lock and the plan that unlocks them, and engines that aren't live yet show "Coming soon". */
export function EnginePicker({ engines, value, onChange, wide }: {
  engines: EngineOption[]; value: string[]; onChange: (keys: string[]) => void; wide?: boolean;
}) {
  const { billing } = useProject();
  const upgradeHref = useUpgradeHref();
  const locked = billing?.limits.locked_engines ?? [];
  const upgrades = billing?.limits.engine_upgrades ?? {};
  const selectable = engines.filter((e) => e.available && !locked.includes(e.key));
  const toggle = (key: string) => onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-[12px]">
        <span className="text-muted">{value.filter((k) => selectable.some((e) => e.key === k)).length} of {selectable.length} selected</span>
        <span className="ml-auto flex gap-3">
          <button type="button" onClick={() => onChange(selectable.filter((e) => e.default).map((e) => e.key))} className="font-medium text-ink-2 hover:text-ink">
            Recommended
          </button>
          <button type="button" onClick={() => onChange(selectable.map((e) => e.key))} className="font-medium text-ink-2 hover:text-ink">
            All
          </button>
        </span>
      </div>
      <ul className={cx("grid gap-2 sm:grid-cols-2", wide && "lg:grid-cols-3 2xl:grid-cols-4")}>
        {engines.map((e) => {
          const isLocked = e.available && locked.includes(e.key);
          const on = !isLocked && value.includes(e.key);
          const upgrade = upgrades[e.key];
          const row = "flex h-[52px] w-full items-center gap-3 rounded-[12px] border px-3 text-left transition-[border-color,background-color,box-shadow] duration-150";
          const icon = (
            <span className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-line bg-surface">
              <EngineIcon engine={e.key} size={16} />
            </span>
          );
          if (isLocked) {
            return (
              <li key={e.key}>
                <div className={cx(row, "border-line bg-[#fbfbfa]")}>
                  {icon}
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-muted">{e.name}</span>
                  <LockSimple size={13} weight="bold" className="shrink-0 text-muted" aria-label="Locked" />
                  {upgrade ? (
                    <Link href={upgradeHref} className="shrink-0 text-[11px] font-medium text-ink underline underline-offset-2">
                      Upgrade to {planName(upgrade)}
                    </Link>
                  ) : (
                    <span className="shrink-0 text-[11px] text-muted">Not on a plan</span>
                  )}
                </div>
              </li>
            );
          }
          return (
            <li key={e.key}>
              <button
                type="button"
                disabled={!e.available}
                onClick={() => toggle(e.key)}
                aria-pressed={on}
                className={cx(
                  row,
                  !e.available
                    ? "cursor-not-allowed border-dashed border-line bg-transparent opacity-60"
                    : on
                      ? "border-ink bg-mark-soft/45 shadow-[0_0_0_1px_var(--color-ink)]"
                      : "border-line bg-surface hover:border-line-strong",
                )}
              >
                {icon}
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{e.name}</span>
                {!e.available ? (
                  <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-muted">{e.key === "google" ? "Needs setup" : "Coming soon"}</span>
                ) : (
                  e.web_search && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted" title="Searches the web before answering, like the real app">
                      <Globe size={12} /> Web
                    </span>
                  )
                )}
                {e.available && (
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
