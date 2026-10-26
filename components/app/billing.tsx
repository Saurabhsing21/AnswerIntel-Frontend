"use client";

import { Check, CircleNotch, CreditCard, Lock, Warning, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useProject } from "@/components/app/project-context";
import { ErrorBanner, Segmented } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { ApiError, PLAN_LIMIT_EVENT } from "@/lib/api/client";
import type { Billing, BillingState } from "@/lib/api/types";
import { startCheckout } from "@/lib/billing/checkout";
import { daysUntil, FEATURED, type Interval, type PaidPlan, PLANS } from "@/lib/billing/plans";
import { cx } from "@/lib/cx";
import { siteHref } from "@/lib/urls";

export const STATE_LABEL: Record<BillingState, string> = {
  unsubscribed: "No plan",
  free: "Free trial",
  trialing: "Trial",
  active: "Active",
  past_due: "Payment due",
  lapsed: "Read-only",
};
const STATE_PILL: Record<BillingState, string> = {
  unsubscribed: "bg-sunken text-ink-2",
  free: "bg-mark-soft text-ink",
  trialing: "bg-blue-soft text-blue-ink",
  active: "bg-up-soft text-up-ink",
  past_due: "bg-amber-soft text-amber-ink",
  lapsed: "bg-down-soft text-down-ink",
};

const LIMIT_LABEL: Record<string, string> = {
  projects: "projects",
  active_prompts: "active prompts",
  answers_per_month: "AI answers for the month",
  competitors: "competitors per project",
  seats: "seats",
  scans_per_day: "scans a day",
  scans_total: "free scan",
  schedules: "weekly scans",
  experiments: "experiments",
};

export function StatePill({ state }: { state: BillingState }) {
  return <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-medium", STATE_PILL[state])}>{STATE_LABEL[state]}</span>;
}

/** The usage and billing page of the current project, or of any project the user has. */
function useUsageHref() {
  const { projectId, projects } = useProject();
  const id = projectId ?? projects[0]?.id;
  return id ? `/projects/${id}/billing` : null;
}

function bannerFor(billing: Billing): { tone: "amber" | "red"; text: string; cta: string } | null {
  if (billing.state === "lapsed") {
    const why = billing.plan === "trial" ? "Your trial has ended" : "Your subscription is not active";
    return { tone: "red", text: `${why}, so this workspace is read-only. You can still view and export everything.`, cta: "Renew" };
  }
  if (billing.state === "past_due") {
    const by = billing.grace_ends_at ? ` by ${new Date(billing.grace_ends_at).toLocaleDateString(undefined, { month: "long", day: "numeric" })}` : "";
    return { tone: "amber", text: `Your last payment failed. Update your card${by} to keep scanning.`, cta: "Update payment" };
  }
  const days = daysUntil(billing.trial_ends_at);
  if (billing.state === "trialing" && days <= 7) {
    return { tone: "amber", text: `Your trial ends ${days <= 1 ? "within a day" : `in ${days} days`}. Subscribe to keep your scans running.`, cta: "Subscribe" };
  }
  return null;
}

