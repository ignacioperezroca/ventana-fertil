"use client";

import { Check, Frown, Meh, Smile } from "lucide-react";
import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";

const FEEDBACK_KEY = "ventana-fertil:feedback";

type FeedbackRating = "yes" | "neutral" | "no";

interface StoredFeedback {
  rating: FeedbackRating;
  updatedAt: string;
}

function safeGetItem(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage can be unavailable in private browsing or restricted contexts.
  }
}

function loadFeedback(): StoredFeedback | null {
  const raw = safeGetItem(FEEDBACK_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredFeedback;
    if (parsed && (parsed.rating === "yes" || parsed.rating === "neutral" || parsed.rating === "no")) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function saveFeedback(rating: FeedbackRating) {
  const value: StoredFeedback = { rating, updatedAt: new Date().toISOString() };
  safeSetItem(FEEDBACK_KEY, JSON.stringify(value));
  return value;
}

export function FeedbackCard({
  hasResult,
  isDemo = false,
  onNotify,
  }: {
  hasResult: boolean;
  isDemo?: boolean;
  onNotify: (tone: "neutral" | "success" | "warning" | "danger", title: string, message: string) => void;
}) {
  const [feedback, setFeedback] = useState<StoredFeedback | null>(() => loadFeedback());

  const submittedLabel = useMemo(() => {
    if (!feedback) return null;
    if (feedback.rating === "yes") return "Sí";
    if (feedback.rating === "neutral") return "Más o menos";
    return "No";
  }, [feedback]);

  const handleSubmit = (rating: FeedbackRating) => {
    const next = saveFeedback(rating);
    setFeedback(next);
    trackEvent("feedback_clicked", {
      hasResult,
      isDemo,
      source: "feedback_card",
      feedbackRating: rating,
      eventVersion: "g1",
    });
    trackEvent("feedback_submitted", {
      hasResult,
      isDemo,
      source: "feedback_card",
      feedbackRating: rating,
      eventVersion: "g1",
    });
    onNotify("success", "Gracias", "Esto nos ayuda a mejorar.");
  };

  if (feedback) {
    return (
      <section className="rounded-[30px] border border-app-border bg-white/92 p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Opinión</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Gracias por tu respuesta</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Guardamos tu opinión en este navegador.</p>
        </div>
          <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
            <Check className="size-5" />
          </div>
        </div>
        <p className="mt-4 inline-flex items-center rounded-full border border-app-border bg-app-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
          Respuesta: {submittedLabel}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[30px] border border-app-border bg-white/92 p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Opinión</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Te sirvió el resultado?</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Tu respuesta queda local y nos ayuda a mejorar la claridad.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <Smile className="size-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <FeedbackButton icon={Smile} label="Sí" onClick={() => handleSubmit("yes")} tone="success" />
        <FeedbackButton icon={Meh} label="Más o menos" onClick={() => handleSubmit("neutral")} tone="neutral" />
        <FeedbackButton icon={Frown} label="No" onClick={() => handleSubmit("no")} tone="danger" />
      </div>
    </section>
  );
}

function FeedbackButton({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: typeof Smile;
  label: string;
  onClick: () => void;
  tone: "success" | "neutral" | "danger";
}) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "danger"
        ? "border-rose-200 bg-rose-50 text-rose-900"
        : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`vf-press inline-flex h-12 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${toneClasses}`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
