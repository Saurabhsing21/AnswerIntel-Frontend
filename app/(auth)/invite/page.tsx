"use client";

import { CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthCard } from "@/components/app/auth-card";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import { cx } from "@/lib/cx";

function Invite() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"joining" | "signed-out" | { error: string }>("joining");

  useEffect(() => {
    api<{ id: string }>("/workspaces/invites/accept", { method: "POST", json: { token } })
      .then(() => window.location.replace("/projects"))
      .catch((e: ApiError) => setState(e.status === 401 ? "signed-out" : { error: e.message }));
  }, [token]);

  if (state === "joining")
    return (
      <AuthCard title="Joining the workspace">
        <CircleNotch size={24} className="animate-spin text-ink" />
      </AuthCard>
    );
  if (state === "signed-out") {
    const next = `invite=${encodeURIComponent(token)}`;
    return (
      <AuthCard title="You're invited to SeenLens" body="Create an account or log in with the email address the invitation was sent to.">
        <div className="grid gap-2">
          <Link href={`/register?${next}`} className={cx(buttonClass("primary"), "w-full")}>Create account</Link>
          <Link href={`/login?${next}`} className={cx(buttonClass("secondary"), "w-full")}>Log in</Link>
        </div>
      </AuthCard>
    );
  }
  return (
    <AuthCard
      title="We couldn't add you"
      body={state.error}
      footer={<Link href="/projects" className="font-medium text-ink underline-offset-2 hover:underline">Go to your projects</Link>}
    />
  );
}

export default function InvitePage() {
  return <Suspense fallback={null}><Invite /></Suspense>;
}
