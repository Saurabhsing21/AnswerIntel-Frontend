"use client";

import { CalendarBlank, Check, CircleNotch, CreditCard, Lightning, Receipt, UsersThree } from "@phosphor-icons/react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StatePill, STATE_LABEL } from "@/components/app/billing";
import { useProject } from "@/components/app/project-context";
import { Card, ErrorBanner, PageHeader, Segmented, Skeleton, StatStrip } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { Billing } from "@/lib/api/types";
import { daysUntil } from "@/lib/billing/plans";
import { cx } from "@/lib/cx";

type Interval = "month" | "year";
type Plan = Billing["plans"][number];

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "n/a");

function features(p: Plan): string[] {
  return [
    `${p.projects} ${p.projects === 1 ? "project" : "projects"}`,
    `${p.active_prompts} tracked prompts per project`,
    `${p.competitors} competitors per project`,
    p.engines == null ? "All AI engines" : `${p.engines} AI engines`,
    `${p.scans_per_day} scans a day`,
    `${p.seats} seats`,
    `${Math.round(p.retention_days / 30.5)} months of answer history`,
    ...(p.schedules ? ["Weekly scans and reports"] : []),
    ...(p.experiments ? ["Experiments"] : []),
  ];
}

/** Has a live Stripe subscription: plan changes go through the Portal, which prorates. */
const subscribed = (b: Billing) => b.plan !== "trial" && !["canceled", "incomplete_expired"].includes(b.status ?? "");

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const full = used >= limit;
  return (
    <div>
      <div className="flex justify-between text-[13px]">
        <span className="text-ink-2">{label}</span>
        <span className={cx("font-mono tabular-nums", full ? "text-down" : "text-muted")}>
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
        <div className={cx("h-full rounded-full transition-[width]", full ? "bg-down" : "bg-ink")} style={{ width: `${Math.min(100, (used / Math.max(1, limit)) * 100)}%` }} />
      </div>
    </div>
  );
}

function statusLine(b: Billing): string {
  if (b.state === "trialing") return `Free trial with Pro limits until ${date(b.trial_ends_at)}. No card needed.`;
  if (b.state === "past_due") return `Your last payment failed. Update your card by ${date(b.grace_ends_at)} or the workspace becomes read-only.`;
  if (b.state === "lapsed") return "Read-only: you can view and export everything, but not run scans or add prompts, competitors or people.";
  if (b.cancel_at_period_end) return `Canceled. Your ${b.plan_name} plan stays active until ${date(b.current_period_end)}.`;
  return `${b.plan_name}, billed ${b.interval === "year" ? "yearly" : "monthly"}. Renews on ${date(b.current_period_end)}.`;
}

