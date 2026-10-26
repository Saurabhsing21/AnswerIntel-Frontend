"use client";

import { CheckCircle, EnvelopeSimple, SignOut, WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { useToast } from "@/components/app/toast";
import { Card, ErrorBanner, Field, inputClass, PasswordInput, PageHeader, Skeleton } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Me } from "@/lib/api/types";

/** Runs a form submit with a busy flag and an inline error. */
function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, run };
}

function Profile({ me, reload }: { me: Me; reload: () => void }) {
  const toast = useToast();
  const { busy, error, run } = useSubmit();
  return (
    <Card title="Profile" subtitle="Shown to your teammates">
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const name = String(new FormData(e.currentTarget).get("name"));
          run(async () => {
            await api("/auth/me", { method: "PATCH", json: { name } });
            toast.push("Saved.", "success");
            reload();
          });
        }}
      >
        <Field label="Name">
          <input name="name" defaultValue={me.name ?? ""} maxLength={100} className={inputClass} placeholder="Your name" />
        </Field>
        {error && <ErrorBanner message={error} />}
        <button type="submit" disabled={busy} className={buttonClass("primary", "sm")}>Save</button>
      </form>
    </Card>
  );
}

function Email({ me }: { me: Me }) {
  const toast = useToast();
  const { busy, error, run } = useSubmit();
  const [sent, setSent] = useState("");
  return (
    <Card title="Login email" subtitle="Where reports, alerts and invoices go">
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="font-medium text-ink">{me.email}</span>
          {me.email_verified ? (
            <span className="inline-flex items-center gap-1 text-up-ink"><CheckCircle size={14} weight="fill" /> Confirmed</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 text-amber-ink"><WarningCircle size={14} weight="fill" /> Not confirmed</span>
              <button
                type="button"
                className="font-medium text-ink underline underline-offset-2"
                onClick={() => run(async () => {
                  await api("/auth/send-verification", { method: "POST" });
                  toast.push(`Confirmation link sent to ${me.email}.`, "success");
                })}
              >
                Send the link again
              </button>
            </>
          )}
        </div>
        {sent ? (
          <p className="flex items-center gap-2 rounded-[10px] bg-sunken px-3 py-2.5 text-[13px] text-ink-2">
            <EnvelopeSimple size={16} /> Click the link we sent to {sent}. Your login email changes when you do.
          </p>
        ) : (
          <form
            className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const newEmail = String(form.get("new_email"));
              run(async () => {
                await api("/auth/change-email", { method: "POST", json: { new_email: newEmail, password: form.get("password") } });
                setSent(newEmail);
              });
            }}
          >
            <Field label="New email">
              <input name="new_email" type="email" required className={inputClass} placeholder="you@company.com" />
            </Field>
            <Field label="Your password">
              <PasswordInput name="password" required autoComplete="current-password" />
            </Field>
            <div className="sm:col-span-2">
              <button type="submit" disabled={busy} className={buttonClass("secondary", "sm")}>Change email</button>
            </div>
          </form>
        )}
        {error && <ErrorBanner message={error} />}
      </div>
    </Card>
  );
}

function Password({ me }: { me: Me }) {
  const toast = useToast();
  const { busy, error, run } = useSubmit();
  return (
    <Card title="Password" subtitle="Changing it signs out your other devices">
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const formEl = e.currentTarget;
          const form = new FormData(formEl);
          const next = String(form.get("new_password"));
          run(async () => {
            if (next !== form.get("confirm")) throw new ApiError(400, "MISMATCH", "The two new passwords don't match.");
            await api("/auth/change-password", { method: "POST", json: { current_password: form.get("current_password"), new_password: next } });
            await api("/api/auth/login", { method: "POST", json: { email: me.email, password: next } }); // fresh session for this device
            formEl.reset();
            toast.push("Password changed.", "success");
          });
        }}
      >
        <Field label="Current password">
          <PasswordInput name="current_password" required autoComplete="current-password" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" hint="At least 8 characters.">
            <PasswordInput name="new_password" required minLength={8} autoComplete="new-password" />
          </Field>
          <Field label="Repeat it">
            <PasswordInput name="confirm" required minLength={8} autoComplete="new-password" />
          </Field>
        </div>
        {error && <ErrorBanner message={error} />}
        <button type="submit" disabled={busy} className={buttonClass("primary", "sm")}>Change password</button>
      </form>
    </Card>
  );
}

function Sessions() {
  const { busy, error, run } = useSubmit();
  return (
    <Card title="Sessions" subtitle="Lost a laptop or shared a computer?">
      <div className="space-y-3 p-5">
        <p className="text-[13px] text-muted">Sign out of SeenLens on every device, including this one.</p>
        {error && <ErrorBanner message={error} />}
        <button
          type="button"
          disabled={busy}
          className={buttonClass("secondary", "sm")}
          onClick={() => run(async () => {
            await api("/auth/logout-all", { method: "POST" });
            await api("/api/auth/logout", { method: "POST" });
            window.location.replace("/login");
          })}
        >
          <SignOut size={14} /> Sign out everywhere
        </button>
      </div>
    </Card>
  );
}

export default function AccountPage() {
  const me = useApi<Me>("/auth/me");
  if (me.error) return <ErrorBanner message={me.error.message} />;
  return (
    <>
      <PageHeader title="Account" description="Your login, password and sessions. Plans and team members are per workspace." />
      {!me.data ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <div className="min-w-0 space-y-4">
            <Profile me={me.data} reload={me.reload} />
            <Email me={me.data} />
          </div>
          <div className="min-w-0 space-y-4">
            <Password me={me.data} />
            <Sessions />
          </div>
        </div>
      )}
    </>
  );
}
