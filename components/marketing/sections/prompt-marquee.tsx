import { Section, SectionHeading } from "@/components/marketing/section";
import { EngineIcon } from "@/components/product/engine-icon";
import { marqueePrompts } from "@/lib/data";
import { cx } from "@/lib/cx";

export function PromptMarquee() {
  return (
    <Section innerClassName="overflow-hidden px-0 py-20 md:px-0 md:py-28">
      <SectionHeading
        className="mx-auto max-w-[1000px] px-5 text-center"
        title="AI is the new search bar."
        muted="Track the questions your buyers actually ask."
      />
      <div className="mt-12 space-y-3 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        {marqueePrompts.map((row, r) => (
          <div key={r} className="group flex w-max">
            {/* Content is duplicated so the -50% translate loops seamlessly. */}
            <ul
              className={cx(
                "flex shrink-0 gap-3 pr-3 group-hover:[animation-play-state:paused]",
                r % 2 === 0 ? "motion-safe:animate-marquee" : "motion-safe:animate-marquee-rev",
              )}
              style={{ animationDuration: `${55 + r * 8}s` }}
            >
              {[...row, ...row].map((p, i) => (
                <li
                  key={i}
                  aria-hidden={i >= row.length || undefined}
                  className="flex shrink-0 items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] whitespace-nowrap text-ink-2 shadow-[0_1px_2px_rgb(0_0_0/0.03)] transition-colors hover:border-[rgb(0_0_0/0.2)] hover:text-ink"
                >
                  <EngineIcon engine={p.engine} size={14} />
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
