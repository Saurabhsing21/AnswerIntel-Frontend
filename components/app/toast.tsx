"use client";

import { CheckCircle, Info, WarningCircle, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cx } from "@/lib/cx";

type Tone = "success" | "error" | "info";
type ToastItem = { id: number; tone: Tone; message: string };

const ToastContext = createContext<{ push: (message: string, tone?: Tone) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const ICONS = { success: CheckCircle, error: WarningCircle, info: Info } as const;
const TONES = { success: "text-up", error: "text-down", info: "text-ink" } as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(0);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (message: string, tone: Tone = "success") => {
      const id = ++next.current;
      setItems((all) => [...all.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4500);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" role="status" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = ICONS[t.tone];
            return (
              <motion.div
                key={t.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="pointer-events-auto flex items-start gap-2.5 rounded-[12px] border border-line-strong bg-surface p-3 pr-2 text-[13px] shadow-[0_16px_40px_-16px_rgb(0_0_0/0.3)]"
              >
                <Icon size={18} weight="fill" className={cx("mt-px shrink-0", TONES[t.tone])} />
                <p className="min-w-0 flex-1 text-ink">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="grid size-6 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink"
                  aria-label="Dismiss"
                >
                  <X size={12} weight="bold" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
