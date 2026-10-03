import {
  Article,
  Gauge,
  Link,
  Scales,
  Compass,
  Wrench,
} from "@phosphor-icons/react/ssr";
import { Section, SectionHeading } from "@/components/marketing/section";

const gaps = [
  {
    icon: Article,
    title: "Content gap",
    body: "A competitor answers the question on their site. You don't.",
    example: "Kiteline has a CRM for startups page. Halden has nothing equivalent.",
  },
  {
    icon: Link,
    title: "Citation gap",
    body: "Fewer third-party sites mention you.",
    example: "Kiteline appears in 7 recurring sources. Halden appears in 2.",
  },
  {
    icon: Gauge,
    title: "Authority gap",
    body: "The sources AI trusts rarely cover you.",
    example: "Review sites and Reddit threads cite Vantor three times as often.",
  },
  {
    icon: Compass,
    title: "Positioning gap",
    body: "AI doesn't connect you to the category.",
    example: "Your homepage says business software, not CRM for startups.",
  },
  {
    icon: Scales,
    title: "Comparison gap",
    body: "No comparison or alternatives pages to quote.",
    example: "Competitors publish versus pages that AI repeats almost word for word.",
  },
  {
    icon: Wrench,
    title: "Technical gap",
    body: "Key pages are hard for AI crawlers to read.",
    example: "Your pricing page renders in the browser, so crawlers see an empty page.",
  },
];

export function WhyLosing() {
  return (
    <Section id="gaps" innerClassName="py-20 md:py-28">
      <SectionHeading className="max-w-[680px]" title="Why AI picks your competitors" />
      <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-muted">
        Every lost answer gets a cause, so you know what kind of fix it needs. Hover a gap to see an example.
      </p>

      <div className="mt-12 grid overflow-hidden rounded-card border border-line-strong bg-line-strong sm:grid-cols-2 lg:grid-cols-3 [&>*]:bg-surface gap-px">
        {gaps.map(({ icon: Icon, title, body, example }) => (
          <article
            key={title}
            tabIndex={0}
            className="group p-6 outline-none transition-colors hover:bg-[#fbfbfb] focus-visible:bg-[#fbfbfb] md:p-8"
          >
            <span className="grid size-9 place-items-center rounded-full bg-mark-soft text-ink transition-[transform,background-color] duration-300 group-hover:-rotate-6 group-hover:bg-mark group-focus-visible:bg-mark">
              <Icon size={18} />
            </span>
            <h3 className="mt-5 text-[17px] font-medium tracking-[-0.02em]">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{body}</p>
            <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] md:group-focus-visible:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <p className="mt-4 border-l-[3px] border-mark pl-3 text-[13px] leading-relaxed text-ink-2">{example}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
