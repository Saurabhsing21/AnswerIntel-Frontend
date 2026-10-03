import { Reveal } from "@/components/marketing/effects/reveal";
import { EngineSweep } from "@/components/marketing/engine-sweep";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { EngineIcon } from "@/components/product/engine-icon";
import { Mark } from "@/components/ui/mark";
import type { Engine } from "@/lib/data";

const tracked: Engine[] = ["chatgpt", "perplexity", "gemini", "google"];

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pt-14 pb-16 md:px-8 md:pt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-20">
      <div className="min-w-0">
        <Reveal>
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <span className="flex -space-x-1">
              {tracked.map((e) => (
                <span key={e} className="grid size-6 place-items-center rounded-full border-2 border-page bg-surface">
                  <EngineIcon engine={e} size={12} />
                </span>
              ))}
            </span>
            Tracks ChatGPT, Perplexity, Gemini and Google AI
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-6 font-display text-[38px] font-semibold leading-[1] sm:text-[44px] sm:leading-[0.98] tracking-[-0.045em] text-balance md:text-[64px]">
            When buyers ask AI, does it <Mark delay={0.5}>recommend you?</Mark>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-muted md:text-[18px]">
            AnswerIntel asks AI the questions your buyers ask, then shows where you win, where you lose, and why.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-8">
          <WaitlistForm />
        </Reveal>
      </div>

      <Reveal delay={0.2} y={20} className="min-w-0">
        <EngineSweep />
      </Reveal>
    </section>
  );
}
