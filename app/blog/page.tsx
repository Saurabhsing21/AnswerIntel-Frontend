import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { formatDate, getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog - SeenLense",
  description: "Guides on AI search visibility: how ChatGPT, Perplexity and Gemini pick the brands they recommend, and how to become one of them.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <>
      <Nav />
      <main id="top" className="mx-auto max-w-[760px] px-5 pt-14 pb-24 md:px-8 md:pt-20">
        <p className="text-[13px] font-medium tracking-wide text-muted uppercase">The SeenLense journal</p>
        <h1 className="mt-3 font-display text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] md:text-[52px]">
          Notes on getting recommended by AI
        </h1>
        <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-ink-2">
          How ChatGPT, Perplexity and Gemini decide which brands to name, what they read, and what founders can do about it.
        </p>
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {posts.map((p) => (
            <li key={p.slug} className="py-8">
              <p className="text-[13px] text-muted">
                <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.minutes} min read
              </p>
              <h2 className="mt-2 font-display text-[24px] leading-tight font-semibold tracking-[-0.02em]">
                <Link href={`/blog/${p.slug}`} className="decoration-mark decoration-2 underline-offset-4 hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{p.description}</p>
              <p className="mt-3 text-[13px] text-muted">By {p.author}</p>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
