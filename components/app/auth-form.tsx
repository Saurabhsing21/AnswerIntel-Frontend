"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { ErrorBanner, Field, inputClass } from "@/components/app/ui";
import { Logo } from "@/components/ui/logo";
import { cx } from "@/lib/cx";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api(`/api/auth/${mode}`, { method: "POST", json: { email: form.get("email"), password: form.get("password") } });
      router.push("/projects");
      router.refresh();
    } catch (err) {
      setError((err as ApiError).message);
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-page px-4">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo size="lg" />
        </Link>
        <div className="rounded-[20px] border border-line-strong bg-surface p-6 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.2)] md:p-8">
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-[14px] text-muted">{isLogin ? "Log in to see how AI talks about your brand." : "Start measuring your AI visibility."}</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <Field label="Work email">
              <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@company.com" />
            </Field>
            <Field label="Password" hint={isLogin ? undefined : "At least 8 characters."}>
              <input name="password" type="password" required minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} className={inputClass} />
            </Field>
            {error && <ErrorBanner message={error} />}
            <button type="submit" disabled={busy} className={cx(buttonClass("primary"), "w-full")}>
              {busy ? "Please wait..." : isLogin ? "Log in" : "Create account"}
              <ButtonArrow />
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-[13px] text-muted">
          {isLogin ? "New to AnswerIntel? " : "Already have an account? "}
          <Link href={isLogin ? "/register" : "/login"} className="font-medium text-ink underline-offset-2 hover:underline">
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