function BillingInner() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { billing, reloadBilling, workspaces, project } = useProject();
  const [period, setPeriod] = useState<Interval>("month");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const checkout = params.get("checkout");
  const workspace = workspaces.find((w) => w.id === billing?.workspace_id);

  // Stripe confirms the payment by webhook a moment after the redirect; poll until the plan flips.
  const waiting = checkout === "success" && billing?.plan === "trial";
  useEffect(() => {
    if (!waiting) return;
    let tries = 0;
    const t = window.setInterval(() => (++tries > 15 ? window.clearInterval(t) : reloadBilling()), 2000);
    return () => window.clearInterval(t);
  }, [waiting, reloadBilling]);

  async function go(kind: "checkout" | "portal", plan?: Plan["key"]) {
    if (!billing) return;
    setBusy(plan ?? kind);
    setError("");
    try {
      const body = { return_path: `/projects/${id}/billing`, ...(plan ? { plan, interval: period } : {}) };
      const { url } = await api<{ url: string }>(`/workspaces/${billing.workspace_id}/billing/${kind}`, { method: "POST", json: body });
      window.location.assign(url);
    } catch (e) {
      setError((e as ApiError).code === "BILLING_NOT_CONFIGURED" ? "Payments are not set up on this server yet." : (e as ApiError).message);
      setBusy(null);
    }
  }

  if (!billing) return <Skeleton className="h-72" />;
  const here = billing.usage.per_project.find((p) => p.id === id);
  const live = subscribed(billing);
  const renewal = billing.state === "trialing" ? billing.trial_ends_at : billing.current_period_end;

  return (
    <>
      <PageHeader
        title="Billing"
        description={`Plan and usage for ${workspace?.name ?? "this workspace"}. Everyone in the workspace shares these limits.`}
        actions={
          billing.can_manage && billing.has_billing_account ? (
            <button type="button" onClick={() => go("portal")} disabled={busy !== null} className={buttonClass("secondary", "sm")}>
              {busy === "portal" ? <CircleNotch size={14} className="animate-spin" /> : <Receipt size={14} />} Card, invoices and cancellation
            </button>
          ) : undefined
        }
      />

      {checkout === "success" && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-[12px] border border-[#bfe5cc] bg-up-soft px-4 py-3 text-[13px] text-up-ink">
          {waiting ? <CircleNotch size={16} className="animate-spin" /> : <Check size={16} weight="bold" />}
          {waiting ? "Payment received. Updating your plan..." : `You are on ${billing.plan_name}. Thank you!`}
        </div>
      )}
      {checkout === "cancel" && (
        <div role="status" className="mb-4 rounded-[12px] border border-line-strong bg-surface px-4 py-3 text-[13px] text-muted">
          Checkout was canceled. Nothing was charged.
        </div>
      )}
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <StatStrip
        stats={[
          { label: "Plan", value: billing.plan_name, hint: billing.state === "trialing" ? "Pro limits, no card" : STATE_LABEL[billing.state], icon: <CreditCard size={18} />, tone: "lime" },
          {
            label: billing.state === "trialing" ? "Trial ends" : billing.cancel_at_period_end ? "Ends" : "Renews",
            value: renewal ? new Date(renewal).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "n/a",
            hint: billing.state === "trialing" ? `${daysUntil(billing.trial_ends_at)} days left` : billing.interval ? `billed ${billing.interval}ly` : undefined,
            icon: <CalendarBlank size={18} />,
            tone: "blue",
          },
          { label: "Scans today", value: `${billing.usage.scans_today}/${billing.limits.scans_per_day}`, hint: "across the workspace", icon: <Lightning size={18} />, tone: "amber" },
          { label: "Seats", value: `${billing.usage.seats}/${billing.limits.seats}`, hint: "people in the workspace", icon: <UsersThree size={18} />, tone: "violet" },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 space-y-4">
          <Card
            title="Plans"
            subtitle={billing.can_manage ? "Prices in USD. Change or cancel any time." : "Only the workspace owner can change the plan."}
            action={<Segmented label="Billing period" value={period} onChange={setPeriod} options={[{ key: "month", label: "Monthly" }, { key: "year", label: "Yearly" }]} />}
          >
            <div className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
              {billing.plans.map((p) => {
                const current = live && billing.plan === p.key;
                const price = period === "month" ? p.price_monthly : p.price_yearly;
                return (
                  <div key={p.key} className="flex flex-col p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-medium text-ink">{p.name}</h3>
                      {current && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">Current</span>}
                    </div>
                    <p className="mt-2 font-display text-[30px] font-semibold tracking-[-0.03em]">
                      ${price}
                      <span className="text-[13px] font-normal tracking-normal text-muted"> / {period}</span>
                    </p>
                    {period === "year" && <p className="text-[12px] text-up-ink">Two months free</p>}
                    <ul className="mt-4 mb-5 space-y-1.5 text-[13px] text-ink-2">
                      {features(p).map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check size={14} weight="bold" className="mt-0.5 shrink-0 text-up" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      disabled={!billing.can_manage || busy !== null || current || !billing.billing_enabled}
                      onClick={() => (live ? go("portal") : go("checkout", p.key))}
                      className={cx(buttonClass(p.key === "pro" ? "primary" : "secondary", "sm"), "mt-auto w-full")}
                    >
                      {busy === p.key && <CircleNotch size={14} className="animate-spin" />}
                      {current ? "Your plan" : live ? `Switch to ${p.name}` : `Choose ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
            {!billing.billing_enabled && <p className="border-t border-line px-5 py-3 text-[12px] text-muted">Payments are not set up on this server yet.</p>}
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card title="Your plan" action={<StatePill state={billing.state} />}>
            <p className="p-5 text-[13px] text-ink-2">{statusLine(billing)}</p>
          </Card>
          <Card title="Usage" subtitle={here ? `Per-project numbers are for ${project?.brand_name ?? here.brand_name}` : undefined}>
            <div className="space-y-4 p-5">
              <Meter label="Projects" used={billing.usage.projects} limit={billing.limits.projects} />
              <Meter label="Seats" used={billing.usage.seats} limit={billing.limits.seats} />
              <Meter label="Scans today" used={billing.usage.scans_today} limit={billing.limits.scans_per_day} />
              {here && <Meter label="Active prompts" used={here.active_prompts} limit={billing.limits.active_prompts} />}
              {here && <Meter label="Competitors" used={here.competitors} limit={billing.limits.competitors} />}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Skeleton className="h-72" />}>
      <BillingInner />
    </Suspense>
  );
}
