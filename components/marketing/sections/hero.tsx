import { Reveal } from "@/components/marketing/effects/reveal";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { AppFrame } from "@/components/product/app-frame";
import { EngineIcon } from "@/components/product/engine-icon";
import { Mark } from "@/components/ui/mark";
import type { Engine } from "@/lib/data";

const tracked: Engine[] = ["chatgpt", "perplexity", "gemini", "google"];

export function Hero() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-14 md:px-8 md:pt-20">
      <div className="mx-auto flex max-w-[860px] flex-col items-center text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pr-3.5 pl-1 text-[13px] text-ink-2 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
            <span className="flex -space-x-1">
              {tracked.map((e) => (
                <span key={e} className="grid size-6 place-items-center rounded-full border-2 border-surface bg-mark-soft">
                  <EngineIcon engine={e} size={11} />
                </span>
              ))}
            </span>
            Private beta for ChatGPT, Perplexity, Gemini and Google AI
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-7 font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] text-balance sm:text-[52px] md:text-[68px]">
            See how AI <Mark delay={0.45}>recommends you,</Mark> and who it picks instead
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-muted md:text-[18px]">
            Track your mentions, recommendations, and share of voice across AI search, then learn exactly what to fix.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 w-full max-w-[460px] text-left">
          <WaitlistForm />
        </Reveal>
      </div>

      {/* Neutral frame that fades out; the dashboard itself stays colorless apart from data. */}
      <Reveal delay={0.2} y={28} className="mt-10 md:mt-14">
        <div className="rounded-[30px] bg-[linear-gradient(180deg,#ececea_0%,rgb(236_236_234/0.4)_45%,transparent_100%)] p-2 md:p-3">
          <AppFrame />
        </div>
      </Reveal>
    </section>
  );
}
