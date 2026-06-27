"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, MoonStar, Sparkles } from "lucide-react";
import { trackEvent, getDeviceCategory } from "@/lib/analytics";
import type { DailyCheckInRecord, CheckinSleep, CheckinState, CheckinStress } from "@/lib/checkins";

const STATE_OPTIONS: { value: CheckinState; label: string }[] = [
  { value: "bien", label: "Bien" },
  { value: "normal", label: "Normal" },
  { value: "sensible", label: "Sensible" },
  { value: "cansada", label: "Cansada" },
];

const STRESS_OPTIONS: { value: CheckinStress; label: string }[] = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
];

const SLEEP_OPTIONS: { value: CheckinSleep; label: string }[] = [
  { value: "malo", label: "Malo" },
  { value: "normal", label: "Normal" },
  { value: "bueno", label: "Bueno" },
];

export function DailyCheckIn({
  date,
  existing,
  lowAnxietyMode = false,
  onSave,
  onDelete,
}: {
  date: string;
  existing: DailyCheckInRecord | null;
  lowAnxietyMode?: boolean;
  onSave: (record: DailyCheckInRecord) => void;
  onDelete?: (date: string) => void;
}) {
  const [state, setState] = useState<CheckinState>(existing?.state ?? "normal");
  const [stress, setStress] = useState<CheckinStress>(existing?.stress ?? "medio");
  const [sleep, setSleep] = useState<CheckinSleep>(existing?.sleep ?? "normal");
  const [note, setNote] = useState(existing?.note ?? "");
  const [mucus, setMucus] = useState(existing?.mucus ?? "");
  const [bbt, setBbt] = useState(existing?.bbt ?? "");
  const [lhResult, setLhResult] = useState(existing?.lhResult ?? "");

  const handleSave = () => {
    const record: DailyCheckInRecord = {
      date,
      state,
      stress,
      sleep,
      note,
      mucus,
      bbt,
      lhResult,
      updatedAt: new Date().toISOString(),
    };
    onSave(record);
    trackEvent("daily_checkin_saved", {
      hasSimulation: true,
      confidenceLevel: state === "cansada" ? "medium" : "high",
      uncertaintyBucket: stress === "alto" ? "high" : "moderate",
      source: "today",
      isDemo: false,
      deviceCategory: getDeviceCategory(),
    });
  };

  return (
    <section className="rounded-[28px] border border-app-border bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_22px_70px_-42px_rgba(36,22,47,0.32)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Check-in diario</p>
          <h3 className="mt-1 text-xl font-semibold text-app-foreground">¿Cómo estás hoy?</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Se guarda en menos de 20 segundos y suma contexto al calendario.</p>
        </div>
        <CheckCircle2 className="size-5 text-app-primary" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Field label="Estado general" icon={<Sparkles className="size-4 text-app-primary" />}>
          <ChipGroup value={state} onChange={(next) => setState(next as CheckinState)} options={STATE_OPTIONS} />
        </Field>
        <Field label="Estrés" icon={<Sparkles className="size-4 text-app-accent" />}>
          <ChipGroup value={stress} onChange={(next) => setStress(next as CheckinStress)} options={STRESS_OPTIONS} />
        </Field>
        <Field label="Sueño" icon={<MoonStar className="size-4 text-app-primary" />}>
          <ChipGroup value={sleep} onChange={(next) => setSleep(next as CheckinSleep)} options={SLEEP_OPTIONS} />
        </Field>
      </div>

      <details className="mt-4 rounded-[24px] border border-app-border bg-white p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">Datos opcionales</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField label="Moco cervical" value={mucus} onChange={setMucus} placeholder="Opcional" />
          <TextField label="Temperatura basal" value={bbt} onChange={setBbt} placeholder="36,5" />
          <TextField label="Resultado LH" value={lhResult} onChange={setLhResult} placeholder="Low / High / Peak" />
        </div>
      </details>

      <div className="mt-4">
        <label className="block space-y-2">
          <span className="block text-sm font-medium text-app-foreground">Nota opcional</span>
          <textarea className="h-24 w-full rounded-2xl border border-app-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-app-muted focus:border-app-primary focus:ring-2 focus:ring-app-primary/15" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Una línea corta alcanza." />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSave} className="inline-flex h-12 items-center gap-2 rounded-full bg-app-primary px-5 text-sm font-semibold text-white transition hover:bg-app-primary/90">
          Guardar check-in
        </button>
        {existing && onDelete ? (
          <button type="button" onClick={() => onDelete(date)} className="inline-flex h-12 items-center gap-2 rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/40">
            Borrar check-in
          </button>
        ) : null}
        {lowAnxietyMode ? <p className="text-xs leading-5 text-app-muted">Modo baja ansiedad activo: la app prioriza etiquetas sobre cifras.</p> : null}
      </div>
    </section>
  );
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-[24px] border border-app-border bg-app-surface-2/40 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-app-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChipGroup<T extends string>({ value, onChange, options }: { value: T; onChange: (value: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${value === option.value ? "border-app-primary bg-app-primary/10 text-app-primary" : "border-app-border bg-white text-app-foreground"}`}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-app-foreground">{label}</span>
      <input className="h-12 w-full rounded-2xl border border-app-border bg-white px-4 text-sm outline-none transition placeholder:text-app-muted focus:border-app-primary focus:ring-2 focus:ring-app-primary/15" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
