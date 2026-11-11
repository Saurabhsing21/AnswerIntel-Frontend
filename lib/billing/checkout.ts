"use client";

import { api } from "@/lib/api/client";
import { loadPaddle, paddleTiers } from "@/lib/billing/paddle";
import type { Interval, PaidPlan } from "@/lib/billing/plans";

/** Open Paddle's checkout over the page for a workspace. The webhook switches the plan on; the page then shows it. */
export async function startCheckout(workspaceId: string, plan: PaidPlan, interval: Interval, returnPath: string) {
  const priceId = paddleTiers().find((t) => t.plan === plan)?.priceId[interval];
  const [paddle, me] = await Promise.all([loadPaddle(), api<{ email: string }>("/auth/me")]);
  if (!paddle || !priceId) throw new Error("Could not load the payment page. Please try again.");
  const back = `${window.location.origin}${returnPath}${returnPath.includes("?") ? "&" : "?"}checkout=success`;
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: { email: me.email },
    customData: { workspace_id: workspaceId },
    settings: { displayMode: "overlay", variant: "one-page", successUrl: back },
  });
}

/** Switch a live subscription to another plan or period. Paddle charges or credits the prorated difference. */
export async function changePlan(workspaceId: string, plan: PaidPlan, interval: Interval) {
  return api<{ plan: PaidPlan; interval: Interval }>(`/workspaces/${workspaceId}/billing/change`, { method: "POST", json: { plan, interval } });
}

/** Paddle's customer portal: invoices, payment method and cancel. */
export async function openPortal(workspaceId: string) {
  const { url } = await api<{ url: string }>(`/workspaces/${workspaceId}/billing/portal`, { method: "POST" });
  window.location.assign(url);
}
