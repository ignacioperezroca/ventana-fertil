import { formatDateShort } from "@/lib/cycle";
import { safeShareText } from "@/lib/security";
import { getFertileRangeText, getPeakDates, getOvulationText } from "@/lib/fertility";
import type { SimulationResult } from "@/types";

export function buildPersonalShareMessage(simulation: SimulationResult) {
  const fertileRange = getFertileRangeText(simulation);
  const peakDates = getPeakDates(simulation).map((date) => formatDateShort(date)).join(", ");
  const ovulationDate = getOvulationText(simulation);
  const confidence = simulation.confidenceBand || "Media";

  return safeShareText([
    "🥚 Ventana Fértil",
    "",
    "Ventana fértil estimada:",
    fertileRange,
    "",
    "Días más fértiles:",
    peakDates || "—",
    "",
    "Ovulación estimada:",
    ovulationDate,
    "",
    `Confianza: ${confidence}`,
    "",
    "Estimación educativa: la ovulación puede moverse y esto no reemplaza consulta médica.",
  ].join("\n"));
}

export function buildGenericShareMessage() {
  return safeShareText("🥚 Ventana Fértil: calculá tus días más fértiles del mes en segundos.");
}
