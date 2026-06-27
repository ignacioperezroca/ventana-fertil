import { describe, expect, it } from "vitest";

import { buildGenericShareMessage, buildPersonalShareMessage } from "@/lib/shareTemplates";
import { calculateSimpleSimulation } from "@/lib/fertility";

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

describe("share templates", () => {
  it("builds a personal share message without the last period date", () => {
    const simulation = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28)).simulation;
    const message = buildPersonalShareMessage(simulation);

    expect(message).toContain("Ventana fértil estimada:");
    expect(message).toContain("Ovulación estimada:");
    expect(message).toContain("Estimación educativa");
    expect(message).not.toContain("2026-05-01");
  });

  it("builds a generic share message without personal data", () => {
    const message = buildGenericShareMessage();

    expect(message).toContain("Ventana Fértil");
    expect(message).toContain("calculá tus días más fértiles del mes en segundos");
    expect(message).not.toMatch(/2026-|ventana fértil estimada|ovulación estimada/i);
  });
});
