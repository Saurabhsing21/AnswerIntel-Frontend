import { cx } from "@/lib/cx";

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
    <section id={id} className={className}>
      <div className={cx("mx-auto max-w-[1200px] px-5 py-12 md:px-8 md:py-14", innerClassName)}>
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
  title: React.ReactNode;
  muted?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-balance font-display text-[34px] font-semibold leading-[1.02] tracking-[-0.035em] md:text-[52px]">
        {title}
      </h2>
      {muted && <p className="mt-4 text-[17px] leading-relaxed text-muted md:text-[18px]">{muted}</p>}
    </div>
  );
}
