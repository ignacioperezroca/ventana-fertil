import { describe, expect, it } from "vitest";

import { calculateSimulation, diffInDays, parseDate, RELATIVE_RISK_TABLE } from "@/lib/cycle";
import { createDefaultState } from "@/lib/storage";

describe("motor de ciclo", () => {
  it("conserva la tabla educativa y ubica O-3 como máximo", () => {
    expect(RELATIVE_RISK_TABLE.find((point) => point.offset === -3)?.percent).toBe(26.7);
  });

  it("estima ovulación en día 14 para un ciclo de 28 días", () => {
    const result = calculateSimulation({ ...createDefaultState(), lastPeriodStart: "2026-06-01", averageCycleLength: 28 });
    expect(result.valid).toBe(true);
    expect(result.ovulationDate).toBe("2026-06-14");
    expect(diffInDays(parseDate(result.fertileWindowStart)!, parseDate(result.ovulationDate)!)).toBe(-6);
    expect(diffInDays(parseDate(result.fertileWindowEnd)!, parseDate(result.ovulationDate)!)).toBe(1);
  });

  it("estima ovulación en día 16 para un ciclo de 30 días", () => {
    const result = calculateSimulation({ ...createDefaultState(), lastPeriodStart: "2026-06-01", averageCycleLength: 30, minimumCycleLength: 28, maximumCycleLength: 32 });
    expect(result.ovulationDate).toBe("2026-06-16");
  });

  it("no explota con una fecha inválida", () => {
    expect(calculateSimulation({ ...createDefaultState(), lastPeriodStart: "no-es-fecha" }).valid).toBe(false);
  });
});
