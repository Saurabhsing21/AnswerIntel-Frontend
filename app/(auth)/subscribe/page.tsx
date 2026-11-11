"use client";

import { CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { cleanPhone, PhoneField, validPhone } from "@/components/app/billing";
import { ErrorBanner } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { Billing, Workspace } from "@/lib/api/types";
import { startCheckout } from "@/lib/billing/checkout";
import { isPaidPlan } from "@/lib/billing/plans";
import { siteHref } from "@/lib/urls";

/** Where the website's plan buttons land: straight to Cashfree's checkout when signed in (after asking for a phone the
 * first time), else create an account first. */
function Subscribe() {
  const params = useSearchParams();
  const [error, setError] = useState("");
  // The workspace to pay for, once it turns out Cashfree still needs a phone for it.
  const [needsPhone, setNeedsPhone] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const plan = params.get("plan");
  const interval = params.get("interval") === "year" ? "year" : "month";

  useEffect(() => {
    if (!isPaidPlan(plan)) {
      window.location.replace(siteHref("/pricing"));
      return;
    }
    (async () => {
      try {
        const owned = (await api<Workspace[]>("/workspaces")).filter((w) => w.role === "owner");
        // Pay for the first owned workspace with no paid plan yet (none, or the free trial); one that pays is managed in the app.
        for (const w of owned) {
          const billing = await api<Billing>(`/workspaces/${w.id}/billing`);
          if (billing.state === "unsubscribed" || billing.state === "free") {
            if (!billing.has_billing_phone) return setNeedsPhone(w.id);
            return await startCheckout(w.id, plan, interval, "/projects/new");
          }
        }
        window.location.replace("/projects");
      } catch (e) {
        if ((e as ApiError).status === 401) window.location.replace(`/register?plan=${plan}&interval=${interval}`);
        else setError((e as ApiError).message);
      }
    })();
  }, [plan, interval]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!needsPhone || !isPaidPlan(plan)) return;
    if (!validPhone(cleanPhone(phone))) return setError("Enter your phone number with its country code.");
    setBusy(true);
    setError("");
    try {
      await startCheckout(needsPhone, plan, interval, "/projects/new", cleanPhone(phone));
    } catch (err) {
      setError((err as ApiError).message);
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-page px-4">
      <div className="w-full max-w-[400px] text-center">
        {needsPhone ? (
          <form onSubmit={pay} className="text-left">
            <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">One more thing</h1>
            <p className="mt-1 mb-5 text-[13px] text-muted">Then we open secure checkout.</p>
            <PhoneField value={phone} onChange={setPhone} />
            {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
            <button type="submit" disabled={busy} className={`${buttonClass("primary")} mt-4 w-full`}>
              {busy && <CircleNotch size={16} className="animate-spin" />} Continue to payment
            </button>
          </form>
        ) : error ? (
          <>
            <ErrorBanner message={error} />
            <Link href={siteHref("/pricing")} className="mt-4 inline-block text-[13px] font-medium text-ink underline-offset-2 hover:underline">
              Back to pricing
            </Link>
          </>
        ) : (
          <div role="status" className="flex flex-col items-center">
            <CircleNotch size={28} className="animate-spin text-ink" />
            <p className="mt-4 text-[15px] font-medium text-ink">Opening secure checkout</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={null}>
      <Subscribe />
    </Suspense>
  );
}
