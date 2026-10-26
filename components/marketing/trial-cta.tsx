import { appHref } from "@/lib/urls";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { cx } from "@/lib/cx";

/** The website's main call to action once sign-ups are open (the waitlist form replaces it in launch mode). */
export function TrialCta({ className, centered }: { className?: string; centered?: boolean }) {
  return (
    <div className={cx("flex flex-col gap-3", centered && "items-center", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <a href={appHref("/register")} className={buttonClass("primary")}>
          Run a free scan <ButtonArrow />
        </a>
        <a href="/pricing" className={buttonClass("secondary")}>
          See pricing
        </a>
      </div>
      <p className="text-[13px] text-muted">One free scan of your brand. No card needed.</p>
    </div>
  );
}
