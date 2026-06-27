import { describe, expect, it } from "vitest";

import { buildWhatsAppMessage, getWhatsAppUrl } from "@/lib/share";
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

describe("share helpers", () => {
  it("includes the key result dates in the WhatsApp message", () => {
    const simulation = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28)).simulation;
    const message = buildWhatsAppMessage(simulation);

    expect(message).toContain("Ventana fértil estimada:");
    expect(message).toContain("Ovulación estimada:");
    expect(message).toContain("Días más fértiles:");
    expect(message).toContain("Estimación educativa");
  });

  it("avoids unsafe contraceptive wording", () => {
    const simulation = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28)).simulation;
    const message = buildWhatsAppMessage(simulation);

    expect(message).not.toMatch(/días seguros|sin riesgo|probabilidad exacta|método anticonceptivo/i);
    expect(getWhatsAppUrl(message)).toContain("https://wa.me/?text=");
  });
});
