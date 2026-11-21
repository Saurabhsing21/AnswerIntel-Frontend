"use client";

import { Play } from "@phosphor-icons/react";
import { useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Mark } from "@/components/ui/mark";

const VIDEO_ID = "jrYJS1tI3jo";
const TITLE = "SeenLense Demo: See How ChatGPT, Perplexity & Gemini Talk About Your Brand";

export function DemoVideo() {
  // The YouTube player only loads on click, so the homepage stays light until someone wants to watch.
  const [playing, setPlaying] = useState(false);

  return (
    <Section id="demo">
      <Reveal className="mx-auto max-w-[720px] text-center">
        <SectionHeading
          title={
            <>
              See Seenlense in <Mark>action</Mark>
            </>
          }
          muted="A 4-minute walkthrough: how AI engines talk about your brand, where rivals win, and what to fix."
        />
      </Reveal>
      <Reveal delay={0.1} y={20} className="mx-auto mt-10 max-w-[960px]">
        <div className="relative aspect-video overflow-hidden rounded-card border border-line-strong bg-sunken">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title={TITLE}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 h-full w-full"
              aria-label={`Play video: ${TITLE}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail, no need to proxy it */}
              <img
                src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-ink/10 transition-colors group-hover:bg-ink/0">
                <span className="grid size-16 place-items-center rounded-full bg-mark text-ink shadow-lg transition-transform group-hover:scale-110 md:size-20">
                  <Play weight="fill" className="size-7 translate-x-0.5 md:size-8" />
                </span>
              </span>
            </button>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
