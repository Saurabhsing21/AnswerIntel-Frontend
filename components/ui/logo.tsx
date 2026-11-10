import { cx } from "@/lib/cx";

/**
 * The SeenLense mark: the mascot's lens on a glossy ink tile. Gradients give it depth; every copy uses the same
 * definitions, so repeated ids on one page are harmless.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cx("shrink-0", className)}>
      <defs>
        <linearGradient id="sl-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#0e0e0e" />
        </linearGradient>
        <linearGradient id="sl-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#a3a3a3" />
        </linearGradient>
        <radialGradient id="sl-iris" cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#f2ffc2" />
          <stop offset="0.55" stopColor="#d7f36b" />
          <stop offset="1" stopColor="#a8c93a" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#sl-tile)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#ffffff" strokeOpacity="0.14" />
      <path d="M20.2 20.2l5.3 5.3" stroke="url(#sl-rim)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="14.5" cy="14.5" r="7.4" fill="none" stroke="url(#sl-rim)" strokeWidth="2.6" />
      <circle cx="14.5" cy="14.5" r="5.6" fill="url(#sl-iris)" />
      <circle cx="14.5" cy="14.5" r="2.3" fill="#111111" />
      <circle cx="15.7" cy="13.3" r="0.9" fill="#ffffff" />
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
        SeenLense
      </span>
    </span>
  );
}
