import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "inverse" | "inverse-ghost";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-[#2b2b2b] shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.18)]",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-[#fbfbfb] hover:border-[rgb(0_0_0/0.18)] shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
  inverse: "bg-white text-ink hover:bg-[#ececec]",
  "inverse-ghost":
    "bg-white/[0.06] text-white border border-white/15 hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md") {
  return cx(
    "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium",
    "transition-[background-color,border-color,transform] duration-150 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-60",
    sizes[size],
    variants[variant],
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={cx(buttonClass(variant, size), className)}>
      {children}
    </a>
  );
}

/** The small square glyph Peec-style secondary buttons carry; darkens on hover. */
export function ButtonGlyph() {
  return (
    <span
      aria-hidden
      className="size-2 rounded-[2px] bg-faint transition-colors duration-150 group-hover:bg-ink"
    />
  );
}
