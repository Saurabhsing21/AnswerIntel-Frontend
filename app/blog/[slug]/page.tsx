import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/blog/json-ld";
import { EndCta, InlineCta, SideCta } from "@/components/blog/post-cta";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { AUTHOR_PAGES, formatDate, getPost, getPosts, splitForCta } from "@/lib/blog";
import { PUBLIC_URL } from "@/lib/urls";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} - Seenlense`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: post.author, url: AUTHOR_PAGES[post.author] }],
    openGraph: { type: "article", title: post.title, description: post.description, url: `/blog/${post.slug}`, publishedTime: post.date, modifiedTime: post.updated },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const related = getPosts().filter((p) => p.slug !== post.slug).slice(0, 3);
  const url = `${PUBLIC_URL}/blog/${post.slug}`;
  const [intro, rest] = splitForCta(post.html);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              headline: post.title,
              description: post.description,
              datePublished: post.date,
              dateModified: post.updated,
              image: `${url}/opengraph-image`,
              url,
              mainEntityOfPage: url,
              author: { "@type": "Person", name: post.author, ...(AUTHOR_PAGES[post.author] && { url: `${PUBLIC_URL}${AUTHOR_PAGES[post.author]}` }) },
              publisher: { "@id": `${PUBLIC_URL}/#organization` },
            },
            ...(post.faqs.length
              ? [{ "@type": "FAQPage", mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
              : []),
          ],
        }}
      />
      <Nav />
      <main id="top" className="mx-auto max-w-[1180px] px-5 pt-12 pb-24 md:px-8 md:pt-16">
        <div className="grid justify-center gap-16 lg:grid-cols-[minmax(0,740px)_280px]">
          <div className="min-w-0">
            <header>
              <Link href="/blog" className="text-[14px] text-muted transition-colors hover:text-ink">
                ← All posts
              </Link>
              <p className="mt-6">
                <span className="rounded-full bg-mark px-3 py-1 text-[13px] font-medium text-ink">{post.category}</span>
              </p>
              <h1 className="mt-5 font-display text-[38px] leading-[1.04] font-semibold tracking-[-0.035em] text-ink md:text-[56px]">
                {post.title}
              </h1>
              <p className="mt-5 max-w-[60ch] text-[18px] leading-relaxed text-muted md:text-[19px]">{post.description}</p>
            </header>

            {/* eslint-disable-next-line @next/next/no-img-element -- generated cover, already sized for the page */}
            <img
              src={`/blog/${post.slug}/opengraph-image`}
              alt={`Cover: ${post.cover}`}
              width={1200}
              height={630}
              className="mt-10 aspect-[1200/630] w-full rounded-card border border-line-strong object-cover"
            />

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-6 text-[14px] text-muted">
              <span className="flex items-center gap-2 text-ink-2">
                <span aria-hidden className="grid size-7 place-items-center rounded-full bg-ink text-[11px] font-semibold text-mark">
                  {post.author.split(" ").map((w) => w[0]).join("")}
                </span>
                {AUTHOR_PAGES[post.author] ? (
                  <Link href={AUTHOR_PAGES[post.author]} className="hover:text-ink hover:underline">
                    {post.author}
                  </Link>
                ) : (
                  post.author
                )}
              </span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.updated !== post.date && (
                <span>
                  Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                </span>
              )}
              <span>{post.minutes} min read</span>
            </div>

            {post.headings.length > 2 && (
              <nav aria-label="On this page" className="mt-8 rounded-card border border-line bg-sunken/60 p-5 md:p-6">
                <p className="text-[14px] font-semibold text-ink">On this page</p>
                <ol className="mt-3 list-decimal gap-x-10 pl-5 text-[15px] leading-relaxed marker:text-muted sm:columns-2">
                  {post.headings.map((h) => (
                    <li key={h.id} className="break-inside-avoid py-0.5">
                      <a href={`#${h.id}`} className="text-ink-2 transition-colors hover:text-ink hover:underline">{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <article className="mt-10">
              <div className="prose-blog" dangerouslySetInnerHTML={{ __html: intro }} />
              {rest && <InlineCta />}
              {rest && <div className="prose-blog" dangerouslySetInnerHTML={{ __html: rest }} />}
            </article>

            <EndCta />

            {related.length > 0 && (
              <section aria-labelledby="related">
                <h2 id="related" className="font-display text-[24px] font-semibold tracking-[-0.02em]">Keep reading</h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className="group block">
                        {/* eslint-disable-next-line @next/next/no-img-element -- generated cover */}
                        <img
                          src={`/blog/${p.slug}/opengraph-image`}
                          alt=""
                          width={1200}
                          height={630}
                          loading="lazy"
                          className="aspect-[1200/630] w-full rounded-[14px] border border-line-strong object-cover transition-transform duration-300 group-hover:-translate-y-1"
                        />
                        <p className="mt-3 font-display text-[18px] leading-snug font-semibold tracking-[-0.01em] text-ink group-hover:underline">{p.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <SideCta />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
