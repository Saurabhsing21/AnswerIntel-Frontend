import { Check } from "@phosphor-icons/react/ssr";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { WAITLIST_ONLY } from "@/lib/flags";
import { appHref } from "@/lib/urls";

const href = WAITLIST_ONLY ? "/#waitlist" : appHref("/register");
const label = WAITLIST_ONLY ? "Join waitlist" : "Run a free scan";
const points = ["Asks ChatGPT, Perplexity and Gemini your buyers' questions", "Shows who they recommend instead of you", "Turns the gaps into a weekly fix list"];

/** In the middle of the article: a soft lime card, so it reads as part of the page rather than an ad. */
export function InlineCta() {
  return (
    <aside className="my-12 rounded-card border border-mark-strong/40 bg-mark-soft p-6 md:p-8">
      <p className="font-display text-[22px] leading-tight font-semibold tracking-[-0.02em] text-ink">
        Find out if ChatGPT recommends you or a competitor
      </p>
      <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
        Seenlense asks the questions your buyers ask and shows which brands each AI names, which sources it trusts and what to fix.
      </p>
      <a href={href} className={`${buttonClass()} mt-5`}>
        {label}
        <ButtonArrow />
      </a>
    </aside>
  );
}

/** Desktop sidebar: stays in view while reading. */
export function SideCta() {
  return (
    <div className="rounded-card border border-line-strong bg-surface p-6 shadow-[0_20px_50px_-30px_rgb(0_0_0/0.25)]">
      <p className="font-display text-[20px] leading-snug font-semibold tracking-[-0.02em]">See who AI recommends in your category</p>
      <ul className="mt-4 space-y-2.5 text-[14px] leading-snug text-ink-2">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-mark-strong" />
            {p}
          </li>
        ))}
      </ul>
      <a href={href} className={`${buttonClass()} mt-6 w-full`}>
        {label}
        <ButtonArrow />
      </a>
      {!WAITLIST_ONLY && <p className="mt-3 text-center text-[13px] text-muted">One free scan, no card needed</p>}
    </div>
  );
}

/** End of the article: the one dark block on the page, so the last ask stands out. */
export function EndCta() {
  return (
    <aside className="relative my-14 overflow-hidden rounded-card bg-night p-8 text-white md:p-10">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-mark/20 blur-3xl" />
      <p className="relative font-display text-[28px] leading-tight font-semibold tracking-[-0.03em] md:text-[34px]">
        Does AI recommend your brand?
      </p>
      <p className="relative mt-3 max-w-[48ch] text-[16px] leading-relaxed text-white/70">
        Run your buyers&apos; questions through ChatGPT, Perplexity and Gemini and see where you stand in a few minutes.
      </p>
      <a
        href={href}
        className="group relative mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-mark pr-4 pl-5 text-[15px] font-medium text-ink transition-transform duration-150 active:scale-[0.98]"
      >
        {label}
        <ButtonArrow />
      </a>
    </aside>
  );
}
