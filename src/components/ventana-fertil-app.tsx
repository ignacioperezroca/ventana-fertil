"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { ActivationHeader } from "@/components/landing/ActivationHeader";
import { DemoModeBanner } from "@/components/demo/DemoModeBanner";
import { VisualExplanationSheet } from "@/components/education/VisualExplanationSheet";
import { SeoContent } from "@/components/seo/SeoContent";
import { SimplePeriodInput } from "@/components/input/SimplePeriodInput";
import { MotionPage } from "@/components/motion/MotionPage";
import { EmptyIllustration } from "@/components/visual/EmptyIllustration";
import { HeroResult } from "@/components/result/HeroResult";
import { ConfidenceExplainer } from "@/components/result/ConfidenceExplainer";
import { ResultExplainer } from "@/components/result/ResultExplainer";
import { SimpleScenarioPreview } from "@/components/result/SimpleScenarioPreview";
import { FertileWindowStrip } from "@/components/result/FertileWindowStrip";
import { SharePreview } from "@/components/share/SharePreview";
import { PublicShareCard } from "@/components/share/PublicShareCard";
import { ResultImageExport } from "@/components/share/ResultImageExport";
import { ShareResultDialog } from "@/components/share/ShareResultDialog";
import { StickyResultActions } from "@/components/share/StickyResultActions";
import { SimpleCalendarActions } from "@/components/calendar/SimpleCalendarActions";
import { NextCyclePrompt } from "@/components/retention/NextCyclePrompt";
import { PrivacyTrustCard } from "@/components/trust/PrivacyTrustCard";
import { TrustDrawer } from "@/components/trust/TrustDrawer";
import { DisplayPreferences } from "@/components/settings/DisplayPreferences";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { InstallPromptCard } from "@/components/pwa/InstallPromptCard";
import { LaunchChecklist } from "@/components/dev/LaunchChecklist";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { ToastStack, createToastId, type ToastMessage, type ToastTone } from "@/components/ui/toast";
import { CycleHistory } from "@/components/history/CycleHistory";
import { trackEvent } from "@/lib/analytics";
import { buildNextPeriodReminderEvent, buildNextPeriodReminderIcs, formatDateLong } from "@/lib/cycle";
import { createGrowthDemoState } from "@/lib/demo";
import { calculateSimpleSimulation } from "@/lib/fertility";
import { getResultStateFromSimulation } from "@/lib/personalization";
import { buildResultCopyText } from "@/lib/resultCopy";
import { createDefaultSimpleState, loadSimpleStateWithMeta, saveSimpleState, type SimpleCoreState } from "@/lib/simple-storage";
import { loadPreferences, savePreferences } from "@/lib/preferences";
import { getOrCreateOnboardingVariant, getOnboardingVariantCopy } from "@/content/onboardingVariants";
import { loadMotionPreference, saveMotionPreference, getSystemReducedMotion } from "@/lib/motionPreferences";
import { warnForbiddenCopy } from "@/lib/copyGuard";
import { copyResultToClipboard } from "@/lib/share";
import { getSimpleDateNotice, validateSimpleState } from "@/lib/validation";
import { ES_AR_COPY } from "@/i18n/es-AR";

