import { cx } from "@/lib/cx";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={cx(
          "relative grid size-6 place-items-center rounded-[6px]",
          inverse ? "bg-white" : "bg-ink",
        )}
      >
        <span
          className={cx(
            "size-2 translate-x-[3px] -translate-y-[3px] rounded-full",
            inverse ? "bg-ink" : "bg-white",
          )}
        />
      </span>
      <span
        className={cx(
          "text-[17px] font-semibold tracking-[-0.03em]",
          inverse ? "text-white" : "text-ink",
        )}
      >
        AnswerIntel
      </span>
    </span>
  );
}
