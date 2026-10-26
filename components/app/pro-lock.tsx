"use client";

import { LockSimple } from "@phosphor-icons/react";
import { useProject } from "@/components/app/project-context";
import { ApiError, PLAN_LIMIT_EVENT } from "@/lib/api/client";
import { cx } from "@/lib/cx";

/** Whether the workspace has a paid plan. The free trial sees paid features, locked. */
export function usePro(): boolean {
  const { billing } = useProject();
  return billing?.limits.pro ?? true;
}

/** Opens the upgrade prompt the API's own limit errors open, for a locked thing the user clicked. */
export function askUpgrade(message: string, limit = "pro") {
  window.dispatchEvent(new CustomEvent(PLAN_LIMIT_EVENT, { detail: new ApiError(402, "PLAN_LIMIT", message, limit) }));
}

/** The small "Pro" lock shown on anything the free trial can see but not use. */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex shrink-0 items-center gap-1 rounded-full bg-mark px-1.5 py-0.5 text-[10px] font-semibold text-ink", className)}>
      <LockSimple size={10} weight="bold" /> Pro
    </span>
  );
}
