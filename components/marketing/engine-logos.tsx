import { EngineIcon, engineNames } from "@/components/product/engine-icon";
import type { Engine } from "@/lib/data";
import { cx } from "@/lib/cx";

/** A compact row of AI engine logos in their brand colours, each on a white disc so the colours read on light and
 * dark cards alike; the names are for screen readers and the hover title. Each logo is `relative` so its screen-reader
 * name (absolutely positioned) stays inside a sideways-scrolling table instead of widening the whole page on phones. */
export function EngineLogos({ engines, dark = false, className }: { engines: Engine[]; dark?: boolean; className?: string }) {
  return (
    <ul aria-label="AI engines" className={cx("flex flex-wrap gap-1.5", className)}>
      {engines.map((engine) => (
        <li
          key={engine}
          title={engineNames[engine]}
          className={cx("relative grid size-8 place-items-center rounded-full bg-white text-[#0d0d0d]", !dark && "ring-1 ring-line")}
        >
          <EngineIcon engine={engine} size={16} />
          <span className="sr-only">{engineNames[engine]}</span>
        </li>
      ))}
    </ul>
  );
}
