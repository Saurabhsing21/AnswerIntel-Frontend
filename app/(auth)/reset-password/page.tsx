"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthCard } from "@/components/app/auth-card";
import { ErrorBanner, Field, PasswordInput } from "@/components/app/ui";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import { cx } from "@/lib/cx";

function Reset() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("password") !== form.get("confirm")) return setError("The two passwords don't match.");
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/public/reset-password", { method: "POST", json: { token, password: form.get("password") } });
      setDone(true);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <AuthCard title="Password changed" body="You're signed out everywhere else. Log in with your new password.">
        <Link href="/login" className={cx(buttonClass("primary"), "w-full")}>Log in <ButtonArrow /></Link>
      </AuthCard>
    );
  return (
    <AuthCard title="Choose a new password" footer={<Link href="/forgot-password" className="font-medium text-ink underline-offset-2 hover:underline">Need a new link?</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password" hint="At least 8 characters.">
          <PasswordInput name="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Field label="Repeat it">
          <PasswordInput name="confirm" required minLength={8} autoComplete="new-password" />
        </Field>
        {error && <ErrorBanner message={error} />}
        <button type="submit" disabled={busy || !token} className={cx(buttonClass("primary"), "w-full")}>
          {busy ? "Saving..." : "Save password"} <ButtonArrow />
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><Reset /></Suspense>;
}
