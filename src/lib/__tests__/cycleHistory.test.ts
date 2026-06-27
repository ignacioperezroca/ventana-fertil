import { describe, expect, it } from "vitest";

import { dedupePeriodEntries, sortPeriodEntries } from "@/lib/repositories/cycleRepository";
import { summarizeCycleHistory, type CycleSnapshot } from "@/lib/cycleHistory";
import type { PeriodEntry } from "@/types";

describe("cycle history helpers", () => {
  it("sorts entries by most recent update first", () => {
    const entries: PeriodEntry[] = [
      {
        id: "b",
        periodStartDate: "2026-05-02",
        source: "manual",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "a",
        periodStartDate: "2026-05-01",
        source: "manual",
        createdAt: "2026-05-02T10:00:00.000Z",
        updatedAt: "2026-05-02T10:00:00.000Z",
      },
    ];

    const sorted = sortPeriodEntries(entries);
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "b"]);
  });

  it("dedupes entries with the same period date", () => {
    const entries: PeriodEntry[] = [
      {
        id: "a",
        periodStartDate: "2026-05-01",
        source: "manual",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "b",
        periodStartDate: "2026-05-01",
        source: "import",
        createdAt: "2026-05-02T10:00:00.000Z",
        updatedAt: "2026-05-02T10:00:00.000Z",
      },
    ];

    const deduped = dedupePeriodEntries(entries);
    expect(deduped).toHaveLength(1);
    expect(deduped[0]?.id).toBe("a");
  });

  it("averages cycle length from the last three valid snapshots", () => {
    const snapshots: CycleSnapshot[] = [
      {
        id: "1",
        createdAt: "2026-05-03T00:00:00.000Z",
        cycleStartDate: "2026-04-01",
        averageLengthUsed: 27,
        estimatedOvulationDay: 13,
        fertileWindow: "2026-04-08 → 2026-04-15",
        uncertaintyScore: 20,
      },
      {
        id: "2",
        createdAt: "2026-05-02T00:00:00.000Z",
        cycleStartDate: "2026-03-01",
        averageLengthUsed: 29,
        estimatedOvulationDay: 15,
        fertileWindow: "2026-03-08 → 2026-03-15",
        uncertaintyScore: 40,
      },
      {
        id: "3",
        createdAt: "2026-05-01T00:00:00.000Z",
        cycleStartDate: "2026-02-01",
        averageLengthUsed: 31,
        estimatedOvulationDay: 17,
        fertileWindow: "2026-02-08 → 2026-02-15",
        uncertaintyScore: 60,
      },
      {
        id: "4",
        createdAt: "2026-04-01T00:00:00.000Z",
        cycleStartDate: "2026-01-01",
        averageLengthUsed: 35,
        estimatedOvulationDay: 21,
        fertileWindow: "2026-01-08 → 2026-01-15",
        uncertaintyScore: 80,
      },
    ];

    const summary = summarizeCycleHistory(snapshots);
    expect(summary.averageLength).toBe(29);
    expect(summary.averageUncertainty).toBe(40);
    expect(summary.recent).toHaveLength(3);
  });
});
