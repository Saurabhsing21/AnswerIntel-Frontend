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
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const company = String(form.get("company") ?? ""); // honeypot, see below
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
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
    <div className={cx("min-h-[56px] max-w-[460px]", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.p
            key="done"
            role="status"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="inline-flex items-center gap-2.5 rounded-full bg-mark-soft py-3 pr-5 pl-4 text-[15px] text-ink"
          >
            <CheckCircle size={20} weight="fill" className="shrink-0" />
            You&apos;re on the list. Check your inbox.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={onSubmit}
            noValidate
          >
            <label htmlFor={`${id}-email`} className="sr-only">
              Email
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
            {/* Honeypot: hidden from people and screen readers; bots that fill every field get silently ignored. */}
            <input name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
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
