"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { EngineIcon } from "@/components/product/engine-icon";
import { promptLibrary, type Engine } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

const engines: Engine[] = ["chatgpt", "perplexity", "gemini", "google"];

export function PromptLibrary() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(promptLibrary.length - 1);
  const group = promptLibrary[active];

  return (
    <Section id="prompts">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <SectionHeading
            title="The questions your buyers actually ask"
            muted="We generate 30 to 50 prompts across every way a buyer searches, then track which ones you show up in."
          />
          <div role="tablist" aria-label="Prompt category" className="mt-8 flex flex-wrap gap-2">
            {promptLibrary.map((g, i) => (
              <button
                key={g.category}
                role="tab"
                type="button"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={cx(
                  "rounded-full border px-3.5 py-1.5 text-[14px] transition-colors",
                  i === active ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-ink-2 hover:border-[rgb(0_0_0/0.25)]",
                )}
              >
                {g.category}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[388px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={group.category}
              initial={reduce ? false : "hidden"}
              animate="shown"
              exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
              variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {group.prompts.map((p) => {
                const found = p.seenOn.length;
                return (
                  <motion.li
                    key={p.text}
                    variants={{ hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.35, ease }}
                    className="flex min-h-[188px] flex-col rounded-card border border-line-strong bg-surface p-5 transition-shadow duration-300 hover:shadow-[0_16px_40px_-20px_rgb(0_0_0/0.2)]"
                  >
                    <span className="self-start rounded-full bg-sunken px-2.5 py-0.5 text-[11px] text-muted">{p.intent}</span>
                    <p className="mt-3 font-display text-[19px] leading-snug tracking-[-0.02em] text-ink">{p.text}</p>
                    <div className="mt-auto flex items-center gap-2 pt-5">
                      <span className="flex gap-1">
                        {engines.map((e) => (
                          <span
                            key={e}
                            title={`${p.seenOn.includes(e) ? "Mentioned" : "Not mentioned"} on this engine`}
                            className={cx(
                              "grid size-6 place-items-center rounded-full transition-opacity",
                              p.seenOn.includes(e) ? "bg-mark-soft" : "bg-sunken opacity-40 grayscale",
                            )}
                          >
                            <EngineIcon engine={e} size={12} />
                          </span>
                        ))}
                      </span>
                      <span className={cx("ml-auto text-[12px]", found === 0 ? "text-down" : "text-muted")}>
                        {found === 0 ? "You're invisible here" : `Seen on ${found} of 4`}
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
