import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { formatDate, getPosts, type Post } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog - Seenlense",
  description: "Guides on AI search visibility: how ChatGPT, Perplexity and Gemini pick the brands they recommend, and how to become one of them.",
  alternates: { canonical: "/blog" },
};

function Cover({ post, eager }: { post: Post; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- generated cover, already sized for the page
    <img
      src={`/blog/${post.slug}/opengraph-image`}
      alt=""
      width={1200}
      height={630}
      loading={eager ? "eager" : "lazy"}
      className="aspect-[1200/630] w-full rounded-card border border-line-strong object-cover transition-transform duration-300 group-hover:-translate-y-1"
    />
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
      <span className="rounded-full bg-mark-soft px-2.5 py-0.5 font-medium text-ink">{post.category}</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span>{post.minutes} min read</span>
    </p>
  );
}

export default function BlogPage() {
  const posts = getPosts();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p !== featured);
  return (
    <>
      <Nav />
      <main id="top" className="mx-auto max-w-[1180px] px-5 pt-14 pb-24 md:px-8 md:pt-20">
        <h1 className="max-w-[20ch] font-display text-[42px] leading-[1.02] font-semibold tracking-[-0.035em] md:text-[64px]">
          Get recommended by AI
        </h1>
        <p className="mt-5 max-w-[52ch] text-[18px] leading-relaxed text-muted">
          How ChatGPT, Perplexity and Gemini decide which brands to name, and what founders can do about it.
        </p>

        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group mt-14 grid items-center gap-8 md:grid-cols-[1.25fr_1fr] md:gap-12">
            <Cover post={featured} eager />
            <div>
              <Meta post={featured} />
              <h2 className="mt-4 font-display text-[30px] leading-[1.08] font-semibold tracking-[-0.03em] text-ink group-hover:underline md:text-[38px]">
                {featured.title}
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-2">{featured.description}</p>
              <p className="mt-5 text-[14px] text-muted">By {featured.author}</p>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <ul className="mt-16 grid gap-x-10 gap-y-14 border-t border-line pt-14 md:grid-cols-2">
            {rest.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <Cover post={p} />
                  <div className="mt-5">
                    <Meta post={p} />
                    <h2 className="mt-3 font-display text-[24px] leading-snug font-semibold tracking-[-0.02em] text-ink group-hover:underline">{p.title}</h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{p.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
