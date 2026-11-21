"use client";

import { Play } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/marketing/effects/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Mark } from "@/components/ui/mark";

// Served from Vercel Blob; preload="none" keeps the homepage light until someone presses play.
const VIDEO_URL = "https://ru5upibvekn8vry3.public.blob.vercel-storage.com/video/seenlense-demo-Ai2F7nyKuGST0vwu4PnQstSzxk5dzn.mp4";

export function DemoVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);

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
        <div className="relative overflow-hidden rounded-card border border-line-strong bg-sunken">
          <video
            ref={video}
            className="block aspect-[16/10] w-full"
            src={VIDEO_URL}
            poster="/demo-poster.jpg"
            preload="none"
            controls
            playsInline
            aria-label="Seenlense product demo"
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          />
          {/* Big centred play button while paused; only the button takes clicks, so the native controls stay usable. */}
          {paused && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/10">
              <button
                type="button"
                onClick={() => video.current?.play()}
                aria-label="Play demo video"
                className="pointer-events-auto grid size-16 place-items-center rounded-full bg-mark text-ink shadow-lg transition-transform hover:scale-110 md:size-20"
              >
                <Play weight="fill" className="size-7 translate-x-0.5 md:size-8" />
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
