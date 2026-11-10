"use client";

import { Check, MagnifyingGlass, Minus } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { EngineIcon } from "@/components/product/engine-icon";
import type { Engine } from "@/lib/data";

// Three.js only loads on wide screens, after the page itself has rendered.
const LensMascot = dynamic(() => import("./lens-mascot"), { ssr: false });

const verdicts: { engine: Engine; name: string; label: string; good: boolean; className: string }[] = [
  { engine: "chatgpt", name: "ChatGPT", label: "Recommended", good: true, className: "top-[300px] right-[40px]" },
  { engine: "perplexity", name: "Perplexity", label: "Mentioned", good: true, className: "top-[390px] right-[0px]" },
  { engine: "gemini", name: "Gemini", label: "Not named", good: false, className: "top-[480px] right-[60px]" },
];

function Floating({ children, className, delay = 0 }: { children: React.ReactNode; className: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -6, 0] }}
      transition={reduce ? undefined : { opacity: { duration: 0.5, delay }, y: { duration: 5, delay, repeat: Infinity, ease: "easeInOut" } }}
    >
      {children}
    </motion.div>
  );
}

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1400px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

/** Decoration on both sides of the hero: the mascot with the verdicts AI engines gave, and the buyer question it asked. */
export function HeroMascot() {
  const wide = useWide();
  const reduce = useReducedMotion();
  if (!wide) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -mx-24">
      {/* left: the buyer question and the source AI cited */}
      <Floating className="top-[120px] left-0 rotate-[-4deg]" delay={0.3}>
        <div className="w-[230px] rounded-[16px] border border-line-strong bg-surface p-4 shadow-[0_20px_40px_-24px_rgb(0_0_0/0.3)]">
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <MagnifyingGlass size={12} weight="bold" /> Buyer question
          </p>
          <p className="mt-2 text-[14px] leading-snug text-ink">&ldquo;Best CRM for a 5-person agency?&rdquo;</p>
        </div>
      </Floating>
      <Floating className="top-[300px] left-[40px] rotate-[3deg]" delay={0.6}>
        <div className="rounded-full border border-line-strong bg-surface px-3.5 py-2 text-[13px] text-ink-2 shadow-[0_16px_30px_-20px_rgb(0_0_0/0.3)]">
          Cited source <span className="font-mono text-ink">g2.com</span>
        </div>
      </Floating>

      {/* right: the mascot and three verdicts */}
      <div className="absolute top-[10px] right-[0px] h-[300px] w-[270px]">
        <LensMascot still={Boolean(reduce)} />
      </div>
      <svg className="absolute top-[270px] right-[20px] h-[260px] w-[220px]" viewBox="0 0 220 260" fill="none">
        <path d="M140 0 C 60 50, 220 110, 140 150 S 80 230, 170 260" stroke="rgb(0 0 0 / 0.18)" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>
      {verdicts.map((v, i) => (
        <Floating key={v.engine} className={v.className} delay={0.4 + i * 0.2}>
          <div className="flex items-center gap-2 rounded-[14px] border border-line-strong bg-surface py-2 pr-3 pl-2.5 shadow-[0_16px_30px_-20px_rgb(0_0_0/0.35)]">
            <span className="grid size-7 place-items-center rounded-full bg-sunken">
              <EngineIcon engine={v.engine} size={14} />
            </span>
            <span className="text-[14px] font-medium text-ink">{v.name}</span>
            <span
              className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${v.good ? "bg-mark-soft text-ink" : "bg-sunken text-muted"}`}
            >
              {v.good ? <Check size={11} weight="bold" /> : <Minus size={11} weight="bold" />}
              {v.label}
            </span>
          </div>
        </Floating>
      ))}
    </div>
  );
}
