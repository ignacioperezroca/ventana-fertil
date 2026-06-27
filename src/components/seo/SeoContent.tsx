"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { useMemo } from "react";

import { trackEvent } from "@/lib/analytics";
import { buildFaqJsonLd, FAQ_ITEMS } from "@/lib/seo";

export function SeoContent({ isDemo = false }: { isDemo?: boolean }) {
  const jsonLd = useMemo(() => JSON.stringify(buildFaqJsonLd()).replace(/</g, "\\u003c"), []);

  return (
    <section className="rounded-[34px] border border-app-border bg-white/92 p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">SEO</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Preguntas frecuentes</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Respuestas cortas para entender la app sin leer bloques largos.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <HelpCircle className="size-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {FAQ_ITEMS.map((item, index) => (
          <details
            key={item.question}
            className="group rounded-[26px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,249,244,0.92)_100%)] p-4"
            onToggle={(event) => {
              if ((event.currentTarget as HTMLDetailsElement).open) {
                trackEvent("faq_opened", { source: `seo-faq-${index + 1}`, hasResult: false, isDemo, eventVersion: "g1" });
              }
            }}
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <span className="text-sm font-semibold text-app-foreground">{item.question}</span>
              <ChevronDown className="size-4 shrink-0 text-app-muted transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-6 text-app-muted">{item.answer}</p>
          </details>
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </section>
  );
}
