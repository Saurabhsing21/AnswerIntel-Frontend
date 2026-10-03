import { ArrowsClockwise, Eye, Target } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/marketing/effects/reveal";
import { EngineSweep } from "@/components/marketing/engine-sweep";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Mark } from "@/components/ui/mark";

const points = [
  { icon: Eye, title: "Every engine, same question", body: "We ask ChatGPT, Perplexity, Gemini and Google exactly what buyers ask." },
  { icon: Target, title: "Mentioned is not recommended", body: "Each answer is read for whether you were named, picked, and ranked." },
  { icon: ArrowsClockwise, title: "Every week, automatically", body: "The same prompts run on schedule, so every change is measurable." },
];

export function Scan() {
  return (
    <Section id="scan" innerClassName="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <Reveal>
        <SectionHeading
          title={
            <>
              Watch a scan <Mark>happen</Mark>
            </>
          }
          muted="One buyer question, four AI engines, and a clear verdict on how each one talks about you."
        />
        <ul className="mt-8 space-y-5">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="group flex gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mark-soft text-ink transition-colors duration-300 group-hover:bg-mark">
                <Icon size={16} />
              </span>
              <span>
                <span className="block text-[16px] font-medium">{title}</span>
                <span className="block text-[15px] leading-relaxed text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.1} y={20} className="min-w-0">
        <EngineSweep />
      </Reveal>
    </Section>
  );
}
