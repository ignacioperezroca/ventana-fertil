import { describe, expect, it } from "vitest";

import { buildIcsFile, buildReminderEvents, parseDate } from "@/lib/cycle";

describe("calendar and ICS helpers", () => {
  const ovulationDate = parseDate("2026-05-14");

  it("creates exactly 8 reminder events", () => {
    if (!ovulationDate) {
      throw new Error("Expected a valid ovulation date.");
    }
    const events = buildReminderEvents(ovulationDate);
    expect(events).toHaveLength(8);
  });

  it("uses the requested reminder times", () => {
    if (!ovulationDate) {
      throw new Error("Expected a valid ovulation date.");
    }
    const events = buildReminderEvents(ovulationDate);
    expect(events[0]?.timeLabel).toBe("08:00");
    expect(events[7]?.timeLabel).toBe("08:15");
  });

  it("builds ICS with a 15-minute alarm and escaped text", () => {
    const ics = buildIcsFile([
      {
        id: "test-1",
        offset: 0,
        title: "Título, con; comas\\",
        badge: "🥚",
        date: "2026-05-14",
        timeLabel: "08:00",
        description: "Línea 1\nLínea 2",
        startIso: "20260514T080000",
      },
    ]);

    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1);
    expect(ics).toContain("TRIGGER:-PT15M");
    expect(ics).toContain("SUMMARY:Título\\, con\\; comas\\\\");
    expect(ics).toContain("DESCRIPTION:Línea 1\\nLínea 2");
    expect(ics).toContain("DTSTART;TZID=America/Argentina/Buenos_Aires:20260514T080000");
  });
});
