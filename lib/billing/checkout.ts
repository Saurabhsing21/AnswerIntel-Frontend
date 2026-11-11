"use client";

import { api } from "@/lib/api/client";
import type { Interval, PaidPlan } from "@/lib/billing/plans";

/** Open Cashfree's hosted checkout for a workspace. Throws ApiError when the API refuses (PHONE_REQUIRED: ask for one). */
export async function startCheckout(workspaceId: string, plan: PaidPlan, interval: Interval, returnPath: string, phone?: string) {
  const session = await api<CheckoutSession>(`/workspaces/${workspaceId}/billing/checkout`, {
    method: "POST",
    json: { plan, interval, return_path: returnPath, ...(phone ? { phone } : {}) },
  });
  await openCheckout(session);
}

type CheckoutSession = { session_id: string; mode: "sandbox" | "production" };

async function openCheckout({ session_id, mode }: CheckoutSession) {
  // Loaded only here: importing the SDK injects Cashfree's script into the page.
  const { load } = await import("@cashfreepayments/cashfree-js");
  const cashfree = await load({ mode });
  if (!cashfree) throw new Error("Could not load the payment page. Please try again.");
  const result = await cashfree.subscriptionsCheckout({ subsSessionId: session_id, redirectTarget: "_self" });
  if (result?.error) throw new Error(result.error.message);
}

/** A cheaper plan changes in place. A dearer one opens Cashfree's checkout (a mandate can't be raised), and the old
 * subscription is canceled once the new one is paid. */
export async function changePlan(workspaceId: string, plan: PaidPlan, interval: Interval, returnPath: string) {
  const result = await api<{ plan: PaidPlan; interval: Interval } | CheckoutSession>(`/workspaces/${workspaceId}/billing/change`, {
    method: "POST",
    json: { plan, interval, return_path: returnPath },
  });
  if ("session_id" in result) await openCheckout(result);
}

export async function cancelSubscription(workspaceId: string) {
  return api<{ status: string; current_period_end: string | null }>(`/workspaces/${workspaceId}/billing/cancel`, { method: "POST" });
}
