"use client";

import {
  ChartLine,
  Hash,
  Lightbulb,
  Link as LinkIcon,
  Plus,
  SignOut,
  Users,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api, UNAUTHORIZED_EVENT, useApi } from "@/lib/api/client";
import type { Project } from "@/lib/api/types";
import { Logo } from "@/components/ui/logo";
import { cx } from "@/lib/cx";

const sections = [
  { href: "", label: "Overview", icon: ChartLine },
  { href: "/prompts", label: "Prompts", icon: Hash },
  { href: "/competitors", label: "Competitors", icon: Users },
  { href: "/sources", label: "Sources", icon: LinkIcon },
  { href: "/opportunities", label: "Opportunities", icon: Lightbulb },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { data: projects, reload: reloadProjects } = useApi<Project[]>("/projects");
  const current = projects?.find((p) => p.id === params.id);

  // Refresh the project list on navigation so new projects appear immediately.
  useEffect(() => {
    reloadProjects();
  }, [pathname, reloadProjects]);

  useEffect(() => {
    const toLogin = () => router.push("/login");
    window.addEventListener(UNAUTHORIZED_EVENT, toLogin);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, toLogin);
  }, [router]);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const nav = params.id
    ? sections.map((s) => {
        const href = `/projects/${params.id}${s.href}`;
        const active = s.href === "" ? pathname === href : pathname.startsWith(href);
        return { ...s, href, active };
      })
    : [];

  return (
    <div className="min-h-dvh bg-page lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-[#fbfbfa] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center gap-2 px-4 py-3 lg:px-5 lg:py-5">
          <Link href="/projects" aria-label="All projects">
            <Logo />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="ml-auto grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink lg:hidden"
            aria-label="Log out"
          >
            <SignOut size={16} />
          </button>
        </div>

        <div className="px-3 lg:px-4">
          <p className="hidden px-2 pb-1.5 text-[11px] text-faint lg:block">Projects</p>
          <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {projects?.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className={cx(
                  "flex shrink-0 items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] transition-colors",
                  p.id === params.id ? "bg-sunken font-medium text-ink" : "text-ink-2 hover:bg-black/[0.03]",
                )}
              >
                <span className="grid size-5 place-items-center rounded-[5px] bg-ink text-[10px] font-semibold text-white">
                  {p.brand_name[0]?.toUpperCase()}
                </span>
                <span className="truncate">{p.brand_name}</span>
              </Link>
            ))}
            <Link
              href="/projects/new"
              className={cx(
                "flex shrink-0 items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] text-muted transition-colors hover:bg-black/[0.03] hover:text-ink",
                pathname === "/projects/new" && "bg-sunken text-ink",
              )}
            >
              <Plus size={14} /> New project
            </Link>
          </div>
        </div>

        {current && (
          <nav aria-label="Project" className="border-t border-line px-3 py-2 lg:mt-3 lg:px-4 lg:pt-4">
            <p className="hidden truncate px-2 pb-1.5 text-[11px] text-faint lg:block">{current.brand_name}</p>
            <div className="flex gap-1 overflow-x-auto lg:flex-col">
              {nav.map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex shrink-0 items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] transition-colors",
                    active ? "bg-ink text-white" : "text-ink-2 hover:bg-black/[0.03]",
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <button
          type="button"
          onClick={logout}
          className="mt-auto hidden items-center gap-2 border-t border-line px-6 py-4 text-[13px] text-muted transition-colors hover:text-ink lg:flex"
        >
          <SignOut size={15} /> Log out
        </button>
      </aside>

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}
