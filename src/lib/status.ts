import type { SimulationResult } from "@/types";

export interface CurrentDayStatus {
  label: string;
  short: string;
  badge: "very-low" | "low" | "moderate" | "high" | "very-high";
  cta: string;
}

export function getCurrentDayStatus(simulation: SimulationResult): CurrentDayStatus {
  if (!simulation.valid) {
    return {
      label: "Sin datos suficientes",
      short: "Necesitás cargar algunos datos para ver la simulación.",
      badge: "very-low",
      cta: "Cargar datos",
    };
  }

  if (simulation.selectedDateOffset === 0) {
    return {
      label: "Ovulación estimada",
      short: "La fecha calculada queda en el día de ovulación del modelo.",
      badge: "high",
      cta: "Ver timing",
    };
  }

  if (simulation.selectedDateOffset !== null && simulation.selectedDateOffset >= -4 && simulation.selectedDateOffset <= -1) {
    return {
      label: "Día de mayor atención",
      short: "Estás en el cluster donde el marcador suele concentrarse antes de ovular.",
      badge: "very-high",
      cta: "Ver calendario",
    };
  }

  if (simulation.selectedWindowLabel === "Dentro de la ventana base") {
    return {
      label: "Ventana fértil estimada",
      short: "La fecha cae dentro de la ventana base del modelo.",
      badge: "moderate",
      cta: "Ver timing",
    };
  }

  if (simulation.selectedWindowLabel === "Ventana conservadora") {
    return {
      label: "Ventana conservadora",
      short: "La variabilidad del ciclo abre un margen extra alrededor de la estimación.",
      badge: "low",
      cta: "Ver límites",
    };
  }

  return {
    label: "Fuera de ventana estimada",
    short: "El marcador por timing queda bajo fuera de la ventana fértil base.",
    badge: "very-low",
    cta: "Ver calendario",
  };
}
