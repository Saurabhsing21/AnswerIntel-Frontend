"use client";

import { X } from "@phosphor-icons/react";
import { useEffect } from "react";
import { EngineIcon } from "@/components/product/engine-icon";
import { useApi } from "@/lib/api/client";
import type { ResponseDetail } from "@/lib/api/types";
import { SOURCE_LABELS } from "@/lib/format";
import { Skeleton, VerdictPill } from "@/components/app/ui";

function Highlighted({ text, brand, competitors }: { text: string; brand: string; competitors: string[] }) {
  const names = [brand, ...competitors].filter(Boolean).sort((a, b) => b.length - a.length);
  if (!names.length) return <>{text}</>;
  const pattern = new RegExp(`(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) => {
        const isBrand = part.toLowerCase() === brand.toLowerCase();
        const isComp = competitors.some((c) => c.toLowerCase() === part.toLowerCase());
        if (isBrand) return <mark key={i} className="rounded-[3px] bg-ink px-0.5 font-medium text-white">{part}</mark>;
        if (isComp) return <mark key={i} className="rounded-[3px] bg-sunken px-0.5 font-medium text-ink">{part}</mark>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** The answer with the sentences behind each verdict underlaid, so you can see why AI picked a brand. */
function WithEvidence({ text, evidence, brand, competitors }: { text: string; evidence: string[]; brand: string; competitors: string[] }) {
  const quotes = [...new Set(evidence.filter((e) => e && text.includes(e)))].sort((a, b) => b.length - a.length);
  if (!quotes.length) return <Highlighted text={text} brand={brand} competitors={competitors} />;
  const pattern = new RegExp(`(${quotes.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        quotes.includes(part) ? (
          <span key={i} className="rounded-[3px] bg-mark-soft box-decoration-clone px-0.5">
            <Highlighted text={part} brand={brand} competitors={competitors} />
          </span>
        ) : (
          <Highlighted key={i} text={part} brand={brand} competitors={competitors} />
        ),
      )}
    </>
  );
}

const verdictOf = (b: { mentioned: boolean; recommended: boolean }) =>
  b.recommended ? "recommended" : b.mentioned ? "mentioned" : "absent";

export function ResponseDrawer({ projectId, responseId, onClose }: { projectId: string; responseId: number | null; onClose: () => void }) {
  const { data, loading } = useApi<ResponseDetail>(responseId ? `/projects/${projectId}/responses/${responseId}` : null);

  useEffect(() => {
    if (!responseId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [responseId, onClose]);

  if (!responseId) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="AI answer">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/20" />
      <div className="relative flex h-full w-full max-w-[620px] flex-col overflow-hidden border-l border-line-strong bg-surface shadow-2xl">
        <header className="flex items-center gap-2 border-b border-line px-5 py-4">
          {data && <EngineIcon engine={data.engine} size={16} />}
          <span className="text-[14px] font-medium">{data?.engine_name ?? "AI answer"}</span>
          <span className="font-mono text-[11px] text-faint">{data?.model}</span>
          <button type="button" onClick={onClose} className="ml-auto grid size-8 place-items-center rounded-full hover:bg-sunken" aria-label="Close">
            <X size={15} />
          </button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {loading || !data ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-40" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-[12px] text-muted">Prompt</p>
                <p className="mt-1 font-display text-[18px] leading-snug tracking-[-0.02em]">&ldquo;{data.prompt}&rdquo;</p>
              </div>

              <div>
                <p className="mb-2 text-[12px] text-muted">How we read it{data.brand ? ` (${data.brand.method === "llm" ? "AI classifier" : "rules"})` : ""}</p>
                <div className="overflow-hidden rounded-[12px] border border-line">
                  {data.brand && (
                    <div className="flex items-center gap-3 border-b border-line bg-[#fbfbfa] px-3.5 py-2.5 text-[13px]">
                      <span className="font-medium">{data.brand.name} (you)</span>
                      <span className="ml-auto flex items-center gap-2">
                        {data.brand.sentiment && <span className="text-[12px] text-muted">{data.brand.sentiment}</span>}
                        <VerdictPill verdict={verdictOf(data.brand)} position={data.brand.position} />
                      </span>
                    </div>
                  )}
                  {data.competitors.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 border-b border-line px-3.5 py-2 text-[13px] last:border-0">
                      <span className="min-w-0">
                        <span className="block">{c.name}</span>
                        {c.mentioned && c.reason && <span className="block text-[12px] text-muted">{c.reason}</span>}
                      </span>
                      <span className="ml-auto shrink-0">
                        <VerdictPill verdict={verdictOf(c)} position={c.position} />
                      </span>
                    </div>
                  ))}
                </div>
                {data.brand?.reason && <p className="mt-2 text-[12px] text-muted">Why: {data.brand.reason}</p>}
              </div>

              <div>
                <p className="mb-2 text-[12px] text-muted">What {data.engine_name} said <span className="text-faint">· highlighted: the sentences behind each verdict</span></p>
                <div className="whitespace-pre-wrap rounded-[12px] bg-page px-4 py-3.5 text-[13px] leading-relaxed text-ink-2">
                  <WithEvidence
                    text={data.text}
                    evidence={[data.brand?.evidence ?? "", ...data.competitors.map((c) => c.evidence ?? "")]}
                    brand={data.brand?.name ?? ""}
                    competitors={data.competitors.map((c) => c.name)}
                  />
                </div>
              </div>

              {data.citations.length > 0 && (
                <div>
                  <p className="mb-2 text-[12px] text-muted">Sources cited</p>
                  <ul className="space-y-1.5">
                    {data.citations.map((c) => (
                      <li key={c.url} className="flex items-center gap-2 text-[13px]">
                        <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{SOURCE_LABELS[c.source_type] ?? c.source_type}</span>
                        <a href={c.url} target="_blank" rel="noreferrer noopener" className="truncate text-ink underline-offset-2 hover:underline">
                          {c.domain}
                        </a>
                        {c.is_brand_owned && <span className="text-[11px] text-muted">your site</span>}
                        {c.competitor && <span className="text-[11px] text-muted">{c.competitor}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
