import { ArrowDownRight, ArrowUpRight, Envelope } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/marketing/effects/reveal";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Mark } from "@/components/ui/mark";

const actions = [
  "Publish a CRM for startups comparison page",
  "Rewrite homepage positioning for small teams",
  "Pitch 3 startup tool roundups that cite Kiteline",
];

/** Preview of the weekly founder report (PRD: weekly report). Sample content. */
function ReportPreview() {
  return (
    <div className="rotate-[1.5deg] rounded-card border border-line-strong bg-surface p-5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.3)] transition-transform duration-500 ease-out hover:rotate-0 md:p-6">
      <div className="flex items-center gap-2 border-b border-line pb-4 text-[12px] text-muted">
        <Envelope size={14} />
        Monday, 8:00
        <span className="ml-auto rounded-full border border-dashed border-line-strong px-2 py-0.5">Sample</span>
      </div>
      <p className="mt-4 font-display text-[20px] font-semibold tracking-[-0.02em]">Your AI visibility this week</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
        <div className="rounded-[14px] bg-mark-soft p-3">
          <p className="flex items-center gap-1 text-[12px] text-ink-2">
            <ArrowUpRight size={12} weight="bold" /> Biggest win
          </p>
          <p className="mt-1 leading-snug text-ink">Now recommended for &quot;CRM for early-stage startups&quot;</p>
        </div>
        <div className="rounded-[14px] bg-sunken p-3">
          <p className="flex items-center gap-1 text-[12px] text-ink-2">
            <ArrowDownRight size={12} weight="bold" /> Biggest loss
          </p>
          <p className="mt-1 leading-snug text-ink">Kiteline took &quot;simple CRM for small teams&quot;</p>
        </div>
      </div>
      <p className="mt-5 text-[12px] text-muted">Do this week</p>
      <ol className="mt-2 space-y-2 text-[13px] text-ink">
        {actions.map((a, i) => (
          <li key={a} className="flex gap-2.5">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink font-mono text-[10px] text-white">
              {i + 1}
            </span>
            {a}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function WaitlistCta() {
  return (
    <section id="waitlist" className="border-t border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-6 md:border-x md:border-line md:px-8 md:py-8">
      <div className="grid items-center gap-12 overflow-hidden rounded-[32px] border border-line-strong bg-surface px-6 py-14 md:px-14 md:py-20 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <h2 className="font-display text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] text-balance md:text-[54px]">
            Get your first <Mark delay={0.4}>AI visibility</Mark> report
          </h2>
          <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-muted">
            We are opening access in small groups. Join the waitlist and your first scan is on us.
          </p>
          <WaitlistForm className="mt-8" />
        </Reveal>
        <Reveal delay={0.1} y={24}>
          <ReportPreview />
        </Reveal>
      </div>
      </div>
    </section>
  );
}
