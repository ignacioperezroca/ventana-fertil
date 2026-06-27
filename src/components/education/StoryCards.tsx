"use client";

import { useEffect } from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { trackEvent, getDeviceCategory } from "@/lib/analytics";
import { storyCards } from "@/content/stories";

export function StoryCards({ onStoryOpen }: { onStoryOpen?: (id: string) => void }) {
  useEffect(() => {
    trackEvent("story_card_viewed", {
      hasSimulation: true,
      confidenceLevel: "medium",
      uncertaintyBucket: "moderate",
      source: "learn",
      isDemo: false,
      deviceCategory: getDeviceCategory(),
    });
  }, []);

  return (
    <section className="rounded-[28px] border border-app-border bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_22px_70px_-42px_rgba(36,22,47,0.32)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Aprender en corto</p>
          <h3 className="mt-1 text-xl font-semibold text-app-foreground">Historias visuales</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Tres pantallas por idea. Sin párrafos largos.</p>
        </div>
        <BookOpen className="size-5 text-app-primary" />
      </div>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3 snap-x snap-mandatory">
          {storyCards.map((story) => (
            <article key={story.id} className="snap-start w-[18.5rem] rounded-[26px] border border-app-border bg-white p-4 shadow-[0_18px_40px_-34px_rgba(36,22,47,0.35)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-app-foreground">
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-app-primary/10 text-lg">{story.icon}</span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">Historia</p>
                    <h4 className="text-sm font-semibold leading-5 text-app-foreground">{story.title}</h4>
                  </div>
                </div>
                <Sparkles className="size-4 text-app-accent" />
              </div>

              <div className="mt-4 grid gap-2">
                {story.slides.map((slide, index) => (
                  <div key={slide} className="flex items-start gap-3 rounded-2xl border border-app-border bg-app-surface-2/40 p-3 text-sm leading-6 text-app-muted">
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-app-primary">{index + 1}</span>
                    <span>{slide}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-app-border bg-[linear-gradient(180deg,#fffdfb_0%,#fff6ef_100%)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Para llevar</p>
                <p className="mt-1 text-sm leading-6 text-app-foreground">{story.takeaway}</p>
              </div>

              {onStoryOpen ? (
                <button type="button" onClick={() => onStoryOpen(story.id)} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/40">
                  Ver más
                  <ArrowRight className="size-4" />
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
