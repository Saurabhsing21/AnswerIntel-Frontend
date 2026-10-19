"use client";

import { api } from "@/lib/api/client";
import type { Interval, PaidPlan } from "@/lib/billing/plans";

/** Send the browser to Stripe Checkout for a workspace. Throws ApiError when the API refuses. */
export async function startCheckout(workspaceId: string, plan: PaidPlan, interval: Interval, returnPath: string) {
  const { url } = await api<{ url: string }>(`/workspaces/${workspaceId}/billing/checkout`, {
    method: "POST",
    json: { plan, interval, return_path: returnPath },
  });
  window.location.assign(url);
}

export async function openPortal(workspaceId: string, returnPath: string) {
  const { url } = await api<{ url: string }>(`/workspaces/${workspaceId}/billing/portal`, { method: "POST", json: { return_path: returnPath } });
  window.location.assign(url);
}
