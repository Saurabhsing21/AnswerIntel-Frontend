export function BrandTile({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-[6px] font-semibold"
      style={{
        background: color,
        color: color === "#eab308" ? "#171717" : "#fff", // keep the initial readable on amber
        width: size,
        height: size,
        fontSize: Math.round(size * 0.52),
      }}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}
