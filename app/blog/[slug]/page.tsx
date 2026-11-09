import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/blog/json-ld";
import { PostCta } from "@/components/blog/post-cta";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { PUBLIC_URL } from "@/lib/urls";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} - SeenLens`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: post.author }],
    openGraph: { type: "article", title: post.title, description: post.description, url: `/blog/${post.slug}`, publishedTime: post.date },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const related = getPosts().filter((p) => p.slug !== post.slug).slice(0, 3);
  const url = `${PUBLIC_URL}/blog/${post.slug}`;

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
              dateModified: post.date,
              url,
              mainEntityOfPage: url,
              author: { "@type": "Person", name: post.author },
              publisher: { "@id": `${PUBLIC_URL}/#organization` },
            },
            ...(post.faqs.length
              ? [{ "@type": "FAQPage", mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
              : []),
          ],
        }}
      />
      <Nav />
      <main id="top" className="mx-auto max-w-[720px] px-5 pt-14 pb-24 md:px-8 md:pt-20">
        <Link href="/blog" className="text-[13px] font-medium tracking-wide text-muted uppercase hover:text-ink">
          ← The SeenLens journal
        </Link>
        <h1 className="mt-4 font-display text-[36px] leading-[1.08] font-semibold tracking-[-0.03em] md:text-[46px]">{post.title}</h1>
        <p className="mt-4 text-[18px] leading-relaxed text-ink-2">{post.description}</p>
        <p className="mt-5 text-[14px] text-muted">
          By {post.author} · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.minutes} min read
        </p>

        {post.headings.length > 2 && (
          <nav aria-label="On this page" className="mt-10 rounded-card border border-line bg-surface p-5">
            <p className="text-[13px] font-medium text-muted">On this page</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px]">
              {post.headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-ink-2 hover:text-ink hover:underline">{h.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <article className="prose-blog mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />

        <PostCta />

        {related.length > 0 && (
          <section aria-labelledby="related">
            <h2 id="related" className="font-display text-[20px] font-semibold tracking-[-0.02em]">Keep reading</h2>
            <ul className="mt-4 space-y-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="text-[16px] text-ink-2 decoration-mark decoration-2 underline-offset-4 hover:text-ink hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
