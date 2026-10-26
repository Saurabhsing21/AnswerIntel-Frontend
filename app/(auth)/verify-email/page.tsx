"use client";

import { CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthCard } from "@/components/app/auth-card";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import { cx } from "@/lib/cx";

function Verify() {
  const token = useSearchParams().get("token") ?? "";
  const [result, setResult] = useState<{ email?: string; error?: string } | null>(null);

  useEffect(() => {
    api<{ email: string }>("/api/auth/public/verify-email", { method: "POST", json: { token } })
      .then((r) => setResult({ email: r.email }))
      .catch((e: ApiError) => setResult({ error: e.message }));
  }, [token]);

  if (!result)
    return (
      <AuthCard title="Confirming your email">
        <CircleNotch size={24} className="animate-spin text-ink" />
      </AuthCard>
    );
  if (result.error) return <AuthCard title="This link didn't work" body={`${result.error} You can send a new one from your account settings.`} />;
  return (
    <AuthCard title="Email confirmed" body={`${result.email} is confirmed. Reports and alerts will go there.`}>
      <Link href="/projects" className={cx(buttonClass("primary"), "w-full")}>Open SeenLens <ButtonArrow /></Link>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><Verify /></Suspense>;
}
