import type { Brand } from "@/lib/data";

export function BrandMark({ brand, size = 18 }: { brand: Brand; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-[5px] font-semibold text-white"
      style={{
        background: brand.color,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.52),
      }}
    >
      {brand.name[0]}
    </span>
  );
}
