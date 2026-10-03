"use client";

import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { CompetitorTable } from "@/components/product/competitor-table";
import { buttonClass } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

type Status = "idle" | "loading" | "done" | "error";

export function WaitlistCta() {
  const reduce = useReducedMotion();
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
    <section id="waitlist" className="border-t border-line">
      <div className="mx-auto max-w-[1200px] border-x border-line p-2 md:p-3">
        <div className="relative grid overflow-hidden rounded-[16px] bg-night lg:grid-cols-[1fr_1fr]">
          <div className="relative z-10 px-6 py-14 md:px-14 md:py-20">
            <h2 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-[48px]">
              Be first to see what AI
              <span className="block text-white/45">says about your brand</span>
            </h2>

            <div className="mt-8 min-h-[104px] max-w-[440px]">
              <AnimatePresence mode="wait" initial={false}>
                {status === "done" ? (
                  <motion.p
                    key="done"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="flex items-start gap-2.5 text-[16px] text-white"
                    role="status"
                  >
                    <CheckCircle size={22} weight="fill" className="shrink-0 text-[#4ade80]" />
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
                    <label htmlFor="email" className="block text-[13px] text-white/70">
                      Work email
                    </label>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        aria-invalid={status === "error"}
                        aria-describedby={error ? "email-error" : undefined}
                        className={cx(
                          "h-11 flex-1 rounded-control border bg-white/[0.06] px-3.5 text-[15px] text-white placeholder:text-white/40",
                          "transition-colors outline-none focus:border-white/50 focus:bg-white/[0.09]",
                          status === "error" ? "border-[#f87171]" : "border-white/15",
                        )}
                      />
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className={buttonClass("inverse")}
                      >
                        {status === "loading" ? "Joining..." : "Join waitlist"}
                        <ArrowRight
                          size={15}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>
                    {error && (
                      <p id="email-error" className="mt-2 text-[13px] text-[#fca5a5]">
                        {error}
                      </p>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div aria-hidden className="relative hidden min-h-[360px] [perspective:1400px] lg:block">
            <div className="absolute top-14 -right-24 w-[620px] origin-top-left [transform:rotateX(38deg)_rotateZ(-14deg)_rotateY(8deg)] rounded-[12px] bg-surface opacity-90 [mask-image:linear-gradient(to_bottom,black_30%,transparent)]">
              <CompetitorTable interactive={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
