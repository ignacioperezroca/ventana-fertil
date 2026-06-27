"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Egg,
  FlaskConical,
  HeartPulse,
  Info,
  LayoutDashboard,
  MapPin,
  MoonStar,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { buildMonthGrid, formatMonthLabel, shiftMonth, WEEKDAY_LABELS } from "@/lib/calendar";
import {
  buildExposureSummary,
  buildIcsFile,
  buildMarkdownCopy,
  calculateSimulation,
  clamp,
  formatDateInput,
  formatDateLong,
  formatDateShort,
  formatPercent,
  getDayInsightForDate,
  getRiskTone,
  getRelativeOffsetLabel,
  OVULATION_SOURCE_LABELS,
  RISK_BAND_STYLES,
  RISK_LABELS,
  RELATIVE_RISK_TABLE,
  addDays,
  buildReminderEvents,
  dateFromMonthKey,
  monthKey,
  parseDate,
  summarizeBodySignals,
  todayIsoDate,
} from "@/lib/cycle";
import {
  clearStoredState,
  createDefaultDailyLog,
  createDefaultState,
  exportStoredState,
  importStoredState,
  loadStoredState,
  saveStoredState,
} from "@/lib/storage";
import type {
  DailyLog,
  ExposureEntry,
  ExposureMethod,
  LhResult,
  RiskTone,
  SignalLevel,
  VentanaFertilState,
} from "@/types";

type BannerTone = "neutral" | "success" | "warning" | "danger";

const INPUT =
  "w-full rounded-2xl border border-app-border bg-white px-4 py-3 text-sm text-app-foreground outline-none transition placeholder:text-app-muted focus:border-app-primary focus:ring-2 focus:ring-app-primary/20";
const SELECT = INPUT;
const TEXTAREA = `${INPUT} min-h-[120px] resize-y`;
const PANEL =
  "rounded-[28px] border border-app-border bg-app-surface/90 shadow-[0_24px_70px_-42px_rgba(36,22,47,0.35)] backdrop-blur";
const SECTION = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
const SUBTEXT = "text-sm leading-6 text-app-muted";

const EXPOSURE_METHOD_OPTIONS: { value: ExposureMethod; label: string }[] = [
  { value: "sin_proteccion", label: "Sin protección" },
  { value: "retiro", label: "Retiro" },
  { value: "espermicida", label: "Espermicida" },
  { value: "preservativo", label: "Preservativo" },
  { value: "anticoncepcion_emergencia", label: "Anticoncepción de emergencia" },
  { value: "otro", label: "Otro" },
];

const OVULATION_OPTIONS: { value: VentanaFertilState["ovulationMethod"]; label: string; description: string }[] = [
  { value: "calendar", label: "Estimada por calendario", description: "Usa LMP + duración promedio." },
  { value: "known", label: "Fecha conocida", description: "Marcá el día exacto de ovulación." },
  { value: "lh", label: "Fecha estimada por test LH", description: "Ubica la ovulación 24-36 h después del pico." },
  { value: "unsure", label: "No estoy seguro", description: "Mantiene una estimación conservadora." },
];

const REGULARITY_OPTIONS: { value: VentanaFertilState["regularity"]; label: string; description: string }[] = [
  { value: "regular", label: "Regular", description: "El ciclo se mueve poco." },
  { value: "algo_variable", label: "Algo variable", description: "Hay corrimientos de unos días." },
  { value: "irregular", label: "Irregular", description: "La fecha puede moverse bastante." },
  { value: "no_se", label: "No sé", description: "Todavía no tenés una lectura clara." },
];

const LH_RESULT_OPTIONS: { value: LhResult; label: string }[] = [
  { value: "low", label: "Bajo" },
  { value: "high", label: "Alto" },
  { value: "peak", label: "Pico" },
];

const SIGNAL_LEVEL_OPTIONS: { value: SignalLevel; label: string; description: string }[] = [
  { value: "low", label: "Bajo", description: "Más estable o menos intenso." },
  { value: "medium", label: "Medio", description: "Un punto intermedio." },
  { value: "high", label: "Alto", description: "Más cargado o más intenso." },
];

const MUCUS_OPTIONS = [
  { value: "dry", label: "Seco" },
  { value: "sticky", label: "Pegajoso" },
  { value: "creamy", label: "Crema" },
  { value: "watery", label: "Acuoso" },
  { value: "egg_white", label: "Clara de huevo" },
] as const;

const CERVIX_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
] as const;

const REMINDER_TIME_RANGE = "08:00 - 08:15";

function createDemoState() {
  const base = createDefaultState();
  const today = parseDate(todayIsoDate()) ?? new Date();
  const lmp = addDays(today, -14);
  return {
    ...base,
    currentStep: 5,
    selectedDate: formatDateInput(today),
    calendarMonth: monthKey(today),
    lastPeriodStart: formatDateInput(lmp),
    averageCycleLength: 28,
    minimumCycleLength: 26,
    maximumCycleLength: 30,
    regularity: "regular",
    ovulationMethod: "calendar",
    bodySignals: {
      ...base.bodySignals,
      basalBodyTemperature: "36,5",
      cervicalMucus: "watery",
      stressLevel: "medium",
      sleepQuality: "medium",
      notes: "Demo cargada para mostrar la experiencia completa.",
    },
  } satisfies VentanaFertilState;
}

