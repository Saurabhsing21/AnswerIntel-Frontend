"use client";

import { motion, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

/**
 * The AnswerIntel highlighter: a lime stroke drawn behind text, left to right.
 * Used for headline emphasis and to mark your brand inside AI answers.
 */
export function Mark({
  children,
  delay = 0.2,
  inView = true,
  active = true,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  /** Draw when scrolled into view (headlines) vs. immediately (UI). */
  inView?: boolean;
  /** Controlled highlight for interactive UI. */
  active?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const drawn = { scaleX: active ? 1 : 0 };
  return (
    <span className={cx("relative inline-block whitespace-nowrap", className)}>
      <motion.span
        aria-hidden
        className="absolute inset-x-[-0.12em] top-[0.18em] bottom-[0.06em] -z-0 origin-left -rotate-[0.8deg] rounded-[0.18em] bg-mark"
        initial={reduce ? false : { scaleX: 0 }}
        {...(inView ? { whileInView: drawn, viewport: { once: true } } : { animate: drawn })}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}
