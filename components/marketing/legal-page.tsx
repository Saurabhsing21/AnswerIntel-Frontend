import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";

export const CONTACT_EMAIL = "hello@gitsaurabh.in";
export const UPDATED = "October 24, 2026";

export type LegalSection = { title: string; body: (string | string[])[] };

/** Terms, privacy and refunds: plain text in sections, one column, easy to read. */
export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <>
      <Nav />
      <main id="top" className="mx-auto max-w-[720px] px-5 pt-14 pb-24 md:px-8 md:pt-20">
        <p className="text-[13px] text-muted">Last updated {UPDATED}</p>
        <h1 className="mt-2 font-display text-[38px] leading-[1.05] font-semibold tracking-[-0.04em] md:text-[48px]">{title}</h1>
        <p className="mt-5 text-[16px] leading-relaxed text-ink-2">{intro}</p>
        {sections.map((s, i) => (
          <section key={s.title} className="mt-10">
            <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em]">
              {i + 1}. {s.title}
            </h2>
            {s.body.map((block, j) =>
              Array.isArray(block) ? (
                <ul key={j} className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink-2">
                  {block.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : (
                <p key={j} className="mt-3 text-[15px] leading-relaxed text-ink-2">{block}</p>
              ),
            )}
          </section>
        ))}
        <p className="mt-12 border-t border-line pt-6 text-[14px] text-muted">
          Questions? Email <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink underline underline-offset-2">{CONTACT_EMAIL}</a>.
        </p>
      </main>
      <Footer />
    </>
  );
}
