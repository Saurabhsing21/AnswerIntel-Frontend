import type { Icon } from "@phosphor-icons/react";
import { cx } from "@/lib/cx";

type Variant = "ink" | "light" | "mark";
type Size = "xs" | "sm" | "md" | "lg";

const sizes: Record<Size, { box: string; icon: number }> = {
  xs: { box: "size-5 rounded-[6px]", icon: 11 },
  sm: { box: "size-8 rounded-[10px]", icon: 16 },
  md: { box: "size-10 rounded-[12px]", icon: 20 },
  lg: { box: "size-12 rounded-[14px]", icon: 24 },
};

// Layered gradient + inner bevel + soft drop shadow: reads as a physical, 3D key.
const variants: Record<Variant, { tile: string; gloss: string; icon: string }> = {
  ink: {
    tile: "bg-[linear-gradient(180deg,#3b3b3b_0%,#1a1a1a_52%,#0d0d0d_100%)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-1px_1px_rgb(0_0_0/0.55),0_1px_1px_rgb(0_0_0/0.25),0_10px_18px_-10px_rgb(0_0_0/0.6)]",
    gloss: "from-white/20",
    icon: "drop-shadow-[0_1px_0_rgb(0_0_0/0.45)]",
  },
  light: {
    tile: "bg-[linear-gradient(180deg,#ffffff_0%,#f3f3f1_100%)] text-ink ring-1 ring-black/[0.08] shadow-[inset_0_1px_0_#fff,inset_0_-1px_0_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.06),0_10px_18px_-12px_rgb(0_0_0/0.3)]",
    gloss: "from-white/70",
    icon: "drop-shadow-[0_1px_0_#fff]",
  },
  mark: {
    tile: "bg-[linear-gradient(180deg,#ecfca6_0%,#d3f05e_100%)] text-ink ring-1 ring-[#a7c93a]/70 shadow-[inset_0_1px_0_rgb(255_255_255/0.75),inset_0_-1px_0_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.08),0_8px_16px_-10px_rgb(110_140_20/0.7)]",
    gloss: "from-white/45",
    icon: "drop-shadow-[0_1px_0_rgb(255_255_255/0.6)]",
  },
};

/** Premium icon key: duotone glyph on a glossy, bevelled tile. */
export function IconTile({
  icon: Glyph,
  variant = "ink",
  size = "md",
  className,
}: {
  icon: Icon;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const s = sizes[size];
  const v = variants[variant];
  return (
    <span
      aria-hidden
      className={cx(
        "relative inline-grid shrink-0 place-items-center overflow-hidden transition-transform duration-300 ease-out",
        s.box,
        v.tile,
        className,
      )}
    >
      <span className={cx("pointer-events-none absolute inset-x-[1px] top-[1px] h-1/2 rounded-[inherit] bg-gradient-to-b to-transparent", v.gloss)} />
      <Glyph size={s.icon} weight="duotone" className={cx("relative", v.icon)} />
    </span>
  );
}
