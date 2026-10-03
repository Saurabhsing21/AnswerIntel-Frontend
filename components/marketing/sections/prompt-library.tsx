"use client";

import { CaretDown, MagnifyingGlass, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Fragment, useMemo, useState } from "react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import { Mark } from "@/components/ui/mark";
import { promptLibrary, you, type Engine } from "@/lib/data";
import { cx } from "@/lib/cx";
import { ease } from "@/lib/motion";

const engines: Engine[] = ["chatgpt", "perplexity", "gemini", "google"];
const ALL = "All";

type Status = { state: "recommended" | "mentioned" | "absent"; position: number | null };

// Derived per-engine result: the first engine that sees you recommends you.
function statusFor(seenOn: Engine[], engine: Engine): Status {
  const i = seenOn.indexOf(engine);
  if (i === -1) return { state: "absent", position: null };
  return { state: i === 0 && seenOn.length > 1 ? "recommended" : "mentioned", position: i + 2 };
}

function snippetFor(seenOn: Engine[]) {
  if (seenOn.length === 0) return "Kiteline and Vantor are the usual picks here; Norrow is a budget option.";
  if (seenOn.length > 1) return `For most small teams, ${you.name} is a strong fit thanks to its fast setup.`;
  return `Options include Kiteline, Vantor, and ${you.name}, depending on budget.`;
}

function Cell({ engine, status }: { engine: Engine; status: Status }) {
  const label =
    status.state === "absent"
      ? "Not mentioned"
      : `${status.state === "recommended" ? "Recommended" : "Mentioned"} #${status.position}`;
  return (
    <span className="group/cell relative grid place-items-center">
      <span
        tabIndex={0}
        aria-label={`${engineNames[engine]}: ${label}`}
        className={cx(
          "grid size-7 place-items-center rounded-[8px] outline-none transition-transform duration-150 group-hover/cell:scale-110 focus-visible:scale-110",
          status.state === "recommended" && "bg-ink text-white",
          status.state === "mentioned" && "bg-mark text-ink",
          status.state === "absent" && "bg-sunken text-faint",
        )}
      >
        <span className={cx(status.state === "absent" && "opacity-40 grayscale")}>
          <EngineIcon engine={engine} size={12} mono={status.state === "recommended"} />
        </span>
      </span>
      <span className="pointer-events-none absolute bottom-full z-20 mb-2 rounded-[8px] bg-night px-2.5 py-1.5 text-[11px] whitespace-nowrap text-white opacity-0 shadow-lg transition-[opacity,transform] duration-150 group-hover/cell:-translate-y-0.5 group-hover/cell:opacity-100 group-focus-within/cell:opacity-100">
        <span className="text-white/60">{engineNames[engine]}</span> {label}
      </span>
    </span>
  );
}

