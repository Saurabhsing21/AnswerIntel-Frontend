"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import { Mark } from "@/components/ui/mark";
import { sweeps, you, type EngineResult } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

const engines = ["chatgpt", "perplexity", "gemini", "google"] as const;
const TYPE_MS = 32;
const SCAN_MS = 650;
const HOLD_MS = 3800;

/** Splits a snippet so every brand-name occurrence gets the highlighter. */
function Snippet({ text, show }: { text: string; show: boolean }) {
  const parts = text.split(you.name);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <Mark inView={false} active={show} delay={0.15} className="font-medium text-ink">
              {you.name}
            </Mark>
          )}
        </Fragment>
      ))}
    </>
  );
}

function Verdict({ r }: { r: EngineResult }) {
  if (!r.mentioned) {
    return <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-muted">Not mentioned</span>;
  }
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cx(
          "rounded-full px-2 py-0.5 text-[11px] font-medium",
          r.recommended ? "bg-ink text-white" : "bg-mark-soft text-ink",
        )}
      >
        {r.recommended ? "Recommended" : "Mentioned"}
      </span>
      <span className="font-mono text-[11px] text-ink">#{r.position}</span>
    </span>
  );
}

/**
 * Hero visual: a buyer question is typed in, then each AI engine is scanned in
 * turn and resolves to what it said about you. Cycles through sample prompts.
 */
export function EngineSweep() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [index, setIndex] = useState(0);
  const [typedRaw, setTyped] = useState(0);
  const [resolvedRaw, setResolved] = useState(0);

  const sweep = sweeps[index];
  // Never pauses on hover: it keeps playing while on screen.
  const running = inView && !reduce;
  // Reduced motion: show the first prompt fully resolved, no typing or cycling.
  const typed = reduce ? sweep.prompt.length : typedRaw;
  const resolved = reduce ? engines.length : resolvedRaw;

  // One timeline: type the prompt, resolve engines one by one, hold, next prompt.
  useEffect(() => {
    if (!running) return;
    let t: ReturnType<typeof setTimeout>;
    if (typed < sweep.prompt.length) {
      t = setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
    } else if (resolved < engines.length) {
      t = setTimeout(() => setResolved((n) => n + 1), resolved === 0 ? 350 : SCAN_MS);
    } else {
      t = setTimeout(() => {
        setIndex((i) => (i + 1) % sweeps.length);
        setTyped(0);
        setResolved(0);
      }, HOLD_MS);
    }
    return () => clearTimeout(t);
  }, [running, typed, resolved, sweep.prompt.length]);

  const done = resolved === engines.length;
  const results = engines.map((e) => sweep.results[e]);
  const mentionedCount = results.filter((r) => r.mentioned).length;
  const recommendedCount = results.filter((r) => r.recommended).length;

  return (
    <div
      ref={ref}
      className="relative rounded-card border border-line-strong bg-surface p-3 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.25)] md:p-4"
    >
      <div className="flex items-center gap-2.5 rounded-full border border-line-strong bg-page px-4 py-3 text-[14px]">
        <MagnifyingGlass size={16} className="shrink-0 text-muted" />
        <span className="min-w-0 truncate text-ink" aria-live="polite">
          {sweep.prompt.slice(0, typed)}
          {typed < sweep.prompt.length && (
            <span aria-hidden className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-ink" />
          )}
        </span>
        <span className="ml-auto shrink-0 rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted shadow-[0_0_0_1px_rgb(0_0_0/0.06)]">
          4 engines
        </span>
      </div>

      <ul className="mt-3 divide-y divide-line">
        {engines.map((engine, i) => {
          const r = sweep.results[engine];
          const state = i < resolved ? "done" : i === resolved && typed === sweep.prompt.length ? "scanning" : "waiting";
          return (
            <li key={engine} className="grid grid-cols-[auto_1fr] gap-x-3 px-2 py-3.5">
              <span
                className={cx(
                  "grid size-9 place-items-center rounded-full border border-line transition-opacity duration-300",
                  state === "waiting" && "opacity-40",
                )}
              >
                <EngineIcon engine={engine} size={16} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cx("text-[13px] font-medium transition-colors", state === "waiting" ? "text-faint" : "text-ink")}>
                    {engineNames[engine]}
                  </span>
                  <span className="ml-auto">
                    <AnimatePresence mode="wait" initial={false}>
                      {state === "done" ? (
                        <motion.span
                          key={`v-${index}`}
                          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, ease }}
                          className="block"
                        >
                          <Verdict r={r} />
                        </motion.span>
                      ) : state === "scanning" ? (
                        <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-muted">
                          Reading answer...
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </span>
                </div>
                <div className="mt-1 h-[20px] text-[13px] leading-[20px] text-muted">
                  {state === "done" ? (
                    <motion.p
                      key={`p-${index}`}
                      initial={reduce ? false : { opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="truncate"
                    >
                      <Snippet text={r.snippet} show />
                    </motion.p>
                  ) : (
                    <span
                      aria-hidden
                      className={cx(
                        "block h-2.5 translate-y-[5px] rounded-full bg-[length:200%_100%] bg-[linear-gradient(90deg,#f0f0ee_25%,#e4e4e2_50%,#f0f0ee_75%)]",
                        state === "scanning" ? "w-4/5 motion-safe:animate-shimmer" : "w-3/5",
                      )}
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-1 flex items-center gap-3 rounded-[14px] bg-page px-4 py-3">
        <span className="flex gap-1" aria-hidden>
          {results.map((r, i) => (
            <span
              key={i}
              className={cx(
                "h-2 w-6 rounded-full transition-colors duration-500",
                i >= resolved ? "bg-[#e4e4e2]" : r.recommended ? "bg-ink" : r.mentioned ? "bg-mark" : "bg-[#d4d4d4]",
              )}
            />
          ))}
        </span>
        <span className="text-[13px] text-ink-2">
          {done ? (
            <>
              {you.name} appears in <strong className="font-semibold text-ink">{mentionedCount} of 4</strong> engines,
              recommended by <strong className="font-semibold text-ink">{recommendedCount}</strong>.
            </>
          ) : (
            "Scanning AI answers..."
          )}
        </span>
      </div>
    </div>
  );
}
