"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

/** Fade + short rise when the element first enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 12,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      // "some": start as soon as any part shows, so a tall block peeking in at the fold is never left blank.
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