function createExposureRow(): ExposureEntry {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `exposure-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: todayIsoDate(),
    methods: [],
    notes: "",
  };
}

function isStepValid(step: number, state: VentanaFertilState) {
  const issues: string[] = [];

  if (step === 1) {
    if (state.averageCycleLength < 21 || state.averageCycleLength > 45) {
      issues.push("La duración promedio del ciclo debe estar entre 21 y 45 días.");
    }
    if (state.minimumCycleLength > state.maximumCycleLength) {
      issues.push("La duración mínima no puede superar la máxima.");
    }
  }

  if (step === 2) {
    if (state.ovulationMethod === "known" && !parseDate(state.knownOvulationDate)) {
      issues.push("Marcá una fecha válida de ovulación conocida.");
    }
    if (state.ovulationMethod === "lh") {
      if (!parseDate(state.lhSurgeDate)) issues.push("Marcá una fecha válida de pico LH.");
      if (!state.lhResult) issues.push("Elegí el resultado LH.");
    }
    if ((state.ovulationMethod === "calendar" || state.ovulationMethod === "unsure" || state.ovulationMethod === "lh") && !parseDate(state.lastPeriodStart)) {
      issues.push("El primer día de la última menstruación es necesario para esta estimación.");
    }
  }

  return issues;
}

function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function toneClasses(tone: BannerTone) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "danger":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-app-border bg-white text-app-foreground";
  }
}

function toneIcon(tone: BannerTone) {
  switch (tone) {
    case "success":
      return Check;
    case "warning":
      return AlertTriangle;
    case "danger":
      return X;
    default:
      return Info;
  }
}

export default function VentanaFertilApp() {
  const [state, setState] = useState<VentanaFertilState>(createDefaultState);
  const [hydrated, setHydrated] = useState(false);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [dayDraft, setDayDraft] = useState<DailyLog>(createDefaultDailyLog);
  const [banner, setBanner] = useState<{ tone: BannerTone; title: string; message: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Hydrate local-first state from browser storage after the first client paint.
    const saved = loadStoredState();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveStoredState(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (!banner) return;
    const timeout = window.setTimeout(() => setBanner(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [banner]);

  const simulation = useMemo(() => calculateSimulation(state), [state]);
  const activeDayKey = activeDay ?? state.selectedDate;
  const activeDayDate = parseDate(activeDayKey) ?? parseDate(state.selectedDate) ?? new Date();
  const ovulationDate = parseDate(simulation.ovulationDate);
  const fertileStart = parseDate(simulation.fertileWindowStart);
  const fertileEnd = parseDate(simulation.fertileWindowEnd);
  const conservativeStart = parseDate(simulation.conservativeWindowStart);
  const conservativeEnd = parseDate(simulation.conservativeWindowEnd);
  const monthAnchor = useMemo(() => dateFromMonthKey(state.calendarMonth), [state.calendarMonth]);
  const monthCells = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const exposureMap = useMemo(() => {
    const map = new Map<string, ExposureEntry[]>();
    for (const entry of state.exposureEntries) {
      if (!map.has(entry.date)) map.set(entry.date, []);
      map.get(entry.date)?.push(entry);
    }
    return map;
  }, [state.exposureEntries]);

  const activeDayInsight =
    simulation.dayInsights[activeDayKey] ??
    getDayInsightForDate(
      activeDayDate,
      state,
      ovulationDate,
      fertileStart,
      fertileEnd,
      conservativeStart,
      conservativeEnd,
      exposureMap,
    );

  const activeExposureEntries = exposureMap.get(activeDayKey) ?? [];
  const activeLog = state.dailyLogs[activeDayKey] ?? createDefaultDailyLog();
  const validationIssues = isStepValid(state.currentStep, state);
  const canShowSimulation = simulation.valid;
  const displayedRiskTone = simulation.valid ? simulation.selectedRiskTone : ("very-low" as RiskTone);
  const displayedRiskLabel = simulation.valid ? simulation.selectedRiskLabel : "Muy bajo";

  const patchState = (patch: Partial<VentanaFertilState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const patchBodySignals = (patch: Partial<VentanaFertilState["bodySignals"]>) => {
    setState((prev) => ({
      ...prev,
      bodySignals: {
        ...prev.bodySignals,
        ...patch,
      },
    }));
  };

  const patchExposure = (id: string, patch: Partial<ExposureEntry>) => {
    setState((prev) => ({
      ...prev,
      exposureEntries: prev.exposureEntries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    }));
  };

  const addExposure = () => {
    setState((prev) => ({
      ...prev,
      exposureEntries: [...prev.exposureEntries, createExposureRow()],
    }));
  };

  const removeExposure = (id: string) => {
    setState((prev) => ({
      ...prev,
      exposureEntries: prev.exposureEntries.filter((entry) => entry.id !== id),
    }));
  };

  const patchDailyLog = (date: string, patch: Partial<DailyLog>) => {
    setState((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [date]: {
          ...(prev.dailyLogs[date] ?? createDefaultDailyLog()),
          ...patch,
        },
      },
    }));
  };

  const nextStep = () => {
    const issues = isStepValid(state.currentStep, state);
    if (issues.length > 0) {
      setBanner({
        tone: "warning",
        title: "Revisá un detalle",
        message: issues[0],
      });
      return;
    }
    setState((prev) => ({ ...prev, currentStep: Math.min(5, prev.currentStep + 1) }));
    scrollToId("wizard");
  };

  const previousStep = () => setState((prev) => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));

  const handleSelectDay = (iso: string) => {
    setDayDraft(state.dailyLogs[iso] ?? createDefaultDailyLog());
    setState((prev) => ({
      ...prev,
      selectedDate: iso,
      calendarMonth: monthKey(parseDate(iso) ?? new Date()),
    }));
    setActiveDay(iso);
    scrollToId("calendar");
  };

  const handleDemo = () => {
    setState(createDemoState());
    setActiveDay(null);
    setBanner({
      tone: "success",
      title: "Demo cargada",
      message: "Ya podés explorar el tablero, el calendario y los recordatorios de ejemplo.",
    });
    scrollToId("dashboard");
  };

  const handleExport = async () => {
    const payload = exportStoredState(state);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ventana-fertil-datos.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    setBanner({
      tone: "success",
      title: "Exportación lista",
      message: "Se descargó un archivo JSON con tus datos locales.",
    });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const imported = importStoredState(text);
      setState(imported);
      setImportError(null);
      setBanner({
        tone: "success",
        title: "Importación lista",
        message: "Tus datos se restauraron correctamente.",
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "No se pudo importar el archivo.");
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteAll = () => {
    const confirmed = window.confirm("¿Querés borrar todos los datos locales de Ventana Fértil?");
    if (!confirmed) return;
    clearStoredState();
    setState(createDefaultState());
    setActiveDay(null);
    setImportError(null);
    setBanner({
      tone: "danger",
      title: "Datos borrados",
      message: "Se limpiaron el almacenamiento local y la simulación actual.",
    });
  };

  const downloadIcs = () => {
    if (!ovulationDate) return;
    const events = buildReminderEvents(ovulationDate);
    const blob = new Blob([buildIcsFile(events)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ventana-fertil-recordatorios.ics";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    setBanner({
      tone: "success",
      title: "ICS descargado",
      message: "Los 8 recordatorios se prepararon para importar en tu calendario.",
    });
  };

  const copyReminderDescriptions = async () => {
    if (!simulation.reminders.length) return;
    await copyText(buildMarkdownCopy(simulation.reminders));
    setBanner({
      tone: "success",
      title: "Copiado",
      message: "Se copiaron las descripciones de los recordatorios.",
    });
  };

  const copyReminderDetails = async () => {
    if (!simulation.reminders.length) return;
    const text = simulation.reminders
      .map((event) => `${event.title}\n${formatDateLong(event.date)} · ${event.timeLabel}\n${event.description}`)
      .join("\n\n");
    await copyText(text);
    setBanner({
      tone: "success",
      title: "Copiado",
      message: "Se copiaron los detalles de los recordatorios.",
    });
  };

  const copyReminderEvent = async (event: ReturnType<typeof buildReminderEvents>[number]) => {
    await copyText(`${event.title}\n${formatDateLong(event.date)} · ${event.timeLabel}\n${event.description}`);
    setBanner({
      tone: "success",
      title: "Evento copiado",
      message: "Podés pegarlo donde necesites.",
    });
  };

  const saveDayLog = () => {
    if (!activeDayKey) return;
    patchDailyLog(activeDayKey, dayDraft);
    setActiveDay(null);
    setBanner({
      tone: "success",
      title: "Registro guardado",
      message: "La nota quedó guardada en el almacenamiento local.",
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf6f2_0%,#fffdfb_40%,#f8f2ee_100%)] text-app-foreground">
      {banner ? (
        <div className="fixed left-0 right-0 top-3 z-50 px-3 sm:px-6">
          <div className={`mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl ${toneClasses(banner.tone)}`}>
            {(() => {
              const Icon = toneIcon(banner.tone);
              return <Icon className="mt-0.5 size-4 shrink-0" />;
            })()}
            <div className="min-w-0">
              <p className="text-sm font-semibold">{banner.title}</p>
              <p className="text-sm leading-6 opacity-90">{banner.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-app-border/70 bg-[rgba(255,250,247,0.86)] backdrop-blur-xl">
        <div className={`${SECTION} flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-app-primary text-lg text-white shadow-sm">
              🥚
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Ventana Fértil</p>
              <p className="text-sm text-app-muted">Guardado local · sin cuenta · enfoque educativo</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToId("wizard")}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary hover:text-app-primary"
            >
              <Sparkles className="size-4" />
              Simular
            </button>
            <button
              type="button"
              onClick={() => scrollToId("dashboard")}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary hover:text-app-primary"
            >
              <LayoutDashboard className="size-4" />
              Tablero
            </button>
            <button
              type="button"
              onClick={handleDemo}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90"
            >
              <Sparkles className="size-4" />
              Demo
            </button>
          </div>
        </div>
      </header>

      <main className="pb-16">
        <section className={`${SECTION} pt-8 sm:pt-10`} id="hero">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-app-muted">
                <Egg className="size-3.5 text-app-primary" />
                🥚 Ventana Fértil
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-app-foreground sm:text-5xl">
                  Entendé tu ventana fértil, día por día.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-app-muted">
                  Un simulador visual para comprender ovulación, días fértiles, incertidumbre del ciclo y recordatorios, sin promesas falsas.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollToId("wizard")}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-app-primary px-5 text-sm font-semibold text-white transition hover:bg-app-primary/90"
                >
                  Simular mi ciclo
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDemo}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary hover:text-app-primary"
                >
                  Ver demo
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`${PANEL} p-4`}>
                  <p className="text-sm font-semibold text-app-foreground">Aviso claro</p>
                  <p className="mt-2 text-sm leading-6 text-app-muted">
                    Esta herramienta es educativa. No reemplaza consulta médica y no debe usarse como anticoncepción.
                  </p>
                </div>
                <div className={`${PANEL} p-4`}>
                  <p className="text-sm font-semibold text-app-foreground">Enfoque local-first</p>
                  <p className="mt-2 text-sm leading-6 text-app-muted">
                    Tus datos quedan en el navegador, con exportación JSON e importación manual cuando la necesites.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${PANEL} overflow-hidden`}>
              <div className="border-b border-app-border/70 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Vista previa</p>
                <h2 className="mt-1 text-xl font-semibold text-app-foreground">Lectura del ciclo</h2>
              </div>
              <div className="grid gap-5 p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-app-border bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">Pico</p>
                    <p className="mt-2 text-lg font-semibold text-app-foreground">O-3</p>
                    <p className="text-sm text-app-muted">26.7%</p>
                  </div>
                  <div className="rounded-2xl border border-app-border bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">Ventana</p>
                    <p className="mt-2 text-lg font-semibold text-app-foreground">8 días</p>
                    <p className="text-sm text-app-muted">O-6 a O+1</p>
                  </div>
                  <div className="rounded-2xl border border-app-border bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">Confianza</p>
                    <p className="mt-2 text-lg font-semibold text-app-foreground">
                      {simulation.valid ? `${simulation.confidenceScore}%` : "—"}
                    </p>
                    <p className="text-sm text-app-muted">
                      {simulation.valid ? simulation.confidenceBand : "Cuando cargues datos"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-app-border bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">Marcador</p>
                    <p className="mt-2 text-lg font-semibold text-app-foreground">
                      {simulation.valid ? displayedRiskLabel : "Muy bajo"}
                    </p>
                    <p className="text-sm text-app-muted">
                      {simulation.valid ? formatPercent(simulation.selectedMarkerPercent) : "Base educativa"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm text-app-muted">
                    <span>Curva relativa</span>
                    <span>O-6 · O+1</span>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {RELATIVE_RISK_TABLE.map((point) => {
                      const tone = getRiskTone(point.percent);
                      const height = Math.max(16, Math.round((point.percent / 27) * 124));
                      const isPeak = point.offset === -3 || point.offset === -2;
                      const barStyle =
                        tone === "very-high"
                          ? "bg-[linear-gradient(180deg,#b73468_0%,#8f2f52_100%)]"
                          : tone === "high"
                            ? "bg-[linear-gradient(180deg,#d25d79_0%,#b73f61_100%)]"
                            : tone === "moderate"
                              ? "bg-[linear-gradient(180deg,#e5a038_0%,#ce7b24_100%)]"
                              : tone === "low"
                                ? "bg-[linear-gradient(180deg,#edd98b_0%,#dfb94c_100%)]"
                                : "bg-[linear-gradient(180deg,#badcc8_0%,#72b48a_100%)]";

                      return (
                        <div key={point.label} className="flex flex-col items-center gap-2">
                          <div className="flex h-36 w-full items-end justify-center rounded-2xl border border-app-border bg-white px-2 py-2">
                            <div
                              className={`relative w-full rounded-2xl ${barStyle} ${isPeak ? "ring-2 ring-app-primary/20" : ""}`}
                              style={{ height }}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-semibold text-app-muted">{point.label}</p>
                            <p className="text-[11px] text-app-muted">{point.percent.toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-sm leading-6 text-app-muted">
                  El marcador sube antes de ovular, alcanza su pico alrededor de O-3/O-2 y baja después de la ovulación.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${SECTION} mt-10`} id="wizard">
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Paso a paso</p>
            <h2 className="text-2xl font-semibold text-app-foreground">Onboarding guiado</h2>
            <p className={SUBTEXT}>Cargá tus datos una sola vez y después podés seguir ajustando la lectura con notas, señales corporales y fechas de exposición.</p>
          </div>

          <div className={`${PANEL} overflow-hidden`}>
            <div className="border-b border-app-border/70 px-4 py-4 sm:px-6">
              <div className="grid gap-2 sm:grid-cols-5">
                {[
                  "Datos del ciclo",
                  "Ovulación",
                  "Cuerpo",
                  "Exposiciones",
                  "Resultados",
                ].map((label, index) => {
                  const step = index + 1;
                  const active = state.currentStep === step;
                  const done = state.currentStep > step;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, currentStep: step }))}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-app-primary bg-app-primary/10 text-app-primary"
                          : done
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-app-border bg-white text-app-muted hover:border-app-primary/40 hover:text-app-foreground"
                      }`}
                    >
                      <span className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${active ? "bg-app-primary text-white" : done ? "bg-emerald-500 text-white" : "bg-app-surface-2 text-app-muted"}`}>
                        {done ? <Check className="size-4" /> : step}
                      </span>
                      <span className="text-sm font-medium leading-5">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-5">
                {state.currentStep === 1 ? (
                  <section className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-app-foreground">Datos del ciclo</h3>
                      <p className={SUBTEXT}>Empezamos por la base: último período, duración promedio y cuánto suele moverse tu ciclo.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Primer día de la última menstruación" hint="Obligatorio salvo que ya conozcas la ovulación.">
                        <input
                          type="date"
                          className={INPUT}
                          value={state.lastPeriodStart}
                          onChange={(event) => patchState({ lastPeriodStart: event.target.value })}
                        />
                      </Field>
                      <Field label="Duración promedio del ciclo" hint="Ideal entre 21 y 45 días.">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={21}
                          max={45}
                          className={INPUT}
                          value={state.averageCycleLength}
                          onChange={(event) => patchState({ averageCycleLength: Number(event.target.value) })}
                        />
                      </Field>
                      <Field label="Variabilidad mínima" hint="Tu rango más corto.">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={21}
                          max={45}
                          className={INPUT}
                          value={state.minimumCycleLength}
                          onChange={(event) => patchState({ minimumCycleLength: Number(event.target.value) })}
                        />
                      </Field>
                      <Field label="Variabilidad máxima" hint="Tu rango más largo.">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={21}
                          max={45}
                          className={INPUT}
                          value={state.maximumCycleLength}
                          onChange={(event) => patchState({ maximumCycleLength: Number(event.target.value) })}
                        />
                      </Field>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-app-foreground">Regularidad</p>
                        <p className="text-sm text-app-muted">Esta lectura ajusta la confianza y el margen conservador.</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {REGULARITY_OPTIONS.map((option) => {
                          const active = state.regularity === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => patchState({ regularity: option.value })}
                              className={`rounded-2xl border px-4 py-4 text-left transition ${
                                active
                                  ? "border-app-primary bg-app-primary/10"
                                  : "border-app-border bg-white hover:border-app-primary/40"
                              }`}
                            >
                              <p className="text-sm font-semibold text-app-foreground">{option.label}</p>
                              <p className="mt-1 text-sm leading-6 text-app-muted">{option.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {validationIssues.length > 0 ? <ValidationMessage issues={validationIssues} /> : null}
                  </section>
                ) : null}

                {state.currentStep === 2 ? (
                  <section className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-app-foreground">Ovulación</h3>
                      <p className={SUBTEXT}>Elegí la referencia que mejor se acerque a tu situación. El simulador mantiene el tono conservador en todos los casos.</p>
                    </div>
                    <div className="grid gap-3">
                      {OVULATION_OPTIONS.map((option) => {
                        const active = state.ovulationMethod === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => patchState({ ovulationMethod: option.value })}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                              active ? "border-app-primary bg-app-primary/10" : "border-app-border bg-white hover:border-app-primary/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-app-foreground">{option.label}</p>
                                <p className="mt-1 text-sm leading-6 text-app-muted">{option.description}</p>
                              </div>
                              <span className={`flex size-6 items-center justify-center rounded-full border ${active ? "border-app-primary bg-app-primary text-white" : "border-app-border bg-white text-transparent"}`}>
                                <Check className="size-3.5" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {state.ovulationMethod === "known" ? (
                      <Field label="Fecha exacta de ovulación">
                        <input
                          type="date"
                          className={INPUT}
                          value={state.knownOvulationDate}
                          onChange={(event) => patchState({ knownOvulationDate: event.target.value })}
                        />
                      </Field>
                    ) : null}

                    {state.ovulationMethod === "lh" ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Fecha del pico LH">
                          <input
                            type="date"
                            className={INPUT}
                            value={state.lhSurgeDate}
                            onChange={(event) => patchState({ lhSurgeDate: event.target.value })}
                          />
                        </Field>
                        <Field label="Resultado LH">
                          <select
                            className={SELECT}
                            value={state.lhResult}
                            onChange={(event) => patchState({ lhResult: event.target.value as LhResult | "" })}
                          >
                            <option value="">Elegí un resultado</option>
                            {LH_RESULT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    ) : null}

                    <div className={`${PANEL} p-4`}>
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 size-5 text-app-primary" />
                        <div>
                          <p className="font-semibold text-app-foreground">Cómo se interpreta</p>
                          <p className="mt-1 text-sm leading-6 text-app-muted">
                            Si elegís calendario, el cálculo usa promedio del ciclo - 14. Si elegís LH, toma la ovulación como una estimación 24-36 horas después del pico.
                          </p>
                        </div>
                      </div>
                    </div>

                    {validationIssues.length > 0 ? <ValidationMessage issues={validationIssues} /> : null}
                  </section>
                ) : null}

                {state.currentStep === 3 ? (
                  <section className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-app-foreground">Datos opcionales de cuerpo</h3>
                      <p className={SUBTEXT}>Estos datos no diagnostican nada, pero ayudan a leer mejor la incertidumbre y a mirar el ciclo con más contexto.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Basal body temperature" hint="Si la cargás, la usamos como apoyo retrospectivo.">
                        <input
                          type="text"
                          className={INPUT}
                          placeholder="36,5"
                          value={state.bodySignals.basalBodyTemperature}
                          onChange={(event) => patchBodySignals({ basalBodyTemperature: event.target.value })}
                        />
                      </Field>
                      <Field label="Moco cervical">
                        <select
                          className={SELECT}
                          value={state.bodySignals.cervicalMucus}
                          onChange={(event) => patchBodySignals({ cervicalMucus: event.target.value as VentanaFertilState["bodySignals"]["cervicalMucus"] })}
                        >
                          <option value="">Elegí una opción</option>
                          {MUCUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Posición del cérvix">
                        <select
                          className={SELECT}
                          value={state.bodySignals.cervixPosition}
                          onChange={(event) => patchBodySignals({ cervixPosition: event.target.value as VentanaFertilState["bodySignals"]["cervixPosition"] })}
                        >
                          <option value="">Elegí una opción</option>
                          {CERVIX_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Estrés">
                        <div className="grid grid-cols-3 gap-2">
                          {SIGNAL_LEVEL_OPTIONS.map((option) => {
                            const active = state.bodySignals.stressLevel === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => patchBodySignals({ stressLevel: option.value })}
                                className={`rounded-2xl border px-3 py-3 text-sm transition ${
                                  active ? "border-app-primary bg-app-primary/10 text-app-primary" : "border-app-border bg-white text-app-foreground hover:border-app-primary/40"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </Field>
                      <Field label="Calidad de sueño">
                        <div className="grid grid-cols-3 gap-2">
                          {SIGNAL_LEVEL_OPTIONS.map((option) => {
                            const active = state.bodySignals.sleepQuality === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => patchBodySignals({ sleepQuality: option.value })}
                                className={`rounded-2xl border px-3 py-3 text-sm transition ${
                                  active ? "border-app-primary bg-app-primary/10 text-app-primary" : "border-app-border bg-white text-app-foreground hover:border-app-primary/40"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </Field>
                      <Field label="Viaje o enfermedad">
                        <button
                          type="button"
                          aria-pressed={state.bodySignals.travelOrIllness}
                          onClick={() => patchBodySignals({ travelOrIllness: !state.bodySignals.travelOrIllness })}
                          className={`inline-flex h-12 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                            state.bodySignals.travelOrIllness
                              ? "border-app-primary bg-app-primary/10 text-app-primary"
                              : "border-app-border bg-white text-app-foreground hover:border-app-primary/40"
                          }`}
                        >
                          {state.bodySignals.travelOrIllness ? <Check className="size-4" /> : <X className="size-4" />}
                          {state.bodySignals.travelOrIllness ? "Sí" : "No"}
                        </button>
                      </Field>
                      <Field label="Pulso en reposo">
                        <input
                          type="text"
                          className={INPUT}
                          placeholder="Ej. 62"
                          value={state.bodySignals.restingHeartRate}
                          onChange={(event) => patchBodySignals({ restingHeartRate: event.target.value })}
                        />
                      </Field>
                      <Field label="Tendencia de temperatura de muñeca">
                        <input
                          type="text"
                          className={INPUT}
                          placeholder="Baja / estable / alta"
                          value={state.bodySignals.wristTemperatureTrend}
                          onChange={(event) => patchBodySignals({ wristTemperatureTrend: event.target.value })}
                        />
                      </Field>
                    </div>

                    <details className={`${PANEL} p-4`}>
                      <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">
                        Marcadores hormonales manuales avanzados
                      </summary>
                      <p className="mt-2 text-sm leading-6 text-app-muted">
                        Esta sección es para registrar señales manuales, no para diagnóstico.
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="LH">
                          <input
                            type="text"
                            className={INPUT}
                            value={state.bodySignals.hormoneLh}
                            onChange={(event) => patchBodySignals({ hormoneLh: event.target.value })}
                          />
                        </Field>
                        <Field label="Estrógeno">
                          <input
                            type="text"
                            className={INPUT}
                            value={state.bodySignals.hormoneEstrogen}
                            onChange={(event) => patchBodySignals({ hormoneEstrogen: event.target.value })}
                          />
                        </Field>
                        <Field label="Progesterona">
                          <input
                            type="text"
                            className={INPUT}
                            value={state.bodySignals.hormoneProgesterone}
                            onChange={(event) => patchBodySignals({ hormoneProgesterone: event.target.value })}
                          />
                        </Field>
                        <Field label="FSH">
                          <input
                            type="text"
                            className={INPUT}
                            value={state.bodySignals.hormoneFsh}
                            onChange={(event) => patchBodySignals({ hormoneFsh: event.target.value })}
                          />
                        </Field>
                      </div>
                    </details>

                    <Field label="Notas del cuerpo">
                      <textarea
                        className={TEXTAREA}
                        value={state.bodySignals.notes}
                        onChange={(event) => patchBodySignals({ notes: event.target.value })}
                        placeholder="Ej. viaje, estrés, sueño raro, síntomas, contexto."
                      />
                    </Field>
                  </section>
                ) : null}

                {state.currentStep === 4 ? (
                  <section className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-app-foreground">Fechas de sexo / exposición</h3>
                        <p className={SUBTEXT}>Agregá una o varias fechas. Cada una puede llevar métodos, notas y luego aparece en el calendario.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addExposure}
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90"
                      >
                        <Plus className="size-4" />
                        Agregar fecha
                      </button>
                    </div>

                    {state.exposureEntries.length === 0 ? (
                      <div className={`${PANEL} p-5`}>
                        <p className="font-semibold text-app-foreground">Todavía no cargaste fechas.</p>
                        <p className="mt-2 text-sm leading-6 text-app-muted">
                          Si no querés evaluar exposición personal, podés dejar este paso vacío.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {state.exposureEntries.map((entry, index) => (
                          <div key={entry.id} className={`${PANEL} p-4`}>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-app-foreground">Exposición {index + 1}</p>
                                <p className="text-sm text-app-muted">La fecha se usa para mostrar el marcador educativo por día.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExposure(entry.id)}
                                className="inline-flex h-10 items-center gap-2 rounded-full border border-app-border bg-white px-3 text-sm font-medium text-app-muted transition hover:border-rose-200 hover:text-rose-700"
                              >
                                <Trash2 className="size-4" />
                                Quitar
                              </button>
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <Field label="Fecha">
                                <input
                                  type="date"
                                  className={INPUT}
                                  value={entry.date}
                                  onChange={(event) => patchExposure(entry.id, { date: event.target.value })}
                                />
                              </Field>
                              <Field label="Notas">
                                <input
                                  type="text"
                                  className={INPUT}
                                  value={entry.notes}
                                  onChange={(event) => patchExposure(entry.id, { notes: event.target.value })}
                                  placeholder="Contexto breve"
                                />
                              </Field>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-medium text-app-foreground">Métodos</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {EXPOSURE_METHOD_OPTIONS.map((option) => {
                                  const active = entry.methods.includes(option.value);
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => {
                                        const next = active
                                          ? entry.methods.filter((method) => method !== option.value)
                                          : [...entry.methods, option.value];
                                        patchExposure(entry.id, { methods: next });
                                      }}
                                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                        active
                                          ? "border-app-primary bg-app-primary/10 text-app-primary"
                                          : "border-app-border bg-white text-app-foreground hover:border-app-primary/40"
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ) : null}

                {state.currentStep === 5 ? (
                  <section className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-app-foreground">Resultados</h3>
                      <p className={SUBTEXT}>Revisá el resumen antes de pasar al tablero principal. Todo sigue siendo una estimación educativa.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <MiniMetric label="Ovulación estimada" value={simulation.ovulationDate ? formatDateLong(simulation.ovulationDate) : "—"} helper={OVULATION_SOURCE_LABELS[simulation.ovulationSource]} />
                      <MiniMetric label="Ventana fértil" value={simulation.fertileWindowStart ? `${formatDateLong(simulation.fertileWindowStart)} · ${formatDateLong(simulation.fertileWindowEnd)}` : "—"} helper="O-6 a O+1" />
                      <MiniMetric label="Confianza" value={simulation.valid ? `${simulation.confidenceScore}%` : "—"} helper={simulation.valid ? simulation.confidenceBand : "Esperando datos"} />
                      <MiniMetric label="Incertidumbre" value={simulation.valid ? `${simulation.uncertaintyScore}%` : "—"} helper={simulation.valid ? simulation.uncertaintyBand : "Esperando datos"} />
                      <MiniMetric label="Día analizado" value={formatDateLong(simulation.analysisDate)} helper={simulation.selectedDateCycleDay ? `Día ${simulation.selectedDateCycleDay}` : "Sin LMP"} />
                      <MiniMetric label="Marcador" value={simulation.valid ? `${displayedRiskLabel} · ${formatPercent(simulation.selectedMarkerPercent)}` : "Muy bajo"} helper={simulation.valid ? simulation.selectedWindowLabel : "Base educativa"} />
                    </div>
                    <div className={`${PANEL} p-4`}>
                      <p className="text-sm font-semibold text-app-foreground">Siguiente paso</p>
                      <p className="mt-2 text-sm leading-6 text-app-muted">
                        Bajá al tablero para ver la lectura completa, el calendario, los recordatorios y la exportación local.
                      </p>
                    </div>
                  </section>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className={`${PANEL} p-5`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Guía del paso</p>
                  <h3 className="mt-1 text-lg font-semibold text-app-foreground">
                    {state.currentStep === 1
                      ? "Ciclo"
                      : state.currentStep === 2
                        ? "Ovulación"
                        : state.currentStep === 3
                          ? "Cuerpo"
                          : state.currentStep === 4
                            ? "Exposiciones"
                            : "Resultados"}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-app-muted">
                    {state.currentStep === 1
                      ? "Acá definimos la base de cálculo y el rango de variación."
                      : state.currentStep === 2
                        ? "Elegí la mejor referencia disponible para ubicar O."
                        : state.currentStep === 3
                          ? "Las señales corporales ayudan a leer la incertidumbre, no a diagnosticar."
                          : state.currentStep === 4
                            ? "Las fechas de exposición se muestran como marcadores educativos por día."
                            : "Te dejamos un resumen antes del tablero visual y el calendario."}
                  </p>
                </div>

                <div className={`${PANEL} p-5`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Estado</p>
                  <div className="mt-4 grid gap-3">
                    <StatusRow label="Ventana estimada" value={simulation.valid ? `${formatDateLong(simulation.fertileWindowStart)} · ${formatDateLong(simulation.fertileWindowEnd)}` : "Pendiente"} />
                    <StatusRow label="Pico principal" value={simulation.valid ? `O-3 · ${formatPercent(RELATIVE_RISK_TABLE[3].percent)}` : "Pendiente"} />
                    <StatusRow label="Confianza" value={simulation.valid ? `${simulation.confidenceScore}%` : "Pendiente"} />
                    <StatusRow label="Incertidumbre" value={simulation.valid ? `${simulation.uncertaintyScore}%` : "Pendiente"} />
                  </div>
                  {validationIssues.length > 0 ? <ValidationMessage className="mt-4" issues={validationIssues} /> : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={previousStep}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary/40"
                  >
                    <ArrowLeft className="size-4" />
                    Atrás
                  </button>
                  {state.currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90"
                    >
                      Continuar
                      <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => scrollToId("dashboard")}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90"
                    >
                      Ver tablero
                      <LayoutDashboard className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${SECTION} mt-10`} id="dashboard">
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Tablero</p>
            <h2 className="text-2xl font-semibold text-app-foreground">Dashboard principal</h2>
            <p className={SUBTEXT}>Acá ves la lectura del día analizado, el rango fértil, la incertidumbre y el marcador relativo del modelo.</p>
          </div>

          {!canShowSimulation ? (
            <EmptyState
              icon={CalendarDays}
              title="Cargá los datos del ciclo para ver el tablero"
              message="La simulación se activa cuando completás el mínimo necesario. Si querés, probá primero la demo para ver cómo se ve la experiencia completa."
              actionLabel="Ver demo"
              onAction={handleDemo}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={CalendarDays}
                  label="Día actual del ciclo"
                  value={simulation.cycleDayToday ? `Día ${simulation.cycleDayToday}` : "—"}
                  detail={simulation.cycleDayToday ? formatDateLong(simulation.analysisDate) : "Necesitás una LMP válida"}
                />
                <MetricCard
                  icon={MapPin}
                  label="Ovulación estimada"
                  value={simulation.ovulationDate ? formatDateLong(simulation.ovulationDate) : "—"}
                  detail={OVULATION_SOURCE_LABELS[simulation.ovulationSource]}
                />
                <MetricCard
                  icon={CalendarRange}
                  label="Ventana fértil estimada"
                  value={simulation.fertileWindowStart ? `${formatDateShort(simulation.fertileWindowStart)} – ${formatDateShort(simulation.fertileWindowEnd)}` : "—"}
                  detail="O-6 a O+1"
                />
                <MetricCard
                  icon={FlaskConical}
                  label="Días de mayor atención"
                  value="O-4 a O-1"
                  detail="Cluster pico"
                />
                <MetricCard
                  icon={HeartPulse}
                  label="Nivel de confianza"
                  value={`${simulation.confidenceScore}%`}
                  detail={simulation.confidenceBand}
                  accent
                />
                <MetricCard
                  icon={MoonStar}
                  label="Incertidumbre estimada"
                  value={`${simulation.uncertaintyScore}%`}
                  detail={simulation.uncertaintyBand}
                />
                <MetricCard
                  icon={CalendarDays}
                  label="Fecha analizada"
                  value={formatDateLong(simulation.analysisDate)}
                  detail="Día seleccionado"
                />
                <MetricCard
                  icon={Sparkles}
                  label="Marcador de riesgo"
                  value={displayedRiskLabel}
                  detail={formatPercent(simulation.selectedMarkerPercent)}
                  tone={displayedRiskTone}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                <div className={`${PANEL} p-5`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Lectura del día</p>
                      <h3 className="text-xl font-semibold text-app-foreground">
                        {simulation.selectedDateCycleDay ? `Día ${simulation.selectedDateCycleDay}` : "Sin cálculo todavía"}
                      </h3>
                    </div>
                    <Badge tone={displayedRiskTone}>{displayedRiskLabel}</Badge>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-app-muted">{simulation.selectedReason}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-app-border bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Marcador</p>
                      <p className="mt-2 text-lg font-semibold text-app-foreground">{formatPercent(simulation.selectedMarkerPercent)}</p>
                    </div>
                    <div className="rounded-2xl border border-app-border bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Relación</p>
                      <p className="mt-2 text-lg font-semibold text-app-foreground">{getRelativeOffsetLabel(simulation.selectedDateOffset ?? 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-app-border bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Ventana</p>
                      <p className="mt-2 text-lg font-semibold text-app-foreground">{simulation.selectedWindowLabel}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-app-muted">
                    Este marcador depende de que la fecha estimada de ovulación sea correcta. Si el ciclo varía, la ventana puede moverse.
                  </p>
                </div>

                <div className={`${PANEL} p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Índice de incertidumbre</p>
                      <h3 className="text-xl font-semibold text-app-foreground">{simulation.uncertaintyScore}/100</h3>
                    </div>
                    <Badge tone={riskToneFromScore(simulation.uncertaintyScore)}>{simulation.uncertaintyBand}</Badge>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-app-surface-2">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#e4b733_0%,#d86f8f_55%,#932b52_100%)]"
                      style={{ width: `${clamp(simulation.uncertaintyScore, 0, 100)}%` }}
                    />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-app-muted">{simulation.uncertaintyHint}</p>
                  <div className="mt-4 rounded-2xl border border-app-border bg-white p-4">
                    <p className="text-sm font-semibold text-app-foreground">Por qué importa</p>
                    <p className="mt-2 text-sm leading-6 text-app-muted">
                      No ajustamos el marcador base por incertidumbre. La usamos para explicarte cuánta prudencia conviene al leer el calendario.
                    </p>
                  </div>
                </div>
              </div>

              {simulation.exposureInsights.length > 0 ? (
                <div className={`${PANEL} p-5`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Exposiciones registradas</p>
                      <h3 className="text-xl font-semibold text-app-foreground">Marcadores por fecha</h3>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {simulation.exposureInsights.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleSelectDay(entry.date)}
                        className="rounded-2xl border border-app-border bg-white p-4 text-left transition hover:border-app-primary/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-app-foreground">{entry.label}</p>
                            <p className="mt-1 text-sm text-app-muted">{buildExposureSummaryFromMethods(entry.methods)}</p>
                          </div>
                          <Badge tone={entry.riskTone}>{entry.riskLabel}</Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-app-muted">{entry.explanation}</p>
                        {entry.notes ? <p className="mt-3 text-sm text-app-foreground">Notas: {entry.notes}</p> : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>

        <section className={`${SECTION} mt-10`} id="calendar">
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Calendario</p>
            <h2 className="text-2xl font-semibold text-app-foreground">Vista mensual</h2>
            <p className={SUBTEXT}>La grilla marca ventana fértil, pico, ovulación, exposiciones y notas. Tocá cualquier día para abrir su detalle.</p>
          </div>

          <div className={`${PANEL} p-4 sm:p-5`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Mes</p>
                <h3 className="text-xl font-semibold text-app-foreground">{formatMonthLabel(monthAnchor)}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, calendarMonth: formatDateInput(shiftMonth(prev.calendarMonth, -1)) }))}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary/40"
                >
                  <ChevronLeft className="size-4" />
                  Mes anterior
                </button>
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, calendarMonth: formatDateInput(shiftMonth(prev.calendarMonth, 1)) }))}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary/40"
                >
                  Mes siguiente
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-2">
              {monthCells.map((cell) => {
                const insight =
                  simulation.dayInsights[cell.iso] ??
                  getDayInsightForDate(
                    cell.date,
                    state,
                    ovulationDate,
                    fertileStart,
                    fertileEnd,
                    conservativeStart,
                    conservativeEnd,
                    exposureMap,
                  );
                const isSelected = cell.iso === activeDayKey;
                const isToday = cell.iso === todayIsoDate();
                const hasExposure = (exposureMap.get(cell.iso)?.length ?? 0) > 0;
                const hasNote = Boolean(state.dailyLogs[cell.iso]?.note.trim() || state.dailyLogs[cell.iso]?.symptoms.trim());
                const hasBody = Boolean(state.dailyLogs[cell.iso]?.bbt.trim() || state.dailyLogs[cell.iso]?.mucus || state.dailyLogs[cell.iso]?.lhResult);
                const markerToneClass =
                  insight.riskTone === "very-high"
                    ? "bg-rose-100 text-rose-900"
                    : insight.riskTone === "high"
                      ? "bg-rose-50 text-rose-800"
                      : insight.riskTone === "moderate"
                        ? "bg-orange-50 text-orange-800"
                        : insight.riskTone === "low"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-emerald-50 text-emerald-800";
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => handleSelectDay(cell.iso)}
                    className={`min-h-[92px] rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-app-primary/20 ${
                      isSelected
                        ? "border-app-primary bg-app-primary/8"
                        : cell.inCurrentMonth
                          ? "border-app-border bg-white hover:border-app-primary/40"
                          : "border-app-border/70 bg-app-surface-2/60 text-app-muted"
                    } ${insight.fertileWindow ? "ring-1 ring-app-primary/15" : ""}`}
                    aria-label={`${formatDateLong(cell.iso)} ${insight.label} ${insight.riskLabel}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${cell.inCurrentMonth ? "text-app-foreground" : "text-app-muted"}`}>{cell.date.getDate()}</p>
                        <p className="text-[11px] text-app-muted">{insight.label}</p>
                      </div>
                      {isToday ? <span className="rounded-full bg-app-primary px-2 py-1 text-[10px] font-semibold text-white">Hoy</span> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                      {insight.fertileWindow ? <span className={`rounded-full px-2 py-1 ${markerToneClass}`}>{insight.riskLabel}</span> : null}
                      {insight.peakWindow ? <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-800">Pico</span> : null}
                      {!insight.fertileWindow && cell.inCurrentMonth ? <span className="rounded-full bg-app-surface-2 px-2 py-1 text-app-muted">~0%</span> : null}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-app-muted">
                      {hasExposure ? <span className="rounded-full bg-app-primary/10 px-2 py-1 text-app-primary">Expo</span> : null}
                      {hasNote ? <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">Nota</span> : null}
                      {hasBody ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-800">Cuerpo</span> : null}
                      {isSelected ? <span className="rounded-full bg-app-primary/10 px-2 py-1 text-app-primary">Seleccionado</span> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`${SECTION} mt-10`} id="risk-curve">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <RiskCurveSection />
            <RelativeRiskTableSection />
          </div>
        </section>

        <section className={`${SECTION} mt-10`} id="metrics">
          <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <KeyMetricsSection simulation={simulation} />
            <ConservativeWindowSection simulation={simulation} />
          </div>
        </section>

        <section className={`${SECTION} mt-10`} id="reminders">
          <ReminderSection
            simulation={simulation}
            downloadIcs={downloadIcs}
            copyReminderDescriptions={copyReminderDescriptions}
            copyReminderDetails={copyReminderDetails}
            copyReminderEvent={copyReminderEvent}
          />
        </section>

        <section className={`${SECTION} mt-10`} id="education">
          <EducationSection />
        </section>

        <section className={`${SECTION} mt-10`} id="privacy">
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <PrivacySection
              handleExport={handleExport}
              handleImportClick={handleImportClick}
              handleDeleteAll={handleDeleteAll}
              fileInputRef={fileInputRef}
              handleImportFile={handleImportFile}
              importError={importError}
            />
            <SafetySection />
          </div>
        </section>
      </main>

      {activeDay ? (
      <DayDrawer
          date={activeDayKey}
          insight={activeDayInsight}
          log={activeLog}
          exposureEntries={activeExposureEntries}
          bodySignals={state.bodySignals}
          draft={dayDraft}
          onClose={() => setActiveDay(null)}
          onDraftChange={setDayDraft}
          onSave={saveDayLog}
        />
      ) : null}
    </div>
  );

  function riskToneFromScore(score: number): RiskTone {
    if (score >= 76) return "very-high";
    if (score >= 51) return "high";
    if (score >= 26) return "moderate";
    if (score >= 1) return "low";
    return "very-low";
  }
}

function buildExposureSummaryFromMethods(methods: ExposureMethod[]) {
  if (!methods.length) return "Sin método cargado";
  return methods
    .map((method) => {
      const found = EXPOSURE_METHOD_OPTIONS.find((option) => option.value === method);
      return found?.label ?? method;
    })
    .join(" · ");
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div>
        <span className="block text-sm font-medium text-app-foreground">{label}</span>
        {hint ? <span className="block text-sm leading-6 text-app-muted">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function Badge({ tone, children }: { tone: RiskTone; children: React.ReactNode }) {
  const classes = RISK_BAND_STYLES[tone];
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${classes.border} ${classes.fill} ${classes.text}`}>{children}</span>;
}

function MiniMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-app-border bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{label}</p>
      <p className="mt-2 text-base font-semibold text-app-foreground">{value}</p>
      <p className="mt-1 text-sm text-app-muted">{helper}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-white px-4 py-3">
      <p className="text-sm text-app-muted">{label}</p>
      <p className="text-sm font-semibold text-app-foreground">{value}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = false,
  tone,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
  tone?: RiskTone;
}) {
  const tint =
    tone === "very-high"
      ? "border-rose-200 bg-rose-50"
      : tone === "high"
        ? "border-rose-200 bg-rose-50"
        : tone === "moderate"
          ? "border-orange-200 bg-orange-50"
          : tone === "low"
            ? "border-amber-200 bg-amber-50"
            : tone === "very-low"
              ? "border-emerald-200 bg-emerald-50"
              : accent
                ? "border-app-primary/20 bg-app-primary/5"
                : "border-app-border bg-white";

  return (
    <div className={`rounded-[24px] border p-4 shadow-[0_18px_40px_-34px_rgba(36,22,47,0.4)] ${tint}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{label}</p>
          <p className="mt-2 text-lg font-semibold text-app-foreground">{value}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-2 text-app-primary">
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-app-muted">{detail}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: typeof CalendarDays;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className={`${PANEL} p-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-app-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-app-primary">
            <Icon className="size-3.5" />
            Sin datos todavía
          </div>
          <h3 className="mt-4 text-xl font-semibold text-app-foreground">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-app-muted">{message}</p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90"
        >
          {actionLabel}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ValidationMessage({ issues, className = "" }: { issues: string[]; className?: string }) {
  if (!issues.length) return null;
  return (
    <div className={`${className} rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-semibold">Hay un detalle por revisar</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RiskCurveSection() {
  return (
    <div className={`${PANEL} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Curva de marcador</p>
          <h3 className="text-xl font-semibold text-app-foreground">Marcador relativo por día</h3>
        </div>
        <Badge tone="moderate">Pico O-3 / O-2</Badge>
      </div>
      <div className="mt-4 grid gap-2">
        <div className="grid grid-cols-8 gap-2">
          {RELATIVE_RISK_TABLE.map((point) => {
            const height = Math.max(16, Math.round((point.percent / 27) * 180));
            const tone = getRiskTone(point.percent);
            const barClass =
              tone === "very-high"
                ? "bg-[linear-gradient(180deg,#b73468_0%,#8f2f52_100%)]"
                : tone === "high"
                  ? "bg-[linear-gradient(180deg,#d25d79_0%,#b73f61_100%)]"
                  : tone === "moderate"
                    ? "bg-[linear-gradient(180deg,#e5a038_0%,#ce7b24_100%)]"
                    : tone === "low"
                      ? "bg-[linear-gradient(180deg,#edd98b_0%,#dfb94c_100%)]"
                      : "bg-[linear-gradient(180deg,#badcc8_0%,#72b48a_100%)]";
            const isPeak = point.offset === -3 || point.offset === -2;
            return (
              <div key={point.label} className="flex flex-col items-center gap-2">
                <div className="flex h-48 w-full items-end rounded-2xl border border-app-border bg-white px-2 py-2">
                  <div className={`w-full rounded-2xl ${barClass} ${isPeak ? "ring-2 ring-app-primary/20" : ""}`} style={{ height }} />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">{point.label}</p>
                  <p className="text-[11px] text-app-muted">{point.percent.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-sm leading-6 text-app-muted">
          El marcador sube antes de ovular, alcanza su pico alrededor de O-3/O-2 y baja después de la ovulación.
        </p>
      </div>
    </div>
  );
}

function RelativeRiskTableSection() {
  return (
    <div className={`${PANEL} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Tabla base</p>
          <h3 className="text-xl font-semibold text-app-foreground">Riesgo relativo por offset</h3>
        </div>
        <Badge tone="very-low">Base educativa</Badge>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-app-border bg-white">
        <table className="min-w-full divide-y divide-app-border text-left text-sm">
          <thead className="bg-app-surface-2/80">
            <tr>
              <th className="px-4 py-3 font-semibold text-app-foreground">Día</th>
              <th className="px-4 py-3 font-semibold text-app-foreground">Marcador</th>
              <th className="px-4 py-3 font-semibold text-app-foreground">Lectura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {RELATIVE_RISK_TABLE.map((point) => {
              const tone = getRiskTone(point.percent);
              const highlight = point.offset >= -4 && point.offset <= -1;
              return (
                <tr key={point.label} className={highlight ? "bg-rose-50/50" : "bg-white"}>
                  <td className="px-4 py-3 font-semibold text-app-foreground">{point.label}</td>
                  <td className="px-4 py-3">{point.percent.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone}>{RISK_LABELS[tone]}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm leading-6 text-app-muted">
        Estos porcentajes no son acumulativos mensuales. Son marcadores educativos para una única relación sin protección respecto de la ovulación.
      </p>
    </div>
  );
}

function KeyMetricsSection({ simulation }: { simulation: ReturnType<typeof calculateSimulation> }) {
  return (
    <div className={`${PANEL} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Métricas clave</p>
          <h3 className="text-xl font-semibold text-app-foreground">Resumen útil para leer el modelo</h3>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MiniMetric label="Duración de ventana fértil" value="8 días" helper="O-6 a O+1" />
        <MiniMetric label="Día de mayor marcador" value="O-3" helper="26.7%" />
        <MiniMetric label="Marcador individual más alto" value="26.7%" helper="O-3" />
        <MiniMetric label="Cluster pico" value="O-4 a O-1" helper="Mayor atención" />
        <MiniMetric label="Día de ovulación" value="6.8%" helper="O" />
        <MiniMetric label="Día post-ovulación relevante" value="O+1" helper="3.3%" />
        <MiniMetric label="Riesgo fuera de ventana" value="~0%" helper="Con incertidumbre" />
        <MiniMetric label="Incertidumbre" value={`${simulation.uncertaintyScore}%`} helper={simulation.uncertaintyBand} />
        <MiniMetric label="Confianza" value={`${simulation.confidenceScore}%`} helper={simulation.confidenceBand} />
      </div>
    </div>
  );
}

function ConservativeWindowSection({ simulation }: { simulation: ReturnType<typeof calculateSimulation> }) {
  return (
    <div className={`${PANEL} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Ventana conservadora</p>
          <h3 className="text-xl font-semibold text-app-foreground">Margen adicional por variabilidad</h3>
        </div>
        <Badge tone={simulation.confidenceScore > 75 ? "very-low" : simulation.confidenceScore > 50 ? "low" : "moderate"}>
          {simulation.conservativeExpansionDays ? `±${simulation.conservativeExpansionDays} días` : "Sin expansión"}
        </Badge>
      </div>
      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl border border-app-border bg-white p-4">
          <p className="text-sm font-semibold text-app-foreground">Ventana base</p>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            {simulation.fertileWindowStart ? `${formatDateLong(simulation.fertileWindowStart)} → ${formatDateLong(simulation.fertileWindowEnd)}` : "Todavía no hay cálculo."}
          </p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-4">
          <p className="text-sm font-semibold text-app-foreground">Ventana conservadora</p>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            {simulation.conservativeWindowStart ? `${formatDateLong(simulation.conservativeWindowStart)} → ${formatDateLong(simulation.conservativeWindowEnd)}` : "Todavía no hay cálculo."}
          </p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-4">
          <p className="text-sm font-semibold text-app-foreground">Por qué importa</p>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Si la variabilidad es ±2 días, ampliamos 2 días a cada lado. Si la variabilidad es ±4 días o más, la confianza baja bastante.
          </p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-4">
          <p className="text-sm font-semibold text-app-foreground">Nivel de confianza</p>
          <p className="mt-2 text-sm leading-6 text-app-muted">{simulation.confidenceHint}</p>
        </div>
      </div>
    </div>
  );
}

function ReminderSection({
  simulation,
  downloadIcs,
  copyReminderDescriptions,
  copyReminderDetails,
  copyReminderEvent,
}: {
  simulation: ReturnType<typeof calculateSimulation>;
  downloadIcs: () => void;
  copyReminderDescriptions: () => Promise<void>;
  copyReminderDetails: () => Promise<void>;
  copyReminderEvent: (event: ReturnType<typeof buildReminderEvents>[number]) => Promise<void>;
}) {
  return (
    <div className={`${PANEL} p-5`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Recordatorios</p>
          <h3 className="text-xl font-semibold text-app-foreground">Generador de calendario</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Los 8 recordatorios se arman entre O-6 y O+1, con horario sugerido de {REMINDER_TIME_RANGE} y alarma 15 minutos antes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadIcs}
            disabled={!simulation.reminders.length}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" />
            Descargar .ics
          </button>
          <button
            type="button"
            onClick={copyReminderDescriptions}
            disabled={!simulation.reminders.length}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="size-4" />
            Copiar descripciones
          </button>
          <button
            type="button"
            onClick={copyReminderDetails}
            disabled={!simulation.reminders.length}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="size-4" />
            Copiar todo
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {simulation.reminders.length ? (
          simulation.reminders.map((event) => (
            <div key={event.id} className="rounded-2xl border border-app-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-app-foreground">{event.title}</p>
                  <p className="mt-1 text-sm text-app-muted">{formatDateLong(event.date)}</p>
                </div>
                <Badge tone={getRiskTone(RELATIVE_RISK_TABLE.find((point) => point.label === `O${event.offset === 0 ? "" : event.offset > 0 ? `+${event.offset}` : event.offset}`)?.percent ?? 0)}>
                  {event.badge}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-medium text-app-foreground">{event.timeLabel} · 15 min antes</p>
              <p className="mt-2 text-sm leading-6 text-app-muted">{event.description}</p>
              <button
                type="button"
                onClick={() => copyReminderEvent(event)}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-app-border bg-app-surface-2 px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary/40"
              >
                <Copy className="size-4" />
                Copiar evento
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-app-border bg-white p-5 text-sm leading-6 text-app-muted">
            No hay recordatorios generados todavía. Cargá la ovulación o la estimación del ciclo para activar la descarga.
          </div>
        )}
      </div>
    </div>
  );
}

function EducationSection() {
  const cards = [
    {
      title: "Qué es la ventana fértil?",
      text: "Es el tramo del ciclo en el que el marcador educativo sube porque la ovulación está cerca.",
    },
    {
      title: "Por qué el mayor marcador suele ser antes de ovular?",
      text: "Porque los espermatozoides pueden sobrevivir varios días y el pico se concentra alrededor de O-3 y O-2.",
    },
    {
      title: "Por qué el calendario puede fallar?",
      text: "Porque la ovulación no siempre cae en el mismo día y el cuerpo no repite el ciclo como una regla fija.",
    },
    {
      title: "Qué puede mover la ovulación?",
      text: "Estrés, viaje, enfermedad, sueño, cambios de rutina y variaciones propias del ciclo.",
    },
    {
      title: "Cuándo consultar?",
      text: "Si el ciclo cambia mucho, hay dolor importante, sangrado raro o dudas sobre anticoncepción y test.",
    },
    {
      title: "Si hubo sexo sin protección en los últimos 5 días?",
      text: "Consultá cuanto antes a una farmacia o ginecología para hablar de anticoncepción de emergencia y otras opciones.",
    },
    {
      title: "Cuándo conviene hacer un test de embarazo?",
      text: "Suele tener más sentido desde el primer día de atraso o unos 14 días después de la relación.",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Educación</p>
        <h3 className="text-2xl font-semibold text-app-foreground">Explicadores cortos</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className={`${PANEL} p-5`}>
            <p className="text-lg font-semibold text-app-foreground">{card.title}</p>
            <p className="mt-3 text-sm leading-6 text-app-muted">{card.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function PrivacySection({
  handleExport,
  handleImportClick,
  handleDeleteAll,
  fileInputRef,
  handleImportFile,
  importError,
}: {
  handleExport: () => Promise<void>;
  handleImportClick: () => void;
  handleDeleteAll: () => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  handleImportFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  importError: string | null;
}) {
  return (
    <div className={`${PANEL} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Privacidad</p>
          <h3 className="text-xl font-semibold text-app-foreground">Modo local-first</h3>
        </div>
        <ShieldBadge />
      </div>
      <div className="mt-4 grid gap-3">
        <PrivacyRow title="Sin cuenta" text="No pedimos login." />
        <PrivacyRow title="Datos locales" text="Todo se guarda en el navegador." />
        <PrivacyRow title="Sin servicios externos" text="No enviamos datos médicos a terceros en este MVP." />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleExport()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90"
        >
          <Download className="size-4" />
          Exportar JSON
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary/40"
        >
          <Upload className="size-4" />
          Importar JSON
        </button>
        <button
          type="button"
          onClick={handleDeleteAll}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-800 transition hover:bg-rose-100"
        >
          <Trash2 className="size-4" />
          Borrar todo
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(event) => void handleImportFile(event)} />
      {importError ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{importError}</div>
      ) : null}
      <p className="mt-4 text-sm leading-6 text-app-muted">
        Los datos permanecen en tu dispositivo hasta que los borres o exportes manualmente.
      </p>
    </div>
  );
}

function SafetySection() {
  return (
    <div className={`${PANEL} p-5`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 text-rose-700" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Seguridad</p>
          <h3 className="text-xl font-semibold text-app-foreground">Aviso de uso</h3>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-app-muted">
        <p>Este simulador es educativo. No debe usarse como anticoncepción, no es un dispositivo médico y no reemplaza una consulta profesional.</p>
        <p>Las fechas son estimaciones con incertidumbre y marcadores relativos por día.</p>
        <p>Si hubo sexo sin protección en los últimos 5 días, consultá cuanto antes a una farmacia o a ginecología para hablar de anticoncepción de emergencia y otras opciones.</p>
        <p>Si querés hacer un test de embarazo, suele tener más sentido desde el primer día de atraso o unos 14 días después de la relación.</p>
      </div>
      <div className="mt-5 rounded-2xl border border-app-border bg-white p-4">
        <p className="text-sm font-semibold text-app-foreground">Esto sí hace el app</p>
        <p className="mt-2 text-sm leading-6 text-app-muted">
          Muestra la ventana fértil estimada, el margen de incertidumbre, los recordatorios y notas locales para que puedas entender mejor el ciclo.
        </p>
      </div>
    </div>
  );
}

function PrivacyRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-app-border bg-white p-4">
      <p className="text-sm font-semibold text-app-foreground">{title}</p>
      <p className="mt-1 text-sm leading-6 text-app-muted">{text}</p>
    </div>
  );
}

function ShieldBadge() {
  return <Badge tone="very-low">Privado</Badge>;
}

function DayDrawer({
  date,
  insight,
  log,
  exposureEntries,
  bodySignals,
  draft,
  onClose,
  onDraftChange,
  onSave,
}: {
  date: string;
  insight: ReturnType<typeof getDayInsightForDate>;
  log: DailyLog;
  exposureEntries: ExposureEntry[];
  bodySignals: VentanaFertilState["bodySignals"];
  draft: DailyLog;
  onClose: () => void;
  onDraftChange: (value: DailyLog) => void;
  onSave: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const baseExposureSummary = exposureEntries.length ? exposureEntries.map((entry) => buildExposureSummary(entry)).join(" · ") : "";
  const bodySummary = summarizeBodySignals(bodySignals);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Cerrar detalle" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-[32px] border border-app-border bg-app-surface p-4 shadow-[0_-24px_70px_-38px_rgba(36,22,47,0.5)] sm:inset-x-auto sm:right-6 sm:top-6 sm:max-h-[calc(100vh-3rem)] sm:w-[min(42rem,calc(100vw-3rem))] sm:rounded-[32px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Detalle del día</p>
            <h3 className="text-2xl font-semibold text-app-foreground">{formatDateLong(date)}</h3>
            <p className="mt-2 text-sm leading-6 text-app-muted">
              {insight.label} · {insight.windowLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-full border border-app-border bg-white text-app-foreground transition hover:border-app-primary/40"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-app-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Relación con ovulación</p>
            <p className="mt-2 text-lg font-semibold text-app-foreground">{insight.offsetFromOvulation === null ? "Sin cálculo" : insight.label}</p>
            <p className="mt-1 text-sm text-app-muted">{insight.explanation}</p>
          </div>
          <div className="rounded-2xl border border-app-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Marcador</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <Badge tone={insight.riskTone}>{insight.riskLabel}</Badge>
              <p className="text-lg font-semibold text-app-foreground">{formatPercent(insight.markerPercent)}</p>
            </div>
            <p className="mt-1 text-sm text-app-muted">{insight.whyItMatters}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-app-border bg-white p-4">
            <p className="text-sm font-semibold text-app-foreground">Señales corporales cargadas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {bodySummary.length ? bodySummary.map((item) => <Tag key={item}>{item}</Tag>) : <Tag>Sin señales globales</Tag>}
            </div>
          </div>
          <div className="rounded-2xl border border-app-border bg-white p-4">
            <p className="text-sm font-semibold text-app-foreground">Exposición y notas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {baseExposureSummary ? <Tag>{baseExposureSummary}</Tag> : <Tag>Sin exposición cargada</Tag>}
              {log.note.trim() ? <Tag>{log.note.trim()}</Tag> : null}
              {log.symptoms.trim() ? <Tag>{log.symptoms.trim()}</Tag> : null}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-app-border bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {insight.safetyNote}
        </div>

        <div className="mt-5 grid gap-4">
          <Field label="Nota del día">
            <textarea
              className={TEXTAREA}
              value={draft.note}
              onChange={(event) => onDraftChange({ ...draft, note: event.target.value })}
              placeholder="Agregá una observación breve"
            />
          </Field>

          <Field label="Síntomas">
            <textarea
              className={TEXTAREA}
              value={draft.symptoms}
              onChange={(event) => onDraftChange({ ...draft, symptoms: event.target.value })}
              placeholder="Cólicos, dolor, flujo, cambios de humor..."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="BBT">
              <input className={INPUT} value={draft.bbt} onChange={(event) => onDraftChange({ ...draft, bbt: event.target.value })} placeholder="36,5" />
            </Field>
            <Field label="Resultado LH">
              <select
                className={SELECT}
                value={draft.lhResult}
                onChange={(event) => onDraftChange({ ...draft, lhResult: event.target.value as LhResult | "" })}
              >
                <option value="">Sin resultado</option>
                {LH_RESULT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Moco">
              <select className={SELECT} value={draft.mucus} onChange={(event) => onDraftChange({ ...draft, mucus: event.target.value as DailyLog["mucus"] })}>
                <option value="">Sin dato</option>
                {MUCUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Posición del cérvix">
              <select
                className={SELECT}
                value={draft.cervixPosition}
                onChange={(event) => onDraftChange({ ...draft, cervixPosition: event.target.value as DailyLog["cervixPosition"] })}
              >
                <option value="">Sin dato</option>
                {CERVIX_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estrés">
              <div className="grid grid-cols-3 gap-2">
                {SIGNAL_LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onDraftChange({ ...draft, stressLevel: option.value })}
                    className={`rounded-2xl border px-3 py-3 text-sm transition ${
                      draft.stressLevel === option.value ? "border-app-primary bg-app-primary/10 text-app-primary" : "border-app-border bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Sueño">
              <div className="grid grid-cols-3 gap-2">
                {SIGNAL_LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onDraftChange({ ...draft, sleepQuality: option.value })}
                    className={`rounded-2xl border px-3 py-3 text-sm transition ${
                      draft.sleepQuality === option.value ? "border-app-primary bg-app-primary/10 text-app-primary" : "border-app-border bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Notas de exposición">
            <input
              className={INPUT}
              value={draft.exposureNote}
              onChange={(event) => onDraftChange({ ...draft, exposureNote: event.target.value })}
              placeholder="Ej. retiro, preservativo, emergencia, etc."
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90"
            >
              <Check className="size-4" />
              Guardar nota
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-medium text-app-foreground transition hover:border-app-primary/40"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-app-border bg-app-surface-2 px-3 py-1 text-xs font-medium text-app-foreground">{children}</span>;
}