export function PromptLibrary() {
  const reduce = useReducedMotion();
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promptLibrary
      .filter((g) => category === ALL || g.category === category)
      .flatMap((g) => g.prompts.map((p) => ({ ...p, category: g.category })))
      .filter((p) => !q || p.text.toLowerCase().includes(q));
  }, [category, query]);

  const counts: Record<string, number> = { [ALL]: promptLibrary.reduce((n, g) => n + g.prompts.length, 0) };
  promptLibrary.forEach((g) => (counts[g.category] = g.prompts.length));
  const tabs = [ALL, ...promptLibrary.map((g) => g.category)];
  const openKey = open ?? rows[0]?.text ?? null;

  return (
    <Section id="prompts">
      <SectionHeading
        className="max-w-[720px]"
        title={
          <>
            The questions your buyers <Mark>actually ask</Mark>
          </>
        }
        muted="We generate 30 to 50 prompts across every way buyers search, then track where each engine puts you."
      />

      <div className="mt-12 overflow-hidden rounded-card border border-line-strong bg-surface shadow-[0_24px_60px_-30px_rgb(0_0_0/0.2)]">
        <div className="flex flex-col gap-3 border-b border-line p-3 md:flex-row md:items-center">
          <label className="flex h-10 items-center gap-2 rounded-full border border-line-strong bg-page px-3.5 transition-colors focus-within:border-ink md:w-[280px]">
            <MagnifyingGlass size={15} className="shrink-0 text-muted" />
            <span className="sr-only">Search prompts</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="grid size-5 place-items-center rounded-full bg-sunken text-muted hover:text-ink">
                <X size={10} weight="bold" />
              </button>
            )}
          </label>
          <div role="tablist" aria-label="Category" className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={category === t}
                onClick={() => {
                  setCategory(t);
                  setOpen(null);
                }}
                className={cx("relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors", category === t ? "text-white" : "text-ink-2 hover:text-ink")}
              >
                {category === t && (
                  <motion.span layoutId="prompt-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">{t}</span>
                <span className={cx("relative font-mono text-[11px]", category === t ? "text-white/60" : "text-faint")}>{counts[t]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden grid-cols-[1fr_120px_172px_88px] gap-4 border-b border-line px-5 py-2.5 text-[11px] text-muted md:grid">
          <span>Prompt</span>
          <span>Intent</span>
          <span className="flex justify-around">
            {engines.map((e) => (
              <span key={e} title={engineNames[e]} className="grid w-7 place-items-center text-faint">
                <EngineIcon engine={e} size={12} mono />
              </span>
            ))}
          </span>
          <span className="text-right">Visibility</span>
        </div>

        <div className="max-h-[520px] min-h-[420px] overflow-y-auto">
          {rows.length === 0 ? (
            <div className="grid min-h-[420px] place-items-center px-6 text-center">
              <div>
                <p className="text-[15px] font-medium text-ink">No prompts match &quot;{query}&quot;</p>
                <p className="mt-1 text-[13px] text-muted">Try &quot;alternative&quot;, &quot;startup&quot;, or clear the search.</p>
              </div>
            </div>
          ) : (
            <motion.ul layout={!reduce} className="divide-y divide-line">
              <AnimatePresence initial={false}>
                {rows.map((p) => {
                  const isOpen = openKey === p.text;
                  const seen = p.seenOn.length;
                  return (
                    <motion.li
                      key={p.text}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease }}
                    >
                      <div
                        onClick={() => setOpen(isOpen ? "" : p.text)}
                        className={cx("grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 text-left transition-colors md:grid-cols-[1fr_120px_172px_88px]", isOpen ? "bg-[#fbfbfa]" : "hover:bg-[#fbfbfa]")}
                      >
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(isOpen ? "" : p.text);
                          }}
                          className="flex min-w-0 items-center gap-2.5 rounded-[6px] text-left"
                          >
                          <CaretDown size={12} className={cx("shrink-0 text-faint transition-transform duration-200", isOpen && "rotate-180 text-ink")} />
                          <span className="truncate text-[14px] text-ink">{p.text}</span>
                        </button>
                        <span className="hidden md:block">
                          <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{p.intent}</span>
                        </span>
                        <span className="hidden justify-around md:flex" onClick={(e) => e.stopPropagation()}>
                          {engines.map((e) => (
                            <Cell key={e} engine={e} status={statusFor(p.seenOn, e)} />
                          ))}
                        </span>
                        <span className={cx("text-right font-mono text-[12px]", seen === 0 ? "text-[#b42318]" : "text-ink")}>
                          {seen === 0 ? "Invisible" : `${seen}/4`}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease }}
                            className="overflow-hidden bg-[#fbfbfa]"
                          >
                            <div className="grid gap-3 px-5 pb-4 pl-[42px] md:grid-cols-[1fr_auto] md:items-end">
                              <div className="rounded-[12px] border border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-2">
                                <span className="mb-1 flex items-center gap-1.5 text-[11px] text-muted">
                                  <EngineIcon engine={p.seenOn[0] ?? "chatgpt"} size={12} />
                                  {engineNames[p.seenOn[0] ?? "chatgpt"]} answer, {p.category.toLowerCase()} prompt
                                </span>
                                {snippetFor(p.seenOn)
                                  .split(you.name)
                                  .map((part, i, arr) => (
                                    <Fragment key={i}>
                                      {part}
                                      {i < arr.length - 1 && <span className="rounded-[3px] bg-mark px-0.5 font-medium text-ink">{you.name}</span>}
                                    </Fragment>
                                  ))}
                              </div>
                              <span className="flex gap-1.5 md:hidden">
                                {engines.map((e) => (
                                  <Cell key={e} engine={e} status={statusFor(p.seenOn, e)} />
                                ))}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-3 text-[12px] text-muted">
          <span>
            Showing <span className="font-mono text-ink">{rows.length}</span> of {counts[ALL]} sample prompts
          </span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-ink" /> Recommended</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-mark" /> Mentioned</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-sunken" /> Not mentioned</span>
        </div>
      </div>
    </Section>
  );
}
