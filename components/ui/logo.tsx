import { cx } from "@/lib/cx";

/** The SeenLens mark: a lens with a lime highlight at its centre, the thing AI answers either show or miss. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cx("shrink-0", className)}>
      <rect width="32" height="32" rx="9" fill="#171717" />
      <circle cx="14.5" cy="14.5" r="7.2" fill="none" stroke="#fff" strokeWidth="2.6" />
      <path d="M20 20l5.5 5.5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="14.5" cy="14.5" r="3.1" fill="#d7f36b" />
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={size === "lg" ? "size-8" : "size-6"} />
      <span
        className={cx(
          "font-display font-semibold tracking-[-0.03em] text-ink",
          size === "lg" ? "text-[22px]" : "text-[18px]",
        )}
      >
        SeenLens
      </span>
    </span>
  );
}
