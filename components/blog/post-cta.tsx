import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { WAITLIST_ONLY } from "@/lib/flags";
import { appHref } from "@/lib/urls";

/** The one ask on every post: see what AI says about your own brand. */
export function PostCta() {
  return (
    <aside className="my-12 rounded-card border border-line-strong bg-surface p-6 md:p-8">
      <p className="font-display text-[22px] leading-tight font-semibold tracking-[-0.02em]">
        Does ChatGPT recommend you, or your competitor?
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        SeenLense asks ChatGPT, Perplexity and Gemini the questions your buyers ask and shows who they recommend, which
        sources they trust and what to fix.
      </p>
      <a href={WAITLIST_ONLY ? "/#waitlist" : appHref("/register")} className={`${buttonClass()} mt-5`}>
        {WAITLIST_ONLY ? "Join the waitlist" : "Run a free scan"}
        <ButtonArrow />
      </a>
    </aside>
  );
}
