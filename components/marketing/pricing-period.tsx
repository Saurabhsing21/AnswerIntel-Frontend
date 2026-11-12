"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { Interval } from "@/lib/billing/plans";

const PeriodContext = createContext<[Interval, (period: Interval) => void] | null>(null);

/** One monthly/yearly choice for everything inside: the pricing cards' toggle also switches the comparison table. */
export function PricingPeriod({ children }: { children: ReactNode }) {
  const state = useState<Interval>("month");
  return <PeriodContext value={state}>{children}</PeriodContext>;
}

/** The shared billing period, or a period of the caller's own outside a PricingPeriod (the home page cards). */
export function usePricingPeriod(): [Interval, (period: Interval) => void] {
  const own = useState<Interval>("month");
  return useContext(PeriodContext) ?? own;
}
