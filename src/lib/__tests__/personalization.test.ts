import { describe, expect, it } from "vitest";

import { getPersonalizedResultMessage, getResultStateFromDates } from "@/lib/personalization";

describe("personalization helpers", () => {
  it("labels an upcoming window with a clear next action", () => {
    const message = getPersonalizedResultMessage({
      hasResult: true,
      confidenceLabel: "Media",
      cycleRegularity: "regular",
      historyCount: 1,
      resultState: "upcoming",
    });

    expect(message.title).toContain("empieza pronto");
    expect(message.actionLabel).toContain("recordatorios");
    expect(message.statusTone).toBe("upcoming");
  });

  it("marks low confidence when cycles are irregular", () => {
    const message = getPersonalizedResultMessage({
      hasResult: true,
      confidenceLabel: "Baja",
      cycleRegularity: "irregular",
      historyCount: 0,
      resultState: "current",
    });

    expect(message.title).toContain("puede moverse");
    expect(message.statusTone).toBe("lowConfidence");
  });

  it("derives the result state from the fertile window dates", () => {
    expect(getResultStateFromDates("2026-05-01", "2026-05-10", "2026-05-15")).toBe("upcoming");
    expect(getResultStateFromDates("2026-05-12", "2026-05-10", "2026-05-15")).toBe("current");
    expect(getResultStateFromDates("2026-05-18", "2026-05-10", "2026-05-15")).toBe("past");
  });
});
