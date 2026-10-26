"use client";

import { ChartLine, ListChecks, Target } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { Workspace } from "@/lib/api/types";
import { startCheckout } from "@/lib/billing/checkout";
import { type Interval, type PaidPlan, PLANS } from "@/lib/billing/plans";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { ErrorBanner, Field, inputClass, PasswordInput } from "@/components/app/ui";
import { EngineIcon } from "@/components/product/engine-icon";
import { Logo } from "@/components/ui/logo";
import { GoogleButton } from "@/components/app/google-button";
import { cx } from "@/lib/cx";
import { siteHref } from "@/lib/urls";

const POINTS = [
  { icon: ChartLine, title: "Track how AI sees you", body: "Mentions, recommendations and share of voice, against every competitor you name." },
  { icon: Target, title: "See the questions you lose", body: "Every buyer question where AI picks someone else, with the sources behind the answer." },
  { icon: ListChecks, title: "Know what to fix first", body: "A ranked list of actions, then a before and after to prove what worked." },
];

/** `prefill`: brand details carried from the website's free check, so setup starts filled in. */
export function AuthForm({ mode, plan, interval = "month", invite, prefill }: { mode: "login" | "register"; plan?: PaidPlan; interval?: Interval; invite?: string; prefill?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isLogin = mode === "login";
  const chosen = PLANS.find((p) => p.key === plan);

  /** Signs in with `signIn`, then goes where they were heading: an invitation, Checkout, or the app. */
  async function enter(signIn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await signIn();
      if (invite) {
        // Came from an invitation email: join that workspace, which already has a plan.
        await api("/workspaces/invites/accept", { method: "POST", json: { token: invite } }).catch(() => undefined);
        window.location.replace("/projects");
        return;
      }
      if (chosen) {
        // Came from the pricing section: pay straight away. If Checkout can't start, the app asks again.
        try {
          const [workspace] = await api<Workspace[]>("/workspaces");
          await startCheckout(workspace.id, chosen.key, interval, "/projects/new");
          return;
        } catch {
          // fall through to the app, which shows the subscribe step
        }
      }
      router.push(prefill ? `/projects/new?${prefill}` : "/projects");
      router.refresh();
    } catch (err) {
      setError((err as ApiError).message);
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    enter(() => api(`/api/auth/${mode}`, { method: "POST", json: { email: form.get("email"), password: form.get("password") } }));
  }

  const onGoogle = (credential: string) => enter(() => api("/api/auth/google", { method: "POST", json: { credential } }));

  return (
    <div className="grid min-h-dvh bg-page lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="grid place-items-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          <Link href={siteHref("/")} className="mb-8 flex justify-center lg:justify-start">
            <Logo size="lg" />
          </Link>
          <div className="rounded-[20px] border border-line-strong bg-surface p-6 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.2)] md:p-8">
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">{isLogin ? "Welcome back" : chosen || invite ? "Create your account" : "Run a free scan"}</h1>
            <p className="mt-1 text-[14px] text-muted">
              {isLogin ? "Log in to see how AI talks about your brand." : chosen || invite ? "Start measuring your AI visibility." : "One free scan of your brand across the AI engines. No card needed."}
            </p>
            {chosen && (
              <div className="mt-4 flex items-center justify-between rounded-[12px] bg-sunken px-3.5 py-2.5 text-[13px]">
                <span>
                  <span className="font-medium text-ink">{chosen.name}</span>
                  <span className="text-muted"> · ${interval === "year" ? `${chosen.yearly} a year` : `${chosen.monthly} a month`}</span>
                </span>
                <span className="text-[12px] text-muted">You pay on the next step</span>
              </div>
            )}
            <div className="mt-6">
              <GoogleButton text={isLogin ? "signin_with" : "continue_with"} onCredential={onGoogle} />
            </div>
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <p className="my-5 flex items-center gap-3 text-[12px] text-faint before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">or with email</p>
            )}
            <form onSubmit={onSubmit} className={cx("space-y-4", !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && "mt-6")} noValidate>
              <Field label="Work email">
                <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@company.com" />
              </Field>
              <Field label="Password" hint={isLogin ? undefined : "At least 8 characters."}>
                <PasswordInput name="password" required minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} />
              </Field>
              {isLogin && (
                <p className="-mt-2 text-right text-[12px]">
                  <Link href="/forgot-password" className="text-muted underline-offset-2 hover:text-ink hover:underline">Forgot your password?</Link>
                </p>
              )}
              {error && <ErrorBanner message={error} />}
              <button type="submit" disabled={busy} className={cx(buttonClass("primary"), "w-full")}>
                {busy ? "Please wait..." : isLogin ? "Log in" : chosen ? "Create account and pay" : "Create account"}
                <ButtonArrow />
              </button>
              {!isLogin && (
                <p className="text-center text-[12px] text-faint">
                  By creating an account you agree to the{" "}
                  <a href={siteHref("/terms")} className="underline underline-offset-2 hover:text-ink">Terms</a> and{" "}
                  <a href={siteHref("/privacy")} className="underline underline-offset-2 hover:text-ink">Privacy Policy</a>.
                </p>
              )}
            </form>
          </div>
          <p className="mt-5 text-center text-[13px] text-muted lg:text-left">
            {isLogin ? "New to SeenLens? " : "Already have an account? "}
            <Link href={`${isLogin ? "/register" : "/login"}${invite ? `?invite=${encodeURIComponent(invite)}` : ""}`} className="font-medium text-ink underline-offset-2 hover:underline">
              {isLogin ? "Run a free scan" : "Log in"}
            </Link>
          </p>
        </div>
      </div>

      <aside className="hidden flex-col justify-between bg-night p-12 text-white lg:flex" aria-label="What SeenLens does">
        <div className="flex items-center gap-2" aria-hidden>
          {(["chatgpt", "perplexity", "gemini"] as const).map((engine) => (
            <span key={engine} className="grid size-9 place-items-center rounded-full bg-white/10">
              <EngineIcon engine={engine} size={16} mono />
            </span>
          ))}
        </div>
        <div>
          <h2 className="max-w-[460px] text-balance font-display text-[34px] leading-[1.1] font-semibold tracking-[-0.035em]">
            Know when AI recommends your competitors instead of you.
          </h2>
          <ul className="mt-10 space-y-6">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex max-w-[480px] items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-white/10 text-white">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block text-[15px] font-medium">{title}</span>
                  <span className="mt-0.5 block text-[14px] text-white/60">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] text-white/50">Asks ChatGPT, Perplexity and Gemini the questions your buyers ask.</p>
      </aside>
    </div>
  );
}
