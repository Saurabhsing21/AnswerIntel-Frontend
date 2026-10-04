import { CalendarCheck, ChatsCircle, SealCheck } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/marketing/effects/reveal";
import { EngineSweep } from "@/components/marketing/engine-sweep";
import { Section, SectionHeading } from "@/components/marketing/section";
import { IconTile } from "@/components/ui/icon-tile";
import { Mark } from "@/components/ui/mark";

const points = [
  { icon: ChatsCircle, title: "Every engine, same question", body: "We ask ChatGPT, Perplexity, Gemini and Google exactly what buyers ask." },
  { icon: SealCheck, title: "Mentioned is not recommended", body: "Each answer is read for whether you were named, picked, and ranked." },
  { icon: CalendarCheck, title: "Every week, automatically", body: "The same prompts run on schedule, so every change is measurable." },
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
              <IconTile icon={Icon} variant="ink" className="group-hover:-translate-y-0.5 group-hover:-rotate-6" />
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
