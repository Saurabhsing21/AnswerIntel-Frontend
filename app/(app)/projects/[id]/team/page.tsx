"use client";

import { Crown, ShieldCheck, SignOut, Trash, User, UserPlus, UsersThree } from "@phosphor-icons/react";
import { useState } from "react";
import { useProject } from "@/components/app/project-context";
import { useToast } from "@/components/app/toast";
import { Card, EmptyState, ErrorBanner, Field, inputClass, PageHeader, Skeleton } from "@/components/app/ui";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, useApi } from "@/lib/api/client";
import type { Member, Role } from "@/lib/api/types";
import { cx } from "@/lib/cx";

const ROLE_INFO: Record<Role, { label: string; icon: typeof User; body: string }> = {
  owner: { label: "Owner", icon: Crown, body: "Full control, including who else is an owner. A workspace always keeps at least one." },
  admin: { label: "Admin", icon: ShieldCheck, body: "Manages people and projects. Can add admins and members, but cannot grant ownership." },
  member: { label: "Member", icon: User, body: "Works on projects: scans, prompts, opportunities, experiments and reports." },
};

function Roles() {
  return (
    <Card title="Roles" subtitle="What each person can do">
      <ul className="divide-y divide-line">
        {(Object.keys(ROLE_INFO) as Role[]).map((role) => {
          const { label, icon: Icon, body } = ROLE_INFO[role];
          return (
            <li key={role} className="flex items-start gap-3.5 px-5 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-sunken text-ink-2">
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-[13px] font-medium text-ink">{label}</span>
                <span className="block text-[12px] text-muted">{body}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default function TeamPage() {
  const toast = useToast();
  const { project, workspaces, projectsLoading } = useProject();
  const workspace = workspaces.find((w) => w.id === project?.workspace_id);
  const members = useApi<Member[]>(workspace ? `/workspaces/${workspace.id}/members` : null);
  const me = useApi<{ id: number; email: string }>("/auth/me");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const manager = workspace?.role === "owner" || workspace?.role === "admin";

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace) return;
    setAdding(true);
    setError("");
    try {
      await api(`/workspaces/${workspace.id}/members`, { method: "POST", json: { email, role } });
      toast.push(`${email} now has access to every project in ${workspace.name}.`, "success");
      setEmail("");
      members.reload();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.code === "USER_NOT_FOUND" ? "That person needs a SeenLens account first. Ask them to sign up, then add them here." : apiErr.message);
    } finally {
      setAdding(false);
    }
  }

  async function remove(m: Member) {
    if (!workspace) return;
    try {
      await api(`/workspaces/${workspace.id}/members/${m.user_id}`, { method: "DELETE" });
      toast.push(m.user_id === me.data?.id ? "You left the workspace." : `${m.email} was removed.`, "success");
      members.reload();
    } catch (err) {
      toast.push((err as ApiError).code === "LAST_OWNER" ? "A workspace must keep at least one owner." : (err as ApiError).message, "error");
    }
  }

  if (members.error) return <ErrorBanner message={members.error.message} />;

  return (
    <>
      <PageHeader title="Team" description={workspace ? `People with access to every project in ${workspace.name}.` : "Who can see and work on your projects."} />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 space-y-4">
        <Card title="Members" subtitle={members.data ? `${members.data.length} ${members.data.length === 1 ? "person" : "people"}` : undefined}>
          {projectsLoading || members.loading ? (
            <div className="space-y-2 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !members.data?.length ? (
            <EmptyState icon={<UsersThree size={30} />} title="Just you for now" body="Add a cofounder or a consultant and they see everything in this workspace." />
          ) : (
            <ul className="divide-y divide-line">
              {members.data.map((m) => {
                const Icon = ROLE_INFO[m.role].icon;
                const isMe = m.user_id === me.data?.id;
                return (
                  <li key={m.user_id} className="flex items-center gap-3.5 px-5 py-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white" aria-hidden>
                      {m.email[0]?.toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {m.email}
                        {isMe && <span className="ml-2 rounded-[4px] bg-sunken px-1.5 py-px text-[10px] font-medium text-ink-2">You</span>}
                      </span>
                    </span>
                    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", m.role === "owner" ? "bg-ink text-white" : "bg-sunken text-ink-2")}>
                      <Icon size={11} /> {ROLE_INFO[m.role].label}
                    </span>
                    {(manager || isMe) && (
                      <button
                        type="button"
                        onClick={() => remove(m)}
                        className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-down"
                        aria-label={isMe ? "Leave workspace" : `Remove ${m.email}`}
                        title={isMe ? "Leave workspace" : "Remove"}
                      >
                        {isMe ? <SignOut size={15} /> : <Trash size={15} />}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Roles />
        </div>

        <div className="min-w-0 space-y-4">
          <Card title="Add someone" subtitle="They get access to every project here">
            {manager ? (
              <form onSubmit={add} className="space-y-4 p-5">
                <Field label="Email" hint="They need a SeenLens account. Email invitations are coming soon.">
                  <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cofounder@company.com" required />
                </Field>
                <Field label="Role">
                  <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as Role)}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    {workspace?.role === "owner" && <option value="owner">Owner</option>}
                  </select>
                </Field>
                {error && <ErrorBanner message={error} />}
                <button type="submit" disabled={adding || !email} className={buttonClass("primary", "sm")}>
                  <UserPlus size={14} /> Add to workspace
                </button>
              </form>
            ) : (
              <p className="p-5 text-[13px] text-muted">Only owners and admins can add people. Ask an owner of {workspace?.name ?? "this workspace"}.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
