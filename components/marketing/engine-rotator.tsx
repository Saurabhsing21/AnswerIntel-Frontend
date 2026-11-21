"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EngineIcon } from "@/components/product/engine-icon";
import type { Engine } from "@/lib/data";
import { ease } from "@/lib/motion";

// The engines Seenlense scans, best known first. One logo shows at a time in the hero headline.
export const ROTATING_ENGINES: Engine[] = ["claude", "gemini", "chatgpt", "perplexity", "deepseek", "llama", "mistral"];

/**
 * Swaps the engine logo every few seconds, in a square the size of the headline's letters so the line never reflows.
 * Screen readers and crawlers get the engine names from the h1 instead.
 */
export function EngineRotator() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ROTATING_ENGINES.length), 2200);
    return () => clearInterval(timer);
  }, [reduce]);

  const engine = ROTATING_ENGINES[index];
  return (
    <span aria-hidden className="-my-[0.12em] inline-grid size-[1.3em] overflow-hidden align-[-0.3em]">
      <AnimatePresence initial={false}>
        <motion.span
          key={engine}
          className="grid place-items-center [grid-area:1/1] [&>svg]:size-[1.2em]"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <EngineIcon engine={engine} size={64} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
