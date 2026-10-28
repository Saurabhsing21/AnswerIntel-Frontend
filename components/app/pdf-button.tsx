"use client";

import { CircleNotch, FilePdf } from "@phosphor-icons/react";
import { useState } from "react";
import { useToast } from "@/components/app/toast";
import { buttonClass } from "@/components/ui/button";

/** Opens a report's PDF. The report worker draws it in the background, so the export answers 202 until it is
 * ready; this waits for it instead of opening an error page. */
export function PdfButton({ href, tone = "light" }: { href: string; tone?: "light" | "dark" }) {
  const toast = useToast();
  const [waiting, setWaiting] = useState(false);

  async function open() {
    // Open the tab now, inside the click, so pop-up blockers allow it; point it at the PDF once it exists.
    const tab = window.open("", "_blank");
    setWaiting(true);
    try {
      for (let attempt = 0; attempt < 60; attempt++) {
        const res = await fetch(href);
        if (res.status === 200) {
          if (tab) tab.location.href = href;
          else window.location.href = href;
          return;
        }
        if (res.status !== 202) throw new Error(String(res.status));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      throw new Error("timeout");
    } catch {
      tab?.close();
      toast.push("The PDF could not be prepared. Try again in a minute.", "error");
    } finally {
      setWaiting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={waiting}
      className={tone === "dark"
        ? "inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-[13px] text-white/85 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
        : buttonClass("secondary", "sm")}
    >
      {waiting ? <CircleNotch size={14} className="animate-spin" /> : <FilePdf size={14} />} {waiting ? "Preparing PDF" : "PDF"}
    </button>
  );
}
