"use client";

import { Plus } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { buttonClass, ButtonArrow } from "@/components/ui/button";
import { faqs } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

export function Faq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" innerClassName="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionHeading title="Questions, answered" muted="Anything else? Join the waitlist and we will walk you through it." />
        <a href="#waitlist" className={cx(buttonClass("secondary"), "mt-8")}>
          Join waitlist
          <ButtonArrow />
        </a>
      </div>

      <ul className="space-y-2">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <li
              key={item.q}
              className={cx(
                "rounded-[18px] border transition-colors duration-300",
                isOpen ? "border-line-strong bg-surface" : "border-transparent bg-sunken/70 hover:bg-sunken",
              )}
            >
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left text-[16px] font-medium text-ink md:px-6 md:py-5"
                >
                  {item.q}
                  <span
                    className={cx(
                      "ml-auto grid size-7 shrink-0 place-items-center rounded-full transition-[background-color,transform] duration-300",
                      isOpen ? "rotate-45 bg-mark" : "bg-surface",
                    )}
                  >
                    <Plus size={14} weight="bold" />
                  </span>
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
                    <p className="max-w-[620px] px-5 pb-5 text-[15px] leading-relaxed text-muted md:px-6 md:pb-6">{item.a}</p>
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
