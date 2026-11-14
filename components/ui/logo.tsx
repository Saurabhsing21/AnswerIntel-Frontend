import { cx } from "@/lib/cx";

/** The Seenlense mark: the mascot's head, a lime bot with a dark visor and a lens on its antenna. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cx("shrink-0", className)}>
      <defs>
        <radialGradient id="sl-head" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#efffb0" />
          <stop offset="0.5" stopColor="#d7f36b" />
          <stop offset="1" stopColor="#a8c93a" />
        </radialGradient>
      </defs>
      <path d="M19.5 8.2l2.6-3.6" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="23.4" cy="3.6" r="2.4" fill="#d7f36b" stroke="#141414" strokeWidth="1.4" />
      <ellipse cx="16" cy="18" rx="14" ry="12.5" fill="url(#sl-head)" />
      <rect x="6" y="13.2" width="20" height="8.6" rx="4.3" fill="#141414" />
      <rect x="10.6" y="15.4" width="2.4" height="4.2" rx="1.2" fill="#ffffff" />
      <rect x="19" y="15.4" width="2.4" height="4.2" rx="1.2" fill="#ffffff" />
      <ellipse cx="11" cy="9.6" rx="3.2" ry="1.6" fill="#ffffff" fillOpacity="0.45" />
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
        Seenlense
      </span>
    </span>
  );
}
