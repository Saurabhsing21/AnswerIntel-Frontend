"use client";

import { useState } from "react";
import { PlanChooser } from "@/components/app/billing";
import { Card, ErrorBanner, Field, inputClass, PageHeader } from "@/components/app/ui";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { Billing, Workspace } from "@/lib/api/types";

/** A second workspace for another company or client. It has its own plan, team and projects. */
export default function NewWorkspacePage() {
  const [created, setCreated] = useState<{ workspace: Workspace; billing: Billing } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name"));
    setBusy(true);
    setError("");
    try {
      const workspace = await api<Workspace>("/workspaces", { method: "POST", json: { name } });
      setCreated({ workspace, billing: await api<Billing>(`/workspaces/${workspace.id}/billing`) });
    } catch (err) {
      setError((err as ApiError).message);
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="New workspace" description="For another company or a client. Each workspace has its own plan, team and projects." />
      <div className="max-w-[640px]">
        {created ? (
          <Card title={`Choose a plan for ${created.workspace.name}`} subtitle="You can change or cancel it any time.">
            <div className="p-5">
              <PlanChooser billing={created.billing} returnPath={`/projects/new?workspace=${created.workspace.id}`} />
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={create} className="space-y-4 p-5">
              <Field label="Workspace name" hint="Usually the company name. You can rename it later.">
                <input name="name" required maxLength={255} className={inputClass} placeholder="Acme Inc." autoFocus />
              </Field>
              {error && <ErrorBanner message={error} />}
              <button type="submit" disabled={busy} className={buttonClass("primary", "sm")}>
                Create workspace <ButtonArrow />
              </button>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
