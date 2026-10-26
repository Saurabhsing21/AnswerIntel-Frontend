"use client";

import { Check, ChatsCircle, CircleNotch, CreditCard, Hash, Lightning, Minus, Receipt } from "@phosphor-icons/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PlanChooser, StatePill } from "@/components/app/billing";
import { useProject } from "@/components/app/project-context";
import { TeamPanel } from "@/components/app/team-panel";
import { Card, ErrorBanner, PageHeader, Segmented, Skeleton, StatStrip } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import type { Billing } from "@/lib/api/types";
import { openPortal } from "@/lib/billing/checkout";
import { cx } from "@/lib/cx";

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "n/a");

/** Has a live Stripe subscription, so the Portal can change or cancel it. */
const subscribed = (b: Billing) => !["none", "free", "trial"].includes(b.plan) && !["canceled", "incomplete_expired"].includes(b.status ?? "");

/** `limit` null = unlimited: the count is shown without a bar. */
function Meter({ label, used, limit, hint }: { label: string; used: number; limit: number | null; hint?: string }) {
  const share = limit == null ? 0 : used / Math.max(1, limit);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-ink-2">{label}</span>
        <span className={cx("font-mono tabular-nums", share >= 1 ? "text-down" : "text-muted")}>
          {used.toLocaleString()} / {limit == null ? "unlimited" : limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
        <div className={cx("h-full rounded-full transition-[width]", share >= 1 ? "bg-down" : share >= 0.8 ? "bg-amber" : "bg-mark-strong")} style={{ width: `${Math.min(100, share * 100)}%` }} />
      </div>
      {hint && <p className="mt-1 text-[11px] text-faint">{hint}</p>}
    </div>
  );
}

function statusLine(b: Billing): string {
  if (b.state === "free") return `Free trial: ${b.usage.scans_total} of ${b.limits.scans_total ?? 1} free scan used. Choose a plan for weekly tracking, more prompts and every feature.`;
  if (b.state === "trialing") return `Trial until ${date(b.trial_ends_at)}. Subscribe before then to keep scanning.`;
  if (b.state === "past_due") return `Your last payment failed. Update your card by ${date(b.grace_ends_at)} or the workspace becomes read-only.`;
  if (b.state === "lapsed") return "Read-only. You can view and export everything, but not run scans or add prompts, competitors or people.";
  if (b.cancel_at_period_end) return `Canceled. Everything keeps working until ${date(b.current_period_end)}.`;
  return `Billed ${b.interval === "year" ? "yearly" : "monthly"}. Next renewal on ${date(b.current_period_end)}.`;
}

