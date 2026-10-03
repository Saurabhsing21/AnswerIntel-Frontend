import { cx } from "@/lib/cx";

/**
 * Page frame: full-width top divider, centered column with side rails.
 * The rails carry the layout grid; content aligns to them.
 */
export function Section({
  id,
  className,
  innerClassName,
  children,
}: {
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cx("border-t border-line", className)}>
      <div
        className={cx(
          "mx-auto max-w-[1200px] border-x border-line px-5 md:px-10",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  muted,
  className,
}: {
  title: string;
  muted?: string;
  className?: string;
}) {
  return (
    <h2
      className={cx(
        "text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.035em] md:text-[44px]",
        className,
      )}
    >
      {title}
      {muted && <span className="block text-muted">{muted}</span>}
    </h2>
  );
}
