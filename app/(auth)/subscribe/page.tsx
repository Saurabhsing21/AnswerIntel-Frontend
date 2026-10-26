"use client";

import { CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorBanner } from "@/components/app/ui";
import { api, ApiError } from "@/lib/api/client";
import type { Billing, Workspace } from "@/lib/api/types";
import { startCheckout } from "@/lib/billing/checkout";
import { isPaidPlan } from "@/lib/billing/plans";
import { siteHref } from "@/lib/urls";

/** Where the website's plan buttons land: straight to Stripe Checkout when signed in, else create an account first. */
function Subscribe() {
  const params = useSearchParams();
  const [error, setError] = useState("");
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
          if (billing.state === "unsubscribed" || billing.state === "free") return await startCheckout(w.id, plan, interval, "/projects/new");
        }
        window.location.replace("/projects");
      } catch (e) {
        if ((e as ApiError).status === 401) window.location.replace(`/register?plan=${plan}&interval=${interval}`);
        else setError((e as ApiError).message);
      }
    })();
  }, [plan, interval]);

  return (
    <div className="grid min-h-dvh place-items-center bg-page px-4">
      <div className="w-full max-w-[400px] text-center">
        {error ? (
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
