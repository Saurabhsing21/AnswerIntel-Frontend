"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

type Status = "idle" | "loading" | "done" | "error";

/** Pill-shaped email capture: input and action share one rounded field. */
export function WaitlistForm({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(data?.error?.message ?? "Something went wrong. Please try again.");
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className={cx("min-h-[92px] max-w-[460px]", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.p
            key="done"
            role="status"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="flex items-center gap-2.5 rounded-full bg-mark-soft px-4 py-3 text-[15px] text-ink"
          >
            <CheckCircle size={20} weight="fill" className="shrink-0" />
            You are on the list. We will email you when your spot opens.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={onSubmit}
            noValidate
          >
            <label htmlFor={`${id}-email`} className="mb-2 block text-[13px] text-muted">
              Work email
            </label>
            <div
              className={cx(
                "flex items-center gap-1 rounded-full border bg-surface p-1 pl-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors",
                "focus-within:border-ink",
                status === "error" ? "border-down" : "border-line-strong",
              )}
            >
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={status === "error"}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
              />
              <button type="submit" disabled={status === "loading"} className={buttonClass("primary", "sm")}>
                {status === "loading" ? "Joining..." : "Join waitlist"}
                <ButtonArrow />
              </button>
            </div>
            {error && (
              <p id={`${id}-error`} className="mt-2 pl-4 text-[13px] text-down">
                {error}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
