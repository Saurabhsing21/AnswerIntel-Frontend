"use client";

import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { PRICING_FAQ } from "@/lib/billing/plans";
import { cx } from "@/lib/cx";

/** Billing questions, styled like the home page FAQ. */
export function PricingFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="space-y-2">
      {PRICING_FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q} className={cx("rounded-[18px] border transition-colors duration-300", isOpen ? "border-line-strong bg-surface" : "border-transparent bg-sunken/70 hover:bg-sunken")}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`pricing-faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left text-[16px] font-medium text-ink md:px-6 md:py-5"
              >
                {item.q}
                <span className={cx("ml-auto grid size-7 shrink-0 place-items-center rounded-full transition-[background-color,transform] duration-300", isOpen ? "rotate-45 bg-mark" : "bg-surface")}>
                  <Plus size={14} weight="bold" />
                </span>
              </button>
            </h3>
            {isOpen && (
              <p id={`pricing-faq-${i}`} className="max-w-[640px] px-5 pb-5 text-[15px] leading-relaxed text-muted md:px-6 md:pb-6">
                {item.a}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