function formatUpdatedAtLabel(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function downloadFile(filename: string, contents: string, type = "text/calendar;charset=utf-8") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function VentanaFertilApp() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [initialLoad] = useState(() => loadSimpleStateWithMeta());
  const [form, setForm] = useState<SimpleCoreState>(() => initialLoad.state ?? createDefaultSimpleState());
  const [preferences, setPreferences] = useState(() => loadPreferences());
  const [motionPreference, setMotionPreference] = useState(() => loadMotionPreference());
  const [onboardingVariant] = useState(() => getOrCreateOnboardingVariant());
  const [demoPreview, setDemoPreview] = useState(Boolean(initialLoad.state?.isDemo));
  const [savedAt, setSavedAt] = useState<string | null>(() => (initialLoad.state?.isDemo ? null : initialLoad.updatedAt ?? null));
  const [hasTried, setHasTried] = useState(Boolean(initialLoad.state?.lastPeriodStart));
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [trustOpen, setTrustOpen] = useState(false);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [resultFlash, setResultFlash] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>(() =>
    initialLoad.warnings.map((message) => ({
      id: createToastId(),
      tone: "warning" as ToastTone,
      title: "Datos migrados",
      message,
    })),
  );

  const inputRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const persistedStateRef = useRef<SimpleCoreState | null>(initialLoad.state && !initialLoad.state.isDemo ? initialLoad.state : null);
  const resultFlashTimeoutRef = useRef<number | null>(null);
  const initialSnapshotRef = useRef({
    hasResult: Boolean(initialLoad.state?.lastPeriodStart),
    isDemo: Boolean(initialLoad.state?.isDemo),
  });
  const didTrackOnboardingRef = useRef(false);

  useEffect(() => {
    trackEvent("app_loaded", {
      hasResult: initialSnapshotRef.current.hasResult,
      isDemo: initialSnapshotRef.current.isDemo,
      source: "conversion_home",
      eventVersion: "g1",
    });
  }, []);

  useEffect(() => {
    if (didTrackOnboardingRef.current) return;
    didTrackOnboardingRef.current = true;
    const copy = getOnboardingVariantCopy(onboardingVariant);
    trackEvent("onboarding_variant_seen", {
      source: "activation_header",
      variant: onboardingVariant,
      hasResult: initialSnapshotRef.current.hasResult,
      isDemo: initialSnapshotRef.current.isDemo,
      eventVersion: "g1",
    });
    if (process.env.NODE_ENV !== "production") {
      warnForbiddenCopy(
        [
          copy.headline,
          copy.subheadline,
          ES_AR_COPY.safetyShort,
          ES_AR_COPY.share.personalWarning,
          ES_AR_COPY.share.generic,
          ES_AR_COPY.privacy.title,
          ES_AR_COPY.faq.questions.contraception,
        ],
        "onboarding",
      );
    }
  }, [onboardingVariant]);

  const validation = useMemo(() => validateSimpleState(form), [form]);
  const simulationBundle = useMemo(() => calculateSimpleSimulation(form), [form]);
  const simulation = simulationBundle.simulation;
  const copyText = useMemo(() => buildResultCopyText(simulation), [simulation]);
  const dateNotice = useMemo(() => getSimpleDateNotice(form.lastPeriodStart), [form.lastPeriodStart]);
  const showPercentages = !preferences.lowAnxietyMode;
  const lowAnxietyMode = preferences.lowAnxietyMode;
  const hasResult = Boolean(form.lastPeriodStart && !validation.hasErrors);
  const updatedLabel = formatUpdatedAtLabel(savedAt);
  const showHistoryTeaser = initialLoad.entryCount > 0;
  const onboardingCopy = useMemo(() => getOnboardingVariantCopy(onboardingVariant), [onboardingVariant]);
  const reducedMotion = useMemo(() => getSystemReducedMotion() || motionPreference, [motionPreference]);
  const personalizedState = useMemo(() => getResultStateFromSimulation(simulation), [simulation]);

  useEffect(() => {
    return () => {
      if (resultFlashTimeoutRef.current) {
        window.clearTimeout(resultFlashTimeoutRef.current);
      }
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (tone: ToastTone, title: string, message: string) => {
      const id = createToastId();
      setToasts((current) => [...current, { id, tone, title, message }]);
      window.setTimeout(() => dismissToast(id), 3600);
      return id;
    },
    [dismissToast],
  );

  const updateForm = useCallback((patch: Partial<SimpleCoreState>) => {
    const next = { ...form, ...patch };
    setForm(next);

    if (demoPreview) return;

    const nextValidation = validateSimpleState(next);
    if (nextValidation.hasErrors || !next.lastPeriodStart) return;

    const payload = saveSimpleState({
      ...next,
      isDemo: false,
      updatedAt: new Date().toISOString(),
    });
    persistedStateRef.current = payload;
    setSavedAt(payload.updatedAt);
    setResultFlash("Resultado actualizado");
    if (resultFlashTimeoutRef.current) {
      window.clearTimeout(resultFlashTimeoutRef.current);
    }
    resultFlashTimeoutRef.current = window.setTimeout(() => setResultFlash(null), 1800);
  }, [demoPreview, form]);

  const handleCalculate = useCallback(() => {
    setHasTried(true);
    trackEvent("calculate_clicked", {
      hasResult: hasResult,
      isDemo: demoPreview || form.isDemo,
      variant: onboardingVariant,
      source: "calculator",
      eventVersion: "g1",
    });

    if (validation.hasErrors) {
      pushToast("warning", "Revisá los datos", validation.issues[0] ?? "Completá el formulario.");
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    trackEvent("result_generated", {
      hasResult: true,
      isDemo: demoPreview || form.isDemo,
      confidenceBucket: simulation.confidenceBand.toLowerCase().includes("alta")
        ? "high"
        : simulation.confidenceBand.toLowerCase().includes("baja")
          ? "low"
          : "medium",
      resultState: personalizedState === "current" ? "current" : personalizedState === "upcoming" ? "upcoming" : "past",
      variant: onboardingVariant,
      source: "calculator",
      eventVersion: "g1",
    });

    pushToast("success", "Resultado listo", demoPreview ? "Calculamos tu ejemplo visual." : "Calculamos tu ventana fértil estimada.");
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }, [demoPreview, form.isDemo, hasResult, onboardingVariant, personalizedState, pushToast, simulation.confidenceBand, validation.hasErrors, validation.issues]);

  const handleDemo = useCallback(() => {
    const demo = createGrowthDemoState();
    setDemoPreview(true);
    setHasTried(true);
    setForm(demo);
    setSavedAt(null);
    trackEvent("demo_loaded", { hasResult: false, isDemo: true, source: "growth_demo", eventVersion: "g1" });
    pushToast("success", "Modo demo", "Cargamos un ejemplo visual para explorar el flujo.");
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }, [pushToast]);

  const handleUseMyData = useCallback(() => {
    if (persistedStateRef.current) {
      setDemoPreview(false);
      setHasTried(Boolean(persistedStateRef.current.lastPeriodStart));
      setForm(persistedStateRef.current);
      setSavedAt(persistedStateRef.current.updatedAt || null);
      pushToast("neutral", "Tus datos", "Volvimos a tu último estado guardado.");
      return;
    }

    setDemoPreview(false);
    setHasTried(false);
    setSavedAt(null);
    setForm(createDefaultSimpleState());
    pushToast("neutral", "Datos borrados", "Empezamos de cero con un estado limpio.");
  }, [pushToast]);

  const handleSaveExample = useCallback(() => {
    const payload = saveSimpleState({
      ...form,
      isDemo: true,
      updatedAt: new Date().toISOString(),
    });
    setDemoPreview(true);
    setSavedAt(null);
    setHasTried(Boolean(payload.lastPeriodStart));
    pushToast("success", "Ejemplo guardado", "Este ejemplo quedó guardado como referencia local.");
  }, [form, pushToast]);

  const handleCopyResult = useCallback(async () => {
    try {
      trackEvent("copy_result_clicked", { hasResult: true, isDemo: demoPreview, source: "conversion_home", eventVersion: "g1" });
      await copyResultToClipboard(copyText);
      pushToast("success", "Copiado", "El resultado quedó listo para pegar.");
    } catch (error) {
      pushToast("danger", "No se pudo copiar", error instanceof Error ? error.message : "Probá de nuevo.");
    }
  }, [copyText, demoPreview, pushToast]);

  const handleCopyNextPeriodDate = useCallback(async () => {
    const reminder = buildNextPeriodReminderEvent(form.lastPeriodStart, form.averageCycleLength);
    if (!reminder) {
      pushToast("warning", "Sin recordatorio", "Primero cargá una fecha válida.");
      return;
    }

    try {
      await copyResultToClipboard(formatDateLong(reminder.date));
      pushToast("success", "Fecha copiada", "La fecha estimada quedó lista para pegar.");
    } catch (error) {
      pushToast("danger", "No se pudo copiar", error instanceof Error ? error.message : "Probá de nuevo.");
    }
  }, [form.averageCycleLength, form.lastPeriodStart, pushToast]);

  const handleDownloadNextPeriod = useCallback(() => {
    const ics = buildNextPeriodReminderIcs(form.lastPeriodStart, form.averageCycleLength);
    if (!ics) {
      pushToast("warning", "Sin calendario", "Primero necesitamos una fecha válida para crear recordatorios.");
      return;
    }

    try {
      downloadFile("ventana-fertil-proximo-periodo.ics", ics);
      trackEvent("next_period_reminder_downloaded", {
        hasResult: true,
        isDemo: demoPreview,
        source: "next_cycle_prompt",
        eventVersion: "g1",
      });
      pushToast("success", "Recordatorio descargado", "Se generó el evento para el próximo período.");
    } catch {
      pushToast("danger", "No se pudo descargar", "Probá de nuevo en un navegador con descargas habilitadas.");
    }
  }, [demoPreview, form.averageCycleLength, form.lastPeriodStart, pushToast]);

  const handleOpenTrust = useCallback(() => {
    trackEvent("privacy_opened", { hasResult, isDemo: demoPreview, source: "input_card", eventVersion: "g1" });
    setTrustOpen(true);
  }, [demoPreview, hasResult]);

  const handleOpenShareDialog = useCallback(() => {
    setShareDialogOpen(true);
  }, []);

  const handleOpenCalendar = useCallback(() => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlePreferenceChange = useCallback(
    (nextShowPercentages: boolean) => {
      const next = { lowAnxietyMode: !nextShowPercentages };
      setPreferences(next);
      savePreferences(next);
      if (!nextShowPercentages) {
        trackEvent("low_anxiety_mode_enabled", { hasResult, isDemo: demoPreview, source: "display_preferences", eventVersion: "g1" });
      }
    },
    [demoPreview, hasResult],
  );

  const handleMotionPreferenceChange = useCallback(
    (nextReducedMotion: boolean) => {
      setMotionPreference(nextReducedMotion);
      saveMotionPreference(nextReducedMotion);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("vf-reduce-motion", nextReducedMotion || getSystemReducedMotion());
      }
    },
    [],
  );

  const safeLastPeriod = form.lastPeriodStart || "";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("vf-reduce-motion", reducedMotion);
    }
  }, [reducedMotion]);

  if (!mounted) {
    return <AppSkeleton />;
  }

  return (
    <MotionPage reducedMotion={reducedMotion} className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95)_0%,_rgba(252,247,243,1)_40%,_rgba(248,240,235,1)_100%)] text-app-foreground">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-4 py-4 pb-28 sm:px-6 sm:py-6 lg:gap-6 lg:pb-16">
        <ActivationHeader
          eyebrow={ES_AR_COPY.appName}
          headline={onboardingCopy.headline}
          subheadline={onboardingCopy.subheadline}
          onPrimaryAction={handleCalculate}
          onSecondaryAction={handleDemo}
        />

        {demoPreview ? <DemoModeBanner onUseMyData={handleUseMyData} onSaveExample={handleSaveExample} /> : null}
        <InstallPromptCard />

        <div ref={inputRef}>
          <SimplePeriodInput
            state={form}
            onChange={updateForm}
            onCalculate={handleCalculate}
            onDemo={handleDemo}
            onOpenTrust={handleOpenTrust}
            errors={hasTried ? validation.issues : []}
            savedLabel={demoPreview ? "Ejemplo" : updatedLabel ? `Actualizado ${updatedLabel}` : null}
            dateNotice={dateNotice}
          />
        </div>

        {!hasResult ? (
          <MotionPage reducedMotion={reducedMotion} className="rounded-[34px] border border-app-border bg-white/90 p-5 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <EmptyIllustration variant="cycle" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Resultado</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-app-foreground">Cargá cuándo te vino para ver tu ventana fértil estimada.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">Con dos datos armamos una simulación visual del mes. Podés usar el ejemplo si querés probar el flujo en segundos.</p>
              </div>
              <button
                type="button"
                onClick={handleDemo}
                className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(75,44,85,0.5)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/25"
              >
                Ver ejemplo
              </button>
            </div>
          </MotionPage>
        ) : (
          <MotionPage reducedMotion={reducedMotion} className="grid gap-4">
            <div ref={resultRef} className="grid gap-4">
              {resultFlash ? (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  {resultFlash}
                </div>
              ) : null}

              <HeroResult
                simulation={simulation}
                entryCount={initialLoad.entryCount}
                regularity={form.regularity}
                isDemo={demoPreview || form.isDemo}
                lowAnxietyMode={lowAnxietyMode}
                onExplain={() => setExplanationOpen(true)}
                onNextAction={handleOpenCalendar}
              />

              <ConfidenceExplainer simulation={simulation} historyCount={initialLoad.entryCount} regularity={form.regularity} />

              <SimpleScenarioPreview simulation={simulation} isDemo={demoPreview || form.isDemo} />

              <ResultExplainer defaultOpen={false} />

              <FertileWindowStrip simulation={simulation} cycleStart={safeLastPeriod} lowAnxietyMode={lowAnxietyMode} />

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <SharePreview simulation={simulation} onToast={pushToast} onRequestShare={handleOpenShareDialog} isDemo={demoPreview || form.isDemo} />
                <PublicShareCard onNotify={pushToast} isDemo={demoPreview || form.isDemo} />
              </div>

              <ResultImageExport simulation={simulation} onToast={pushToast} />

              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]" ref={calendarRef}>
                <NextCyclePrompt lastPeriodStart={safeLastPeriod} averageCycleLength={form.averageCycleLength} onDownload={handleDownloadNextPeriod} onCopyDate={handleCopyNextPeriodDate} />
                <SimpleCalendarActions simulation={simulation} lastPeriodStart={safeLastPeriod} averageCycleLength={form.averageCycleLength} onToast={pushToast} isDemo={demoPreview || form.isDemo} />
              </div>

              <PrivacyTrustCard isDemo={demoPreview || form.isDemo} />

              <details className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
                <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">
                  Más opciones
                </summary>
                <div className="mt-4 grid gap-4">
                  <DisplayPreferences
                    showPercentages={showPercentages}
                    reducedMotion={motionPreference}
                    onChange={handlePreferenceChange}
                    onMotionChange={handleMotionPreferenceChange}
                  />
                  <FeedbackCard hasResult={hasResult} isDemo={demoPreview || form.isDemo} onNotify={pushToast} />
                </div>
              </details>

              {showHistoryTeaser ? (
                <details className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">
                    Tenés {initialLoad.entryCount} ciclos cargados. Ver histórico
                  </summary>
                  <div className="mt-4">
                    <CycleHistory state={simulationBundle.fullState} simulation={simulation} lowAnxietyMode={lowAnxietyMode} onNotify={pushToast} />
                  </div>
                </details>
              ) : null}
            </div>
          </MotionPage>
        )}

        <SeoContent isDemo={demoPreview || form.isDemo} />

        <section className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
          <p className="text-sm font-semibold text-app-foreground">{ES_AR_COPY.safetyShort} No debe usarse como anticoncepción.</p>
          <details className="mt-3 rounded-[24px] border border-app-border bg-white p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">Ver límites</summary>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-app-muted">
              <p>• La ovulación puede moverse por estrés, enfermedad, sueño, viajes o variaciones hormonales.</p>
              <p>• Si evitar embarazo es importante, no uses solo calendario.</p>
              <p>• Si hubo una situación reciente de preocupación, consultá con ginecología, medicina general o farmacia.</p>
              <p>• Si tenés dudas sobre test de embarazo, consultá con un profesional.</p>
            </div>
          </details>
        </section>

        <LaunchChecklist />
      </main>

      {hasResult ? (
        <StickyResultActions onWhatsApp={handleOpenShareDialog} onCopy={handleCopyResult} onCalendar={handleOpenCalendar} />
      ) : null}

      <VisualExplanationSheet open={explanationOpen} onClose={() => setExplanationOpen(false)} />
      <ShareResultDialog open={shareDialogOpen} message={copyText} onClose={() => setShareDialogOpen(false)} onCopy={handleCopyResult} isDemo={demoPreview || form.isDemo} />
      <TrustDrawer open={trustOpen} onClose={() => setTrustOpen(false)} isDemo={demoPreview || form.isDemo} />
    </MotionPage>
  );
}
