import { cx } from "@/lib/cx";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={cx(
          "relative grid place-items-center overflow-hidden rounded-[8px] bg-ink",
          size === "lg" ? "size-8" : "size-6",
        )}
      >
        <span className="h-[34%] w-[62%] -rotate-12 rounded-[2px] bg-mark" />
      </span>
      <span
        className={cx(
          "font-display font-semibold tracking-[-0.03em] text-ink",
          size === "lg" ? "text-[22px]" : "text-[18px]",
        )}
      >
        AnswerIntel
      </span>
    </span>
  );
}
