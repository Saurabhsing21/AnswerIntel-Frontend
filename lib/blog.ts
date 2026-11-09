import fs from "node:fs";
import path from "node:path";
import { Marked, type Tokens } from "marked";

/**
 * Blog posts are Markdown files in content/blog: the file name is the slug, and a small front matter block holds
 * title, description, date (YYYY-MM-DD) and author. A "## FAQ" section with "### Question" headings also becomes
 * FAQ structured data.
 */
const DIR = path.join(process.cwd(), "content/blog");

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  minutes: number;
  html: string;
  headings: { id: string; text: string }[];
  faqs: { q: string; a: string }[];
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parse(slug: string, file: string): Post {
  const [, head = "", body = file] = file.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const meta = Object.fromEntries(
    head.split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
  );

  const tokens = new Marked().lexer(body);
  const headings: Post["headings"] = [];
  const faqs: Post["faqs"] = [];
  let inFaq = false;
  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 2) {
      headings.push({ id: slugify(token.text), text: token.text });
      inFaq = token.text === "FAQ";
    } else if (inFaq && token.type === "heading" && token.depth === 3) {
      faqs.push({ q: token.text, a: "" });
    } else if (inFaq && token.type === "paragraph" && faqs.length) {
      faqs[faqs.length - 1].a = [faqs[faqs.length - 1].a, token.text].filter(Boolean).join(" ");
    }
  }

  const marked = new Marked({
    renderer: {
      heading({ tokens, depth, text }: Tokens.Heading) {
        return `<h${depth} id="${slugify(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
    },
  });

  return {
    slug,
    title: meta.title,
    description: meta.description,
    date: meta.date,
    author: meta.author,
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
    html: marked.parse(body, { async: false }),
    headings,
    faqs,
  };
}

/** Newest first. */
export function getPosts(): Post[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);

export const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
