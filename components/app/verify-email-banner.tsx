"use client";

import { EnvelopeSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useApi } from "@/lib/api/client";
import type { Me } from "@/lib/api/types";

/** Until the login email is confirmed, reports and alerts may not reach anyone. */
export function VerifyEmailBanner() {
  const { data } = useApi<Me>("/auth/me");
  if (!data || data.email_verified) return null;
  return (
    <div role="status" className="mb-4 flex flex-wrap items-center gap-2 rounded-[12px] border border-line-strong bg-surface px-4 py-3 text-[13px] text-ink-2">
      <EnvelopeSimple size={16} className="text-ink" />
      Confirm {data.email} so your reports and alerts reach you. Check your inbox for our link.
      <Link href="/account" className="ml-auto font-medium text-ink underline underline-offset-2">Resend</Link>
    </div>
  );
}
