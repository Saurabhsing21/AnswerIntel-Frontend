import { ArrowRight } from "@phosphor-icons/react/ssr";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-[#2b2b2b]",
  secondary: "bg-surface text-ink border border-line-strong hover:border-[rgb(0_0_0/0.22)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 pl-4 pr-3 text-sm",
  md: "h-11 pl-5 pr-4 text-[15px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md") {
  return cx(
    "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium",
    "transition-[background-color,border-color,transform] duration-150 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-60",
    sizes[size],
    variants[variant],
  );
}

/** Arrow that nudges right on hover; part of every AnswerIntel action. */
export function ButtonArrow() {
  return (
    <ArrowRight
      size={15}
      weight="bold"
      aria-hidden
      className="transition-transform duration-200 group-hover:translate-x-0.5"
    />
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
