"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/components/app/auth-card";
import { ErrorBanner, Field, inputClass } from "@/components/app/ui";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import { cx } from "@/lib/cx";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/public/forgot-password", { method: "POST", json: { email } });
      setSentTo(email);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  const back = <Link href="/login" className="font-medium text-ink underline-offset-2 hover:underline">Back to log in</Link>;
  if (sentTo)
    return <AuthCard title="Check your inbox" body={`If ${sentTo} has a SeenLens account, a reset link is on its way. It expires in an hour.`} footer={back} />;
  return (
    <AuthCard title="Reset your password" body="Enter your login email and we'll send you a link to choose a new password." footer={back}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@company.com" />
        </Field>
        {error && <ErrorBanner message={error} />}
        <button type="submit" disabled={busy} className={cx(buttonClass("primary"), "w-full")}>
          {busy ? "Sending..." : "Send reset link"} <ButtonArrow />
        </button>
      </form>
    </AuthCard>
  );
}
