import { ChatCircle, Eye, Target } from "@phosphor-icons/react/ssr";
import { DotBand } from "@/components/marketing/effects/dot-band";
import { Reveal } from "@/components/marketing/effects/reveal";
import { AppFrame } from "@/components/product/app-frame";
import { ButtonGlyph, ButtonLink } from "@/components/ui/button";

function MetricChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex translate-y-[-1px] items-center gap-1 rounded-[7px] border border-line-strong bg-surface px-1.5 py-0.5 align-middle text-[15px] text-ink shadow-[0_1px_1px_rgb(0_0_0/0.03)] md:text-base">
      {icon}
      {children}
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1200px] border-x border-line px-5 pt-16 md:px-10 md:pt-20 pb-14 md:pb-16">
        <Reveal className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1 text-[13px] text-ink shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-[#e5484d] motion-safe:animate-ping-soft" />
              <span className="relative size-2 rounded-full bg-[#e5484d]" />
            </span>
            Private beta opening soon
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mx-auto mt-6 max-w-[880px] text-balance text-center text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] md:text-[68px]">
            See how AI recommends you
            <span className="block text-muted">and who it picks instead</span>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-[620px] text-center text-[16px] leading-[1.75] text-muted md:text-[18px]">
            Measure your
            <MetricChip icon={<Eye size={14} />}>Mentions</MetricChip>,
            <MetricChip icon={<Target size={14} />}>Recommendations</MetricChip>
            and
            <MetricChip icon={<ChatCircle size={14} />}>Share of voice</MetricChip>
            across AI search, then learn exactly what to fix.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="#how-it-works" variant="secondary">
            <ButtonGlyph />
            See how it works
          </ButtonLink>
          <ButtonLink href="#waitlist">Join waitlist</ButtonLink>
        </Reveal>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-[1200px] border-x border-line">
          <DotBand className="h-20" />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] border-x border-line px-2 pb-16 md:px-3 md:pb-24">
        <Reveal delay={0.2} y={24}>
          <AppFrame />
        </Reveal>
      </div>
    </section>
  );
}
