import { addDays, formatDateInput, todayIsoDate } from "@/lib/cycle";
import { createDefaultState } from "@/lib/storage";
import type { SimpleCoreState } from "@/lib/simple-storage";
import type { ExposureEntry, VentanaFertilState } from "@/types";

export function createDemoState(): VentanaFertilState {
  const base = createDefaultState();
  const today = new Date();
  const lmp = addDays(today, -14);

  return {
    ...base,
    isDemo: true,
    currentStep: 5,
    selectedDate: formatDateInput(today),
    calendarMonth: formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
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
      notes: "Demo cargada para mostrar el flujo completo.",
    },
  };
}

export function createExposureRow(): ExposureEntry {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `exposure-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: todayIsoDate(),
    methods: [],
    notes: "",
  };
}

export function createGrowthDemoState(): SimpleCoreState {
  const today = new Date();
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    lastPeriodStart: formatDateInput(addDays(today, -13)),
    averageCycleLength: 28,
    regularity: "regular",
    isDemo: true,
  };
}
