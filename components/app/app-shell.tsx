"use client";

import { X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { CommandPalette } from "@/components/app/command-palette";
import { ProjectProvider } from "@/components/app/project-context";
import { Sidebar } from "@/components/app/sidebar";
import { ToastProvider } from "@/components/app/toast";
import { Topbar } from "@/components/app/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const toLogin = () => router.push("/login");
    window.addEventListener(UNAUTHORIZED_EVENT, toLogin);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, toLogin);
  }, [router]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <ToastProvider>
      <ProjectProvider>
        <div className="min-h-dvh bg-page lg:grid lg:grid-cols-[248px_1fr]">
          <aside className="hidden border-r border-line lg:sticky lg:top-0 lg:block lg:h-dvh">
            <Sidebar />
          </aside>

          {menuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute inset-y-0 left-0 w-[284px] max-w-[85vw] border-r border-line shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]" role="dialog" aria-modal="true" aria-label="Menu">
                <Sidebar onNavigate={() => setMenuOpen(false)} />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-col">
            <Topbar onMenu={() => setMenuOpen(true)} />
            <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
              <div className="mx-auto max-w-[1280px]">{children}</div>
            </main>
          </div>
        </div>
        <CommandPalette />
      </ProjectProvider>
    </ToastProvider>
  );
}