function UsageInner() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const { billing, reloadBilling, workspaces } = useProject();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const returned = params.get("checkout") === "success";
  const workspace = workspaces.find((w) => w.id === billing?.workspace_id);

  // Back from renewing in Checkout: the webhook lands a moment later.
  const waiting = returned && billing?.state === "lapsed";
  useEffect(() => {
    if (!waiting) return;
    let tries = 0;
    const t = window.setInterval(() => (++tries > 15 ? window.clearInterval(t) : reloadBilling()), 2000);
    return () => window.clearInterval(t);
  }, [waiting, reloadBilling]);

  async function manage() {
    if (!billing) return;
    setBusy(true);
    setError("");
    try {
      await openPortal(billing.workspace_id, `/projects/${id}/billing`);
    } catch (e) {
      setError((e as ApiError).message);
      setBusy(false);
    }
  }

  if (!billing) return <Skeleton className="h-72" />;
  const { usage, limits } = billing;
  const live = subscribed(billing);
  const renewal = billing.state === "trialing" ? billing.trial_ends_at : billing.current_period_end;
  const includes: [string, boolean][] = [
    [limits.engines == null ? "All AI engines" : `${limits.engines} AI engines per scan`, true],
    [`${Math.round(limits.retention_days / 30.5)} months of answer history`, true],
    ["Weekly scans and reports", limits.schedules],
    ["Experiments", limits.experiments],
  ];

  const tab = params.get("tab") === "team" ? "team" : "plan";
  const setTab = (next: "plan" | "team") => router.replace(`/projects/${id}/billing${next === "team" ? "?tab=team" : ""}`, { scroll: false });

  return (
    <>
      <PageHeader
        title={workspace?.name ?? "Workspace"}
        description="Your plan, what you've used, and the people who share it."
        actions={
          billing.can_manage && billing.has_billing_account ? (
            <button type="button" onClick={manage} disabled={busy} className={buttonClass("secondary", "sm")}>
              {busy ? <CircleNotch size={14} className="animate-spin" /> : <Receipt size={14} />} Manage billing
            </button>
          ) : undefined
        }
      />
      <div className="mb-4">
        <Segmented
          label="Workspace sections"
          value={tab}
          onChange={setTab}
          options={[
            { key: "plan", label: "Plan & usage" },
            { key: "team", label: "People", count: usage.seats },
          ]}
        />
      </div>

      {tab === "team" ? (
        workspace ? <TeamPanel workspace={workspace} /> : <Skeleton className="h-72" />
      ) : (
        <div className="space-y-4">
          {returned && (
            <div role="status" className="flex items-center gap-2 rounded-[12px] border border-[#bfe5cc] bg-up-soft px-4 py-3 text-[13px] text-up-ink">
              {waiting ? <CircleNotch size={16} className="animate-spin" /> : <Check size={16} weight="bold" />}
              {waiting ? "Payment received. Updating your plan..." : "Your subscription is up to date."}
            </div>
          )}
          {error && <ErrorBanner message={error} />}

          <section className="flex flex-col gap-4 rounded-[16px] border border-line-strong bg-surface p-5 lg:flex-row lg:items-center">
            <div className="min-w-0 lg:w-[38%]">
              <p className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.01em] text-ink">
                {billing.plan_name} plan <StatePill state={billing.state} />
              </p>
              <p className="mt-1 text-[13px] text-muted">{statusLine(billing)}</p>
              {!billing.can_manage && <p className="mt-1 text-[12px] text-faint">Only the workspace owner can change billing.</p>}
            </div>
            <ul className="grid flex-1 grid-cols-1 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2 lg:border-l lg:border-line lg:pl-6">
              {includes.map(([label, on]) => (
                <li key={label} className={cx("flex items-center gap-2", on ? "text-ink-2" : "text-faint line-through")}>
                  {on ? <Check size={14} weight="bold" className="shrink-0 text-up" /> : <Minus size={14} className="shrink-0" />} {label}
                </li>
              ))}
            </ul>
          </section>

          <StatStrip
            stats={[
              {
                label: "AI answers, 30 days",
                value: `${usage.answers_30_days.toLocaleString()}/${limits.answers_per_month.toLocaleString()}`,
                hint: `${Math.max(0, limits.answers_per_month - usage.answers_30_days).toLocaleString()} left`,
                icon: <ChatsCircle size={18} />,
                tone: "blue",
              },
              { label: "Active prompts", value: `${usage.active_prompts}/${limits.active_prompts}`, hint: "shared by every project", icon: <Hash size={18} />, tone: "violet" },
              { label: "Scans today", value: `${usage.scans_today}/${limits.scans_per_day}`, hint: `${usage.scans_30_days} in the last 30 days`, icon: <Lightning size={18} />, tone: "amber" },
              {
                label: billing.cancel_at_period_end ? "Ends" : billing.state === "trialing" ? "Trial ends" : "Renews",
                value: renewal ? new Date(renewal).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "n/a",
                hint: `${billing.plan_name} plan`,
                icon: <CreditCard size={18} />,
                tone: "lime",
              },
            ]}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Limits" subtitle="Shared by every project and person" className="h-full">
              <div className="space-y-5 p-5">
                <Meter
                  label="AI answers, last 30 days"
                  used={usage.answers_30_days}
                  limit={limits.answers_per_month}
                  hint="One answer per active prompt per AI engine, scheduled scans included."
                />
                <Meter label="Active prompts" used={usage.active_prompts} limit={limits.active_prompts} hint="One pool for every project." />
                <Meter label="Scans today" used={usage.scans_today} limit={limits.scans_per_day} />
                <Meter label="Projects" used={usage.projects} limit={limits.projects} />
              </div>
            </Card>
            <Card title="By project" subtitle={`Prompts come from the shared pool. Up to ${limits.competitors} competitors each.`} className="h-full">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line text-left text-[12px] text-muted">
                    <th className="px-5 py-2.5 font-normal">Project</th>
                    <th className="px-5 py-2.5 text-right font-normal">Active prompts</th>
                    <th className="px-5 py-2.5 text-right font-normal">Competitors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {usage.per_project.map((p) => (
                    <tr key={p.id} className={cx(p.id === id && "bg-mark-soft/40")}>
                      <td className="px-5 py-3 font-medium text-ink">{p.brand_name}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-ink-2">{p.active_prompts}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-ink-2">{p.competitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {!live && billing.can_manage && (
            <Card
              title={billing.state === "free" ? "Upgrade from the free trial" : "Renew your subscription"}
              subtitle={billing.state === "free" ? "Keep this project and its results. Weekly scans start right away." : "Pick up where you left off. Your data is all still here."}
            >
              <div className="p-5">
                <PlanChooser billing={billing} returnPath={`/projects/${id}/billing`} action={billing.state === "free" ? "Upgrade" : "Renew"} />
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

export default function UsagePage() {
  return (
    <Suspense fallback={<Skeleton className="h-72" />}>
      <UsageInner />
    </Suspense>
  );
}