/** Payment failed, read-only, or a legacy trial running out: shown above every page of the workspace. */
export function BillingBanner() {
  const { billing } = useProject();
  const pathname = usePathname();
  const href = useUsageHref();
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

/** Sidebar card: the plan and the month's AI answers against it, linking to the usage page. */
export function PlanCard({ onNavigate }: { onNavigate?: () => void }) {
  const { billing } = useProject();
  const href = useUsageHref();
  if (billing?.state === "free") return <TrialCard billing={billing} />; // shown before the first project too
  if (!billing || !href || billing.state === "unsubscribed") return null;
  const used = billing.usage.answers_30_days;
  const limit = billing.limits.answers_per_month;
  return (
    <Link href={href} onClick={onNavigate} className="mx-3 mb-2 block rounded-[12px] border border-line bg-surface p-3 text-[11px] transition-colors hover:border-line-strong">
      <div className="flex items-center gap-2">
        <CreditCard size={14} className="shrink-0 text-ink-2" />
        <p className="min-w-0 flex-1 truncate font-medium text-ink">{billing.plan_name} plan</p>
        {billing.state !== "active" && <StatePill state={billing.state} />}
      </div>
      <div className="mt-2.5 flex justify-between text-muted">
        <span>AI answers, 30 days</span>
        <span className="font-mono tabular-nums">
          {used.toLocaleString()}/{limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-sunken">
        <div className={cx("h-full rounded-full", used >= limit ? "bg-down" : "bg-mark-strong")} style={{ width: `${Math.min(100, (used / Math.max(1, limit)) * 100)}%` }} />
      </div>
    </Link>
  );
}

/** Sidebar card on the free trial: how much of the one free scan is left, and the way to a plan. */
function TrialCard({ billing }: { billing: Billing }) {
  const used = billing.usage.scans_total;
  const limit = billing.limits.scans_total ?? 1;
  const left = Math.max(0, limit - used);
  return (
    <div className="mx-3 mb-2 rounded-[12px] border border-line bg-surface p-3 text-[11px]">
      <p className="font-medium text-ink">Free trial</p>
      <div className="mt-2.5 flex justify-between text-muted">
        <span>Free scan</span>
        <span className="font-mono tabular-nums">{used}/{limit} used</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-sunken">
        <div className={cx("h-full rounded-full", left ? "bg-mark-strong" : "bg-down")} style={{ width: `${Math.min(100, (used / Math.max(1, limit)) * 100)}%` }} />
      </div>
      <a href={siteHref("/pricing")} className="mt-2.5 flex h-7 items-center justify-center rounded-full bg-ink text-[12px] font-medium text-white transition-colors hover:bg-[#2b2b2b]">
        {left ? "See plans" : "Upgrade to keep tracking"}
      </a>
    </div>
  );
}

/** Pops up whenever the API refuses something because of the plan. */
export function UpgradePrompt() {
  const { billing, reloadBilling } = useProject();
  const href = useUsageHref();
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const onLimit = (e: Event) => {
      setError((e as CustomEvent<ApiError>).detail);
      reloadBilling();
    };
    window.addEventListener(PLAN_LIMIT_EVENT, onLimit);
    return () => window.removeEventListener(PLAN_LIMIT_EVENT, onLimit);
  }, [reloadBilling]);

  // Esc closes it, like any dialog.
  useEffect(() => {
    if (!error) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setError(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [error]);

  // An unpaid workspace already sees the subscribe step; nothing to add.
  if (!error || billing?.state === "unsubscribed") return null;
  const inactive = error.limit === "subscription";
  const trial = billing?.state === "free";
  const title = trial
    ? error.limit === "scans_total" ? "You've used your free scan" : "Unlock this with a paid plan"
    : inactive ? "Your subscription is not active" : `You've reached your plan's ${LIMIT_LABEL[error.limit ?? ""] ?? "limit"}`;
  const close = () => setError(null);
  const cta = trial && billing?.can_manage
    ? <a href={siteHref("/pricing")} className={cx(buttonClass("primary"), "flex-1 justify-center")}>See plans</a>
    : href && billing?.can_manage
      ? <Link href={href} onClick={close} className={cx(buttonClass("primary"), "flex-1 justify-center")}>{inactive ? "Renew subscription" : "Change plan"}</Link>
      : null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[22px] border border-line-strong bg-surface shadow-[0_32px_80px_-24px_rgb(0_0_0/0.45)]">
        <div className="relative bg-mark px-6 pt-6 pb-5">
          <button type="button" onClick={close} aria-label="Close" className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-ink/70 transition-colors hover:bg-black/10 hover:text-ink">
            <X size={15} />
          </button>
          <span className="grid size-11 place-items-center rounded-[14px] bg-ink text-mark">
            <Lock size={20} weight="bold" />
          </span>
          <p className="mt-4 font-display text-[21px] leading-tight font-semibold tracking-[-0.02em] text-ink">{title}</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink/75">{error.message}</p>
        </div>
        {(trial || error.limit !== "subscription") && (
          <ul className="space-y-2.5 px-6 pt-5 text-[13px] text-ink-2">
            {["Weekly tracking on every AI engine, including Claude and Google AI", "Every fix with steps, drafts and a re-test to prove it worked", "Up to 160 questions, 100 competitors, reports and alerts"].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check size={15} weight="bold" className="mt-px shrink-0 text-up" /> {line}
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2 px-6 pt-5 pb-6">
          {cta ?? <p className="flex-1 text-[13px] text-muted">Ask the workspace owner to change the plan.</p>}
          <button type="button" onClick={close} className={buttonClass("secondary")}>Not now</button>
        </div>
        {trial && <p className="border-t border-line bg-[#fbfbfa] px-6 py-3 text-center text-[12px] text-muted">Plans from $20 a month. Cancel any time.</p>}
      </div>
    </div>
  );
}

/** Pick Starter or Pro and go to Stripe Checkout. Used by the subscribe step and to renew a lapsed plan. */
export function PlanChooser({ billing, returnPath, action = "Continue to payment" }: { billing: Billing; returnPath: string; action?: string }) {
  const [plan, setPlan] = useState<PaidPlan>(FEATURED);
  const [period, setPeriod] = useState<Interval>("month");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    try {
      await startCheckout(billing.workspace_id, plan, period, returnPath);
    } catch (e) {
      setError((e as ApiError).code === "BILLING_NOT_CONFIGURED" ? "Payments are not set up on this server yet." : (e as ApiError).message);
      setBusy(false);
    }
  }

  return (
    <div>
      <Segmented label="Billing period" value={period} onChange={setPeriod} options={[{ key: "month", label: "Monthly" }, { key: "year", label: "Yearly · save 20%" }]} />
      <div role="radiogroup" aria-label="Plan" className="mt-3 grid gap-2 sm:grid-cols-3">
        {PLANS.map((p) => {
          const on = plan === p.key;
          return (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPlan(p.key)}
              className={cx("rounded-[14px] border p-4 text-left transition-colors", on ? "border-ink bg-surface shadow-[0_0_0_1px_var(--color-ink)]" : "border-line-strong bg-surface hover:border-[rgb(0_0_0/0.22)]")}
            >
              <span className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-ink">{p.name}</span>
                <span className={cx("grid size-4 place-items-center rounded-full border", on ? "border-ink bg-ink text-white" : "border-line-strong")}>{on && <Check size={10} weight="bold" />}</span>
              </span>
              <span className="mt-1 block font-mono text-[20px] tabular-nums text-ink">
                ${period === "month" ? p.monthly : p.yearly}
                <span className="font-sans text-[12px] text-muted"> / {period}</span>
              </span>
              <span className="mt-1 block text-[12px] text-muted">{p.includes.slice(0, 2).join(" · ")}</span>
            </button>
          );
        })}
      </div>
      {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
      <button type="button" onClick={pay} disabled={busy || !billing.can_manage} className={cx(buttonClass("primary"), "mt-4 w-full")}>
        {busy && <CircleNotch size={16} className="animate-spin" />}
        {action}
      </button>
      {!billing.can_manage && <p className="mt-2 text-center text-[12px] text-muted">Only the workspace owner can subscribe.</p>}
    </div>
  );
}

/** Full-screen step for a workspace that has never paid. There is no free plan, so nothing else is usable. */
export function SubscribeGate() {
  const { reloadBilling } = useProject();
  // Back from Checkout: the webhook confirms a moment later, so wait for it instead of asking again.
  // Only rendered once billing has loaded in the browser, so reading the URL here is safe.
  const [confirming, setConfirming] = useState(() => new URLSearchParams(window.location.search).get("checkout") === "success");

  useEffect(() => {
    if (!confirming) {
      // Never paid: plans are chosen on the website's pricing page, which goes straight to Checkout.
      window.location.replace(siteHref("/pricing?subscribe=1"));
      return;
    }
    let tries = 0;
    const t = window.setInterval(() => {
      if (++tries > 20) {
        window.clearInterval(t);
        setConfirming(false);
      } else reloadBilling();
    }, 2000);
    return () => window.clearInterval(t);
  }, [confirming, reloadBilling]);

  return (
    <div className="grid min-h-dvh place-items-center bg-page px-4" role="status">
      <div className="flex flex-col items-center text-center">
        <CircleNotch size={28} className="animate-spin text-ink" />
        <p className="mt-4 text-[15px] font-medium text-ink">{confirming ? "Confirming your payment" : "Taking you to plans"}</p>
        {confirming && <p className="mt-1 text-[13px] text-muted">This takes a few seconds.</p>}
      </div>
    </div>
  );
}

/** Shows the subscribe step instead of the app while the workspace has never paid. */
export function RequireSubscription({ children }: { children: React.ReactNode }) {
  const { billing } = useProject();
  return billing?.state === "unsubscribed" ? <SubscribeGate /> : children;
}
