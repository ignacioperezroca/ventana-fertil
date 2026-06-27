import { describe, expect, it } from "vitest";

import { checkoutSchema, cloudSnapshotSchema } from "@/lib/validation/cloud";

const valid = {
  cycle: { periodStart: "2026-06-01", averageCycleLength: 28, minimumCycleLength: 26, maximumCycleLength: 30, regularity: "regular", ovulationMethod: "calendar", bodySignals: {} },
  dailyLogs: [], exposures: [],
};

describe("validación de entrada", () => {
  it("rechaza precios arbitrarios", () => expect(checkoutSchema.safeParse({ plan: "price_atacante" }).success).toBe(false));
  it("acepta una instantánea mínima válida", () => expect(cloudSnapshotSchema.safeParse(valid).success).toBe(true));
  it("rechaza ciclos fuera de rango", () => expect(cloudSnapshotSchema.safeParse({ ...valid, cycle: { ...valid.cycle, averageCycleLength: 80 } }).success).toBe(false));
});
