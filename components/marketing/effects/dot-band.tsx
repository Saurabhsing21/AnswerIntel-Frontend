import { cx } from "@/lib/cx";

/** Dotted band with a slow highlight sweep, like the strip under Peec's hero. Pure CSS. */
export function DotBand({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cx("relative overflow-hidden", className)}>
      <div className="absolute inset-0 [background-image:radial-gradient(#d4d4d4_0.9px,transparent_1.1px)] [background-size:6px_6px] [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_65%,transparent)]" />
      <div className="absolute inset-0 [background-image:radial-gradient(#8a8a8a_0.9px,transparent_1.1px)] [background-size:6px_6px] [mask-image:linear-gradient(90deg,transparent,black,transparent)] [mask-repeat:no-repeat] [mask-size:35%_100%] [mask-position:-60%_0] motion-safe:animate-dot-sweep" />
    </div>
  );
}
