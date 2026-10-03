"use client";

import {
  CaretDown,
  Eye,
  Flask,
  Lightbulb,
  Link,
  List,
  Users,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

const product = [
  { icon: Eye, title: "AI visibility", body: "Mentions, recommendations, and position", href: "#signals" },
  { icon: Users, title: "Competitor intelligence", body: "Why AI picks them over you", href: "#competitors" },
  { icon: Link, title: "Source analysis", body: "The sites AI cites in your category", href: "#how-it-works" },
  { icon: Lightbulb, title: "Opportunities", body: "Gaps turned into a to-do list", href: "#gaps" },
  { icon: Flask, title: "Experiments", body: "Prove a change moved the numbers", href: "#experiments" },
];

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover intent: small delay so the menu doesn't flash when the pointer passes over.
  function show() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 90);
  }
  function hide() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 140);
  }

  return (
    <header className="sticky top-3 z-40 px-3 md:top-4">
      <div className="relative mx-auto flex h-14 max-w-[1100px] items-center rounded-full border border-line-strong bg-surface/80 pr-2 pl-5 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)] backdrop-blur-md">
        <a href="#top" aria-label="AnswerIntel home" className="rounded-[6px]">
          <Logo />
        </a>

        <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 md:block">
          <ul className="flex items-center gap-1 text-[14px]">
            <li className="relative" onPointerEnter={show} onPointerLeave={hide}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls="product-menu"
                onClick={() => setOpen((o) => !o)}
                onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                className={cx(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition-colors",
                  open ? "bg-black/[0.05] text-ink" : "text-muted hover:bg-black/[0.04] hover:text-ink",
                )}
              >
                Product
                <CaretDown
                  size={11}
                  weight="bold"
                  className={cx("transition-transform duration-200", open && "rotate-180")}
                />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    id="product-menu"
                    initial={reduce ? false : { opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease }}
                    style={{ transformOrigin: "top center" }}
                    className="absolute top-full left-1/2 mt-2 w-[640px] -translate-x-1/2 overflow-hidden rounded-card border border-line-strong bg-surface shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]"
                  >
                    <div className="grid grid-cols-[1fr_240px]">
                      <ul className="p-2">
                        {product.map(({ icon: Icon, title, body, href }, i) => (
                          <motion.li
                            key={title}
                            initial={reduce ? false : { opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.03 * i, ease }}
                          >
                            <a
                              href={href}
                              onClick={() => setOpen(false)}
                              className="group flex items-start gap-3 rounded-[10px] p-2.5 transition-colors hover:bg-sunken"
                            >
                              <span className="mt-0.5 grid size-7 place-items-center rounded-[7px] border border-line-strong bg-surface text-ink-2 transition-colors group-hover:text-ink">
                                <Icon size={15} />
                              </span>
                              <span>
                                <span className="block text-[14px] font-medium text-ink">{title}</span>
                                <span className="block text-[13px] text-muted">{body}</span>
                              </span>
                            </a>
                          </motion.li>
                        ))}
                      </ul>
                      <a
                        href="#waitlist"
                        onClick={() => setOpen(false)}
                        className="group m-2 flex flex-col rounded-[10px] bg-sunken p-4 transition-colors hover:bg-[#ececec]"
                      >
                        <span className="text-[12px] text-muted">Every Monday</span>
                        <span className="mt-1 text-[14px] font-medium text-ink">Weekly founder report</span>
                        <span className="mt-1 text-[13px] leading-snug text-muted">
                          Wins, losses, and the three things to fix this week.
                        </span>
                        <span className="mt-auto flex items-end gap-1 pt-6" aria-hidden>
                          {[38, 52, 44, 61, 58, 74, 82].map((h, i) => (
                            <span
                              key={i}
                              className={cx(
                                "w-full rounded-[3px] transition-[height] duration-300",
                                i === 6 ? "bg-ink" : "bg-[#d4d4d4] group-hover:bg-[#bdbdbd]",
                              )}
                              style={{ height: h * 0.5 }}
                            />
                          ))}
                        </span>
                      </a>
                    </div>
                    <div className="flex items-center justify-between border-t border-line bg-[#fbfbfb] px-4 py-2.5 text-[13px]">
                      <span className="text-muted">Launching to the waitlist first</span>
                      <a href="#waitlist" onClick={() => setOpen(false)} className="font-medium text-ink hover:underline">
                        Join waitlist
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a href="#waitlist" className={cx(buttonClass("primary", "sm"), "hidden sm:inline-flex")}>
            Join waitlist
          </a>
          <button
            type="button"
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            onClick={() => setMobile((m) => !m)}
            className="grid size-9 place-items-center rounded-full border border-line-strong bg-surface md:hidden"
          >
            {mobile ? <X size={16} /> : <List size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.nav
            aria-label="Mobile"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="mx-auto mt-2 max-w-[1100px] overflow-hidden rounded-[20px] border border-line-strong bg-surface md:hidden"
          >
            <ul className="space-y-1 px-5 py-3">
              {[...product.slice(0, 3).map((p) => ({ label: p.title, href: p.href })), ...links].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setMobile(false)}
                    className="block rounded-[12px] px-2 py-2 text-[15px] text-ink hover:bg-black/[0.04]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a href="#waitlist" onClick={() => setMobile(false)} className={cx(buttonClass(), "w-full")}>
                  Join waitlist
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
