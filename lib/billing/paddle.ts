"use client";

import { type Environments, initializePaddle, type Paddle } from "@paddle/paddle-js";
import type { Interval, PaidPlan } from "@/lib/billing/plans";

/**
 * Paddle price ids for each plan and period. Sandbox and production are separate accounts, so each has its own ids.
 * Names, descriptions and features stay in PLANS (lib/billing/plans.ts); this only maps a plan to what Paddle charges.
 */
export interface Tier {
  plan: PaidPlan;
  priceId: Record<Interval, string>;
}

const TIERS: Record<Environments, Tier[]> = {
  sandbox: [
    { plan: "starter", priceId: { month: "pri_01m75kjkypaezvhvhb31srmzsv", year: "pri_01m75kjm75adhgcfzbjvjsp7ch" } },
    { plan: "growth", priceId: { month: "pri_01m75kjmr04p61q73qft13wgk2", year: "pri_01m75kjn04492etszp3dabg078" } },
    { plan: "pro", priceId: { month: "pri_01m75kjnhcz2zvtgsfer4drbcp", year: "pri_01m75kjnsf1rpryc1k04f10ypg" } },
  ],
  production: [], // fill in from the live catalog before going live
};

/** Never guess the environment: a missing or wrong value would charge against the wrong Paddle account. */
export function paddleEnv(): Environments {
  const env = process.env.NEXT_PUBLIC_PADDLE_ENV;
  if (env !== "sandbox" && env !== "production") {
    throw new Error(`NEXT_PUBLIC_PADDLE_ENV must be "sandbox" or "production" (got ${env ? `"${env}"` : "nothing"}).`);
  }
  return env;
}

export function paddleTiers(): Tier[] {
  const tiers = TIERS[paddleEnv()];
  if (!tiers.length) throw new Error(`No Paddle price ids for ${paddleEnv()} in lib/billing/paddle.ts.`);
  return tiers;
}

let instance: Promise<Paddle | undefined> | null = null;

/** One Paddle.js instance per page: initializing twice is refused by the SDK. */
export function loadPaddle(): Promise<Paddle | undefined> {
  if (!instance) {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) throw new Error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set.");
    instance = initializePaddle({ token, environment: paddleEnv() });
  }
  return instance;
}
