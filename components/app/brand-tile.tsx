"use client";

import { useState } from "react";

/** example.com from "https://www.example.com/pricing", or null when there is no usable host. */
export function domainOf(website: string | null | undefined): string | null {
  if (!website) return null;
  const host = website.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0]?.toLowerCase();
  return host && host.includes(".") ? host : null;
}

/**
 * A brand's or site's mark: its real logo when we know its website (served and cached by our API), otherwise,
 * or if the logo fails to load, the first letter on the brand's colour.
 */
export function BrandTile({ name, color, size = 20, website }: { name: string; color: string; size?: number; website?: string | null }) {
  const domain = domainOf(website);
  const [failed, setFailed] = useState(false);
  if (domain && !failed)
    return (
      <span
        aria-hidden
        className="inline-grid shrink-0 place-items-center overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a tiny cached icon from our own API */}
        <img src={`/api/backend/logos/${domain}`} alt="" width={size} height={size} loading="lazy" onError={() => setFailed(true)} className="size-[78%] object-contain" />
      </span>
    );
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
