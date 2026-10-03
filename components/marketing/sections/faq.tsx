"use client";

import { Plus } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { faqs } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

export function Faq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" innerClassName="py-20 md:py-28">
      <SectionHeading className="text-center" title="Questions" />
      <ul className="mx-auto mt-12 max-w-[760px]">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q} className="border-b border-line-strong">
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 py-5 text-left text-[16px] font-medium text-ink transition-colors hover:text-ink-2 md:text-[17px]"
                >
                  {item.q}
                  <Plus
                    size={16}
                    className={cx(
                      "ml-auto shrink-0 text-muted transition-transform duration-300",
                      isOpen && "rotate-45 text-ink",
                    )}
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[640px] pb-6 text-[15px] leading-relaxed text-muted">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
