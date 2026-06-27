import { describe, expect, it } from "vitest";

import { calculateSimpleSimulation, getPeakDates } from "@/lib/fertility";

function makeSimpleState(lastPeriodStart: string, averageCycleLength: number) {
  return {
    version: 1 as const,
    updatedAt: "2026-05-28T00:00:00.000Z",
    lastPeriodStart,
    averageCycleLength,
    regularity: "regular" as const,
    isDemo: false,
  };
}

describe("fertility calculations", () => {
  it("estimates ovulation on day 14 for a 28-day cycle", () => {
    const result = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28));
    expect(result.simulation.valid).toBe(true);
    expect(result.simulation.selectedDateOffset).not.toBeNull();
    expect(result.simulation.ovulationDate).toBe("2026-05-14");
  });

  it("estimates ovulation on day 16 for a 30-day cycle", () => {
    const result = calculateSimpleSimulation(makeSimpleState("2026-05-01", 30));
    expect(result.simulation.ovulationDate).toBe("2026-05-16");
  });

  it("keeps the fertile window from O-6 to O+1", () => {
    const result = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28));
    expect(result.simulation.fertileWindowStart).toBe("2026-05-08");
    expect(result.simulation.fertileWindowEnd).toBe("2026-05-15");
  });

  it("keeps the peak window from O-4 to O-1", () => {
    const result = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28));
    expect(result.simulation.peakWindowStart).toBe("2026-05-10");
    expect(result.simulation.peakWindowEnd).toBe("2026-05-13");
  });

  it("marks O-3 as the highest marker", () => {
    const result = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28));
    const point = result.simulation.riskTable.find((entry) => entry.offset === -3);
    expect(point?.percent).toBe(26.7);
    expect(getPeakDates(result.simulation)).toContain("2026-05-10");
  });

  it("does not crash on invalid dates", () => {
    expect(() => calculateSimpleSimulation(makeSimpleState("invalid-date", 28))).not.toThrow();
  });
});
