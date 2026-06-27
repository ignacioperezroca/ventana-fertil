import { describe, expect, it } from "vitest";

import { buildNextPeriodReminderEvent } from "@/lib/cycle";
import { calculateSimpleSimulation } from "@/lib/fertility";
import { buildMonthlyActionPlan } from "@/lib/resultSummary";
import { buildSimpleScenarioPreviewCards } from "@/lib/scenarios";
import { getPublicSharePayload, buildWhatsAppMessage } from "@/lib/share";

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

describe("opportunity backlog helpers", () => {
  it("builds an upcoming monthly action plan", () => {
    const simulation = {
      ...calculateSimpleSimulation(makeSimpleState("2026-05-10", 28)).simulation,
      selectedDate: "2026-05-12",
    };
    const plan = buildMonthlyActionPlan(simulation);

    expect(plan?.stateLabel).toBe("upcoming");
    expect(plan?.suggestedAction).toBe("Guardá recordatorios");
    expect(plan?.title).toContain("Tu próxima ventana fértil empieza");
  });

  it("builds three simple scenario preview cards", () => {
    const simulation = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28)).simulation;
    const cards = buildSimpleScenarioPreviewCards(simulation);

    expect(cards).toHaveLength(3);
    expect(cards[1]?.title).toBe("Estimación base");
    expect(cards[0]?.title).toContain("antes");
    expect(cards[2]?.title).toContain("después");
  });

  it("keeps the public share payload free of personal dates", () => {
    const payload = getPublicSharePayload();

    expect(payload.text).toContain("calculá tus días más fértiles del mes en segundos");
    expect(payload.text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it("builds the next-period reminder at the expected date and time", () => {
    const reminder = buildNextPeriodReminderEvent("2026-05-01", 28);

    expect(reminder?.date).toBe("2026-05-29");
    expect(reminder?.timeLabel).toBe("08:00");
    expect(reminder?.title).toContain("Cargar nuevo período");
  });

  it("keeps the WhatsApp result message free of the last period date", () => {
    const simulation = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28)).simulation;
    const message = buildWhatsAppMessage(simulation);

    expect(message).not.toContain("2026-05-01");
    expect(message).toContain("Ventana fértil estimada:");
  });
});
