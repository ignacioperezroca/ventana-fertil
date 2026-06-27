import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createGrowthDemoState } from "@/lib/demo";
import { buildNextPeriodReminderEvent } from "@/lib/cycle";
import { calculateSimpleSimulation } from "@/lib/fertility";
import { buildFaqJsonLd } from "@/lib/seo";
import { buildWhatsAppMessage, getGenericSharePayload } from "@/lib/share";
import { trackEvent } from "@/lib/analytics";

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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.stubGlobal("window", { innerWidth: 1280 });
});

describe("growth helpers", () => {
  it("builds a WhatsApp result message without the period start date", () => {
    const simulation = calculateSimpleSimulation(makeSimpleState("2026-05-01", 28)).simulation;
    const message = buildWhatsAppMessage(simulation);

    expect(message).toContain("Ventana fértil estimada:");
    expect(message).toContain("Días más fértiles:");
    expect(message).toContain("Ovulación estimada:");
    expect(message).not.toContain("2026-05-01");
    expect(message).not.toMatch(/días seguros|sin riesgo|probabilidad exacta|método anticonceptivo/i);
  });

  it("keeps the generic share payload free of personal dates", () => {
    const payload = getGenericSharePayload();

    expect(payload.title).toContain("Ventana Fértil");
    expect(payload.text).toContain("calculá tus días más fértiles");
    expect(payload.text).not.toContain("2026-05-");
  });

  it("builds a next-period reminder at the expected date and time", () => {
    const reminder = buildNextPeriodReminderEvent("2026-05-01", 28);

    expect(reminder?.date).toBe("2026-05-29");
    expect(reminder?.timeLabel).toBe("08:00");
    expect(reminder?.title).toContain("Cargar nuevo período");
  });

  it("creates safe FAQ structured data", () => {
    const jsonLd = buildFaqJsonLd();

    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity).toHaveLength(9);
    expect(JSON.stringify(jsonLd)).toContain("Esto sirve como anticoncepción?");
  });

  it("sanitizes analytics events and drops forbidden properties", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);

    trackEvent("app_loaded", {
      hasResult: true,
      isDemo: false,
      source: "test",
      eventVersion: "g1",
      deviceCategory: "desktop",
      // @ts-expect-error Defensive test for forbidden data
      lastPeriodDate: "2026-05-01",
    });

    const payload = debugSpy.mock.calls[0]?.[2] as Record<string, unknown>;
    expect(payload).toBeTruthy();
    expect(payload.lastPeriodDate).toBeUndefined();
    expect(payload.eventVersion).toBe("g1");
    expect(payload.deviceCategory).toBe("desktop");
  });

  it("creates a demo state without touching stored data", () => {
    const demo = createGrowthDemoState();

    expect(demo.isDemo).toBe(true);
    expect(demo.averageCycleLength).toBe(28);
    expect(demo.regularity).toBe("regular");
    expect(demo.lastPeriodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
