"use client";

import { CreditCard, Lock, Sparkle, Warning, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useProject } from "@/components/app/project-context";
import { ApiError, PLAN_LIMIT_EVENT } from "@/lib/api/client";
import type { Billing, BillingState } from "@/lib/api/types";
import { daysUntil } from "@/lib/billing/plans";
import { cx } from "@/lib/cx";

export const STATE_LABEL: Record<BillingState, string> = { trialing: "Trial", active: "Active", past_due: "Payment due", lapsed: "Read-only" };
const STATE_PILL: Record<BillingState, string> = {
  trialing: "bg-blue-soft text-blue-ink",
  active: "bg-up-soft text-up-ink",
  past_due: "bg-amber-soft text-amber-ink",
  lapsed: "bg-down-soft text-down-ink",
};

const LIMIT_LABEL: Record<string, string> = {
  projects: "projects",
  active_prompts: "active prompts per project",
  competitors: "competitors per project",
  seats: "seats",
  scans_per_day: "scans a day",
  schedules: "weekly scans",
  experiments: "experiments",
};

export function StatePill({ state }: { state: BillingState }) {
  return <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-medium", STATE_PILL[state])}>{STATE_LABEL[state]}</span>;
}

/** Where to send people to change the plan: the billing page of the current project, or of any project they have. */
function useBillingHref() {
  const { projectId, projects } = useProject();
  const id = projectId ?? projects[0]?.id;
  return id ? `/projects/${id}/billing` : null;
}

function bannerFor(billing: Billing): { tone: "amber" | "red"; text: string; cta: string } | null {
  if (billing.state === "lapsed") {
    const why = billing.plan === "trial" ? "Your trial has ended" : "Your subscription is not active";
    return { tone: "red", text: `${why}, so this workspace is read-only. You can still view and export everything.`, cta: "Choose a plan" };
  }
  if (billing.state === "past_due") {
    const by = billing.grace_ends_at ? ` by ${new Date(billing.grace_ends_at).toLocaleDateString(undefined, { month: "long", day: "numeric" })}` : "";
    return { tone: "amber", text: `Your last payment failed. Update your card${by} to keep scanning.`, cta: "Update payment" };
  }
  const days = daysUntil(billing.trial_ends_at);
  if (billing.state === "trialing" && days <= 7) {
    return { tone: "amber", text: `Your free trial ends ${days <= 1 ? "within a day" : `in ${days} days`}. Choose a plan to keep your scans running.`, cta: "See plans" };
  }
  return null;
}

/** Trial ending, payment failed or read-only: shown above every page of the workspace. */
export function BillingBanner() {
  const { billing } = useProject();
  const pathname = usePathname();
  const href = useBillingHref();
  if (!billing || !href || pathname.endsWith("/billing")) return null;
  const banner = bannerFor(billing);
  if (!banner) return null;
  const Icon = banner.tone === "red" ? Lock : Warning;
  return (
    <div
      role="status"
      className={cx(
        "mb-4 flex flex-col gap-2 rounded-[12px] border px-4 py-3 text-[13px] sm:flex-row sm:items-center",
        banner.tone === "red" ? "border-[#f3c4c4] bg-down-soft text-down-ink" : "border-[#f5dca0] bg-amber-soft text-amber-ink",
      )}
    >
      <span className="flex items-start gap-2">
        <Icon size={16} className="mt-px shrink-0" />
        {banner.text}
      </span>
      {billing.can_manage ? (
        <Link href={href} className="shrink-0 font-medium underline underline-offset-2 sm:ml-auto">
          {banner.cta}
        </Link>
      ) : (
        <span className="shrink-0 opacity-80 sm:ml-auto">Ask the workspace owner to update billing.</span>
      )}
    </div>
  );
}

/** Sidebar card: current plan, trial days left, and today's scans against the plan. */
export function PlanCard({ onNavigate }: { onNavigate?: () => void }) {
  const { billing } = useProject();
  const href = useBillingHref();
  if (!billing || !href) return null;
  const used = billing.usage.scans_today;
  const limit = billing.limits.scans_per_day;
  const trialDays = daysUntil(billing.trial_ends_at);
  const upgrade = billing.plan !== "pro" || billing.state === "lapsed";
  return (
    <div className="mx-3 mb-2 rounded-[12px] border border-line bg-surface p-3 text-[11px]">
      <div className="flex items-center gap-2">
        <CreditCard size={14} className="shrink-0 text-ink-2" />
        <p className="min-w-0 flex-1 truncate font-medium text-ink">
          {billing.plan_name}
          {billing.state === "trialing" && <span className="font-normal text-muted"> · {trialDays} {trialDays === 1 ? "day" : "days"} left</span>}
        </p>
        <StatePill state={billing.state} />
      </div>
      <div className="mt-2.5 [@media(max-height:820px)]:hidden">
        <div className="flex justify-between text-muted">
          <span>Scans today</span>
          <span className="font-mono tabular-nums">
            {used}/{limit}
          </span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-sunken">
          <div className={cx("h-full rounded-full", used >= limit ? "bg-down" : "bg-ink")} style={{ width: `${Math.min(100, (used / Math.max(1, limit)) * 100)}%` }} />
        </div>
      </div>
      {upgrade && billing.can_manage && (
        <Link href={href} onClick={onNavigate} className="mt-2.5 flex items-center justify-center gap-1 rounded-full bg-ink px-2.5 py-1 font-medium text-white transition-colors hover:bg-[#2b2b2b]">
          <Sparkle size={11} weight="fill" /> {billing.state === "lapsed" ? "Choose a plan" : "Upgrade"}
        </Link>
      )}
    </div>
  );
}

/** Pops up whenever the API refuses something because of the plan, with a way to upgrade. */
export function UpgradePrompt() {
  const { billing, reloadBilling } = useProject();
  const href = useBillingHref();
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const onLimit = (e: Event) => {
      setError((e as CustomEvent<ApiError>).detail);
      reloadBilling();
    };
    window.addEventListener(PLAN_LIMIT_EVENT, onLimit);
    return () => window.removeEventListener(PLAN_LIMIT_EVENT, onLimit);
  }, [reloadBilling]);

  if (!error) return null;
  const inactive = error.limit === "subscription";
  const title = inactive ? "Your plan is not active" : `You have reached your plan's ${LIMIT_LABEL[error.limit ?? ""] ?? "limit"}`;
  return (
    <div
      role="alertdialog"
      aria-label={title}
      className="fixed bottom-4 left-4 z-[65] w-[min(380px,calc(100vw-2rem))] rounded-[16px] border border-line-strong bg-surface p-4 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] lg:left-[264px]"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-mark-soft text-ink">
          {inactive ? <Lock size={18} /> : <Sparkle size={18} weight="fill" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-ink">{title}</p>
          <p className="mt-0.5 text-[13px] text-muted">{error.message}</p>
          <div className="mt-3">
            {href && billing?.can_manage !== false ? (
              <Link href={href} onClick={() => setError(null)} className="inline-flex h-8 items-center rounded-full bg-ink px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2b2b2b]">
                {inactive ? "Choose a plan" : "See plans"}
              </Link>
            ) : (
              <span className="text-[12px] text-muted">Ask the workspace owner to upgrade.</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setError(null)}
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
