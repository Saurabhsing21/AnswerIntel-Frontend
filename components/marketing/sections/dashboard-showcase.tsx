import { Reveal } from "@/components/marketing/effects/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { AppFrame } from "@/components/product/app-frame";

export function DashboardShowcase() {
  return (
    <Section id="dashboard" innerClassName="pt-4 md:pt-8">
      <div className="rounded-[28px] bg-sunken p-2 md:p-3">
        <SectionHeading
          className="max-w-[640px] px-4 pt-6 pb-8 md:px-6 md:pt-10"
          title="Every week, one clear view"
          muted="Mentions, recommendations, and share of voice next to every competitor. Click around, it works."
        />
        <Reveal y={20}>
          <AppFrame />
        </Reveal>
      </div>
    </Section>
  );
}
