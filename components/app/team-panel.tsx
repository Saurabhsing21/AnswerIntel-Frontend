"use client";

import { Crown, EnvelopeSimple, ShieldCheck, SignOut, Trash, User, UserPlus } from "@phosphor-icons/react";
import { useState } from "react";
import { askUpgrade, ProBadge, usePro } from "@/components/app/pro-lock";
import { useToast } from "@/components/app/toast";
import { Card, ErrorBanner, inputClass, Skeleton } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Invite, Me, Member, Role, Workspace } from "@/lib/api/types";
import { cx } from "@/lib/cx";

const ROLE_INFO: Record<Role, { label: string; icon: typeof User; body: string }> = {
  owner: { label: "Owner", icon: Crown, body: "Everything, including billing and who else is an owner." },
  admin: { label: "Admin", icon: ShieldCheck, body: "Manages people and projects, but not ownership." },
  member: { label: "Member", icon: User, body: "Works on projects: scans, prompts, reports." },
};

const selectClass = "h-9 rounded-full border border-line-strong bg-surface px-3 text-[13px] text-ink-2 outline-none focus:border-ink";

/** People in the workspace: invite, change roles, remove; pending invitations sit in the same list. */
export function TeamPanel({ workspace }: { workspace: Workspace }) {
  const toast = useToast();
  const members = useApi<Member[]>(`/workspaces/${workspace.id}/members`);
  const invites = useApi<Invite[]>(`/workspaces/${workspace.id}/invites`);
  const me = useApi<Me>("/auth/me");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const manager = workspace.role === "owner" || workspace.role === "admin";
  const pro = usePro();

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const result = await api<{ invited: boolean }>(`/workspaces/${workspace.id}/members`, { method: "POST", json: { email, role } });
      toast.push(result.invited ? `Invitation sent to ${email}.` : `${email} now has access to every project in ${workspace.name}.`, "success");
      setEmail("");
      members.reload();
      invites.reload();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setAdding(false);
    }
  }

  async function remove(m: Member) {
    try {
      await api(`/workspaces/${workspace.id}/members/${m.user_id}`, { method: "DELETE" });
      toast.push(m.user_id === me.data?.id ? "You left the workspace." : `${m.email} was removed.`, "success");
      members.reload();
    } catch (err) {
      toast.push((err as ApiError).code === "LAST_OWNER" ? "A workspace must keep at least one owner." : (err as ApiError).message, "error");
    }
  }

  async function changeRole(m: Member, next: Role) {
    try {
      await api(`/workspaces/${workspace.id}/members/${m.user_id}`, { method: "PATCH", json: { role: next } });
      toast.push(`${m.name || m.email} is now ${ROLE_INFO[next].label.toLowerCase()}.`, "success");
      members.reload();
    } catch (err) {
      toast.push((err as ApiError).message, "error");
    }
  }

  async function cancelInvite(i: Invite) {
    try {
      await api(`/workspaces/${workspace.id}/invites/${i.id}`, { method: "DELETE" });
      invites.reload();
    } catch (err) {
      toast.push((err as ApiError).message, "error");
    }
  }

  if (members.error) return <ErrorBanner message={members.error.message} />;
  const people = members.data?.length ?? 0;
  const pending = invites.data ?? [];

  return (
    <div className="space-y-4">
      <Card
        title="People"
        subtitle={members.data ? `${people} ${people === 1 ? "member" : "members"}${pending.length ? `, ${pending.length} invited` : ""}. Everyone sees every project in ${workspace.name}.` : undefined}
      >
        {manager && !pro && (
          <button
            type="button"
            onClick={() => askUpgrade("Inviting teammates is on paid plans. Every plan includes unlimited seats.")}
            className="flex w-full items-center gap-2 border-b border-line bg-[#fbfbfa] px-5 py-3.5 text-left text-[13px] text-muted"
          >
            <UserPlus size={14} /> Invite teammates <ProBadge className="ml-1" />
          </button>
        )}
        {manager && pro && (
          <form onSubmit={add} className="flex flex-col gap-2 border-b border-line bg-[#fbfbfa] px-5 py-3.5 sm:flex-row sm:items-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Invite by email, e.g. cofounder@company.com"
              aria-label="Email to invite"
              className={cx(inputClass, "h-9 flex-1 bg-surface")}
            />
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="Role" className={selectClass}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              {workspace.role === "owner" && <option value="owner">Owner</option>}
            </select>
            <button type="submit" disabled={adding || !email} className={buttonClass("primary", "sm")}>
              <UserPlus size={14} /> {adding ? "Sending..." : "Send invite"}
            </button>
          </form>
        )}
        {error && <div className="px-5 pt-3"><ErrorBanner message={error} /></div>}
        {members.loading ? (
          <div className="space-y-2 p-5">{[0, 1].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <ul className="divide-y divide-line">
            {(members.data ?? []).map((m) => {
              const Icon = ROLE_INFO[m.role].icon;
              const isMe = m.user_id === me.data?.id;
              const canEdit = manager && (workspace.role === "owner" || m.role !== "owner");
              return (
                <li key={m.user_id} className="flex items-center gap-3.5 px-5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white" aria-hidden>
                    {(m.name || m.email)[0]?.toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 truncate text-[13px] font-medium text-ink">
                      {m.name || m.email}
                      {isMe && <span className="rounded-[4px] bg-sunken px-1.5 py-px text-[10px] font-medium text-ink-2">You</span>}
                    </span>
                    {m.name && <span className="block truncate text-[12px] text-muted">{m.email}</span>}
                  </span>
                  {canEdit ? (
                    <select aria-label={`Role of ${m.email}`} value={m.role} onChange={(e) => changeRole(m, e.target.value as Role)} className={cx(selectClass, "h-8 text-[12px]")}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      {workspace.role === "owner" && <option value="owner">Owner</option>}
                    </select>
                  ) : (
                    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium", m.role === "owner" ? "bg-ink text-white" : "bg-sunken text-ink-2")}>
                      <Icon size={12} /> {ROLE_INFO[m.role].label}
                    </span>
                  )}
                  {(manager || isMe) && (
                    <button
                      type="button"
                      onClick={() => remove(m)}
                      title={isMe ? "Leave workspace" : "Remove"}
                      aria-label={isMe ? "Leave workspace" : `Remove ${m.email}`}
                      className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-down"
                    >
                      {isMe ? <SignOut size={15} /> : <Trash size={15} />}
                    </button>
                  )}
                </li>
              );
            })}
            {pending.map((i) => (
              <li key={`invite-${i.id}`} className="flex items-center gap-3.5 px-5 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-line-strong text-muted" aria-hidden>
                  <EnvelopeSimple size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">{i.email}</span>
                  <span className="block text-[12px] text-muted">
                    Invited as {ROLE_INFO[i.role].label.toLowerCase()} · expires {new Date(i.expires_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </span>
                <span className="rounded-full bg-amber-soft px-2.5 py-1 text-[12px] font-medium text-amber-ink">Pending</span>
                {manager && (
                  <button type="button" onClick={() => cancelInvite(i)} title="Cancel invitation" aria-label={`Cancel invitation for ${i.email}`}
                    className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-down">
                    <Trash size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="grid border-t border-line bg-[#fbfbfa] sm:grid-cols-3 sm:divide-x sm:divide-line">
          {(Object.keys(ROLE_INFO) as Role[]).map((r) => {
            const { label, icon: Icon, body } = ROLE_INFO[r];
            return (
              <div key={r} className="flex items-start gap-2.5 px-5 py-3.5">
                <Icon size={15} className="mt-0.5 shrink-0 text-ink-2" />
                <p className="text-[12px] leading-snug text-muted">
                  <span className="font-medium text-ink">{label}.</span> {body}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
      {manager && <RenameWorkspace key={workspace.id + workspace.name} id={workspace.id} name={workspace.name} />}
    </div>
  );
}

function RenameWorkspace({ id, name }: { id: string; name: string }) {
  const toast = useToast();
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/workspaces/${id}`, { method: "PATCH", json: { name: value } });
      toast.push("Workspace renamed.", "success");
    } catch (err) {
      toast.push((err as ApiError).message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="flex flex-col gap-3 rounded-[16px] border border-line-strong bg-surface px-5 py-3.5 sm:flex-row sm:items-center">
      <div className="sm:w-[220px]">
        <p className="text-[14px] font-medium text-ink">Workspace name</p>
        <p className="text-[12px] text-muted">Shown in the project switcher.</p>
      </div>
      <input aria-label="Workspace name" className={cx(inputClass, "h-9 flex-1")} value={value} onChange={(e) => setValue(e.target.value)} maxLength={255} required />
      <button type="submit" disabled={busy || !value.trim() || value === name} className={buttonClass("secondary", "sm")}>Save</button>
    </form>
  );
}
