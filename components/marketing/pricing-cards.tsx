"use client";

import { Check } from "@phosphor-icons/react";
import type { Paddle } from "@paddle/paddle-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { EngineLogos } from "@/components/marketing/engine-logos";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { loadPaddle, paddleTiers, type Tier } from "@/lib/billing/paddle";
import { FEATURED, type Interval, planIncludes, PLANS } from "@/lib/billing/plans";
import { usePricingPeriod } from "@/components/marketing/pricing-period";
import { WAITLIST_ONLY } from "@/lib/flags";
import { cx } from "@/lib/cx";
import { appHref } from "@/lib/urls";

const LOAD_ERROR = "Prices could not load. Please refresh, or email us if this keeps happening.";

const FEATURED_BUTTON =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-mark pr-4 pl-5 text-[15px] font-medium text-ink transition-[background-color,transform] duration-150 hover:bg-[#cbe85a] active:scale-[0.98]";

export function PeriodToggle({ value, onChange }: { value: Interval; onChange: (v: Interval) => void }) {
  return (
    <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full border border-line-strong bg-surface p-1 text-[14px]">
      {(["month", "year"] as const).map((key) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={cx("inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition-colors", value === key ? "bg-ink text-white" : "text-muted hover:text-ink")}
        >
          {key === "month" ? "Monthly" : "Yearly"}
          {key === "year" && (
            <span className={cx("rounded-full px-1.5 py-px text-[11px] font-medium", value === key ? "bg-mark text-ink" : "bg-mark-soft text-ink")}>Save 10%</span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Paddle's prices for the visitor's country (price id -> formatted total, tax included where the country expects it),
 * and the signed-in user's email for checkout. `country` comes from the CDN; without it Paddle uses the visitor's IP.
 */
function usePaddle(country: string | undefined) {
  const [paddle, setPaddle] = useState<Paddle>();
  const [setup] = useState<{ tiers: Tier[]; error?: unknown }>(() => {
    if (WAITLIST_ONLY) return { tiers: [] };
    try {
      return { tiers: paddleTiers() };
    } catch (error) {
      return { tiers: [], error };
    }
  });
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [account, setAccount] = useState<{ email: string; workspaceId?: string }>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (WAITLIST_ONLY || setup.error) {
      if (setup.error) console.error(setup.error);
      return;
    }
    const all = setup.tiers;
    loadPaddle()
      .then(async (p) => {
        if (!p) throw new Error("Paddle.js did not load.");
        setPaddle(p);
        const preview = await p.PricePreview({
          items: all.flatMap((t) => [t.priceId.month, t.priceId.year]).map((priceId) => ({ priceId, quantity: 1 })),
          ...(country && { address: { countryCode: country } }),
        });
        setPrices(Object.fromEntries(preview.data.details.lineItems.map((item) => [item.price.id, item.formattedTotals.total])));
      })
      .catch((e) => {
        console.error(e);
        setError(LOAD_ERROR);
      });
    // Signed in (same host as the app): prefill the email and tie the checkout to the workspace they own.
    fetch("/api/backend/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(async (me) => {
        if (!me?.email) return;
        const workspaces: { id: string; role: string }[] = await fetch("/api/backend/workspaces").then((r) => (r.ok ? r.json() : []));
        setAccount({ email: me.email, workspaceId: workspaces.find((w) => w.role === "owner")?.id });
      })
      .catch(() => undefined);
  }, [country, setup]);

  return { paddle, tiers: setup.tiers, prices, account, error: setup.error ? LOAD_ERROR : error };
}

/** The three plans as compact cards with a monthly/yearly switch. Subscribe opens Paddle's checkout for the price shown. */
export function PricingCards({ toggleClassName, country }: { toggleClassName?: string; country?: string }) {
  const [period, setPeriod] = usePricingPeriod();
  const { paddle, tiers, prices, account, error } = usePaddle(country);

  function subscribe(plan: string, priceId: string) {
    // A payment has to land on a workspace, so people without an account sign up first and pay right after.
    if (!account?.workspaceId) {
      window.location.assign(appHref(`/register?plan=${plan}&interval=${period}`));
      return;
    }
    paddle?.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: account.email },
      customData: { workspace_id: account.workspaceId },
      settings: { displayMode: "overlay", variant: "one-page", successUrl: `${window.location.origin}/welcome` },
    });
  }

  return (
    <>
      <div className={cx("flex", toggleClassName)}>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>
      {error && <p role="alert" className="mt-4 text-center text-[14px] text-down">{error}</p>}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const dark = plan.key === FEATURED;
          const priceId = tiers.find((t) => t.plan === plan.key)?.priceId[period];
          // Our USD list price shows at once; Paddle's total for the visitor's country replaces it when it loads.
          const price = (priceId && prices[priceId]) || `$${(period === "month" ? plan.monthly : plan.yearly).toFixed(2)}`;
          return (
            <Reveal key={plan.key} delay={0.06 * i} className="h-full">
              <article
                className={cx(
                  "relative flex h-full flex-col overflow-hidden rounded-[24px] p-6 md:p-7",
                  dark ? "bg-night text-white shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]" : "border border-line-strong bg-surface",
                )}
              >
                {dark && <div aria-hidden className="pointer-events-none absolute -top-28 -right-28 size-64 rounded-full bg-mark/20 blur-3xl" />}
                <header className="relative flex items-center gap-2.5">
                  <h3 className="text-[19px] font-medium">{plan.name}</h3>
                  {dark && <span className="rounded-full bg-mark px-2 py-0.5 text-[11px] font-medium text-ink">Most popular</span>}
                </header>
                <p className="relative mt-2 flex items-baseline gap-1">
                  <span className="font-display text-[42px] leading-none font-semibold tracking-[-0.04em] tabular-nums">{price}</span>
                  <span className={cx("text-[16px]", dark ? "text-white/60" : "text-muted")}>/{period}</span>
                </p>
                <p className={cx("relative mt-1.5 text-[13px]", dark ? "text-white/50" : "text-faint")}>
                  {period === "year" ? "Billed yearly" : "Billed monthly"}
                </p>
                <EngineLogos engines={plan.engines} dark={dark} className="relative mt-4" />

                <p className={cx("relative mt-5 border-t pt-5 text-[14px] leading-snug", dark ? "border-white/10 text-white/65" : "border-line text-muted")}>{plan.audience}</p>
                {WAITLIST_ONLY ? (
                  <Link href="/#waitlist" className={cx("relative mt-5 w-full", dark ? FEATURED_BUTTON : buttonClass("secondary"))}>
                    Join waitlist
                    <ButtonArrow />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => priceId && subscribe(plan.key, priceId)}
                    disabled={!paddle || !priceId}
                    className={cx("relative mt-5 w-full disabled:opacity-60", dark ? FEATURED_BUTTON : buttonClass("secondary"))}
                  >
                    Subscribe
                    <ButtonArrow />
                  </button>
                )}

                <p className={cx("relative mt-6 text-[13px]", dark ? "text-white/50" : "text-muted")}>This includes:</p>
                <ul className="relative mt-3 space-y-2.5 text-[14px]">
                  {planIncludes(plan, period).map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={15} weight="bold" className={cx("mt-0.5 shrink-0", dark ? "text-mark" : "text-ink")} />
                      <span className={dark ? "text-white/85" : "text-ink-2"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
