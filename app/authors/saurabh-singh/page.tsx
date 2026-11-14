import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/blog/json-ld";
import { CONTACT_EMAIL } from "@/components/marketing/legal-page";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { formatDate, getPosts } from "@/lib/blog";
import { PUBLIC_URL } from "@/lib/urls";

const NAME = "Saurabh Singh";
const PATH = "/authors/saurabh-singh";
const PROFILES = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/gitsaurabhsingh/" },
  { label: "X", href: "https://x.com/gitsaurabh0" },
];

export const metadata: Metadata = {
  title: `${NAME}, founder of Seenlense`,
  description: `${NAME} builds Seenlense, an AI search visibility tracker, and writes about how AI assistants choose the brands they recommend.`,
  alternates: { canonical: PATH },
};

export default function AuthorPage() {
  const posts = getPosts().filter((p) => p.author === NAME);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: `${PUBLIC_URL}${PATH}`,
          mainEntity: {
            "@type": "Person",
            "@id": `${PUBLIC_URL}${PATH}#person`,
            name: NAME,
            url: `${PUBLIC_URL}${PATH}`,
            email: CONTACT_EMAIL,
            jobTitle: "Founder",
            sameAs: PROFILES.map((p) => p.href),
            worksFor: { "@id": `${PUBLIC_URL}/#organization` },
          },
        }}
      />
      <Nav />
      <main id="top" className="mx-auto max-w-[720px] px-5 pt-14 pb-24 md:px-8 md:pt-20">
        <p className="text-[13px] text-muted">Author</p>
        <h1 className="mt-2 font-display text-[38px] leading-[1.05] font-semibold tracking-[-0.04em] md:text-[48px]">{NAME}</h1>
        <p className="mt-5 text-[16px] leading-relaxed text-ink-2">
          Founder of Seenlense. Saurabh builds the product end to end, from the scans that ask AI engines your buyers&apos;
          questions to the analysis that reads the answers, and writes the Seenlense blog from what those scans show.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[16px] leading-relaxed text-ink-2">
          {PROFILES.map((p) => (
            <a key={p.href} href={p.href} rel="me noopener" target="_blank" className="font-medium text-ink underline underline-offset-2">
              {p.label}
            </a>
          ))}
        </p>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-2">
          Email <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink underline underline-offset-2">{CONTACT_EMAIL}</a>.
        </p>
        <h2 className="mt-12 font-display text-[20px] font-semibold tracking-[-0.02em]">Articles</h2>
        <ul className="mt-4 space-y-4">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="text-[16px] font-medium text-ink hover:underline">
                {p.title}
              </Link>
              <p className="text-[14px] text-muted">{formatDate(p.date)}</p>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
