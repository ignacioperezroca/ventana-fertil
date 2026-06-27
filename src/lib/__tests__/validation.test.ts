import { describe, expect, it } from "vitest";

import {
  getSimpleDateNotice,
  isValidISODate,
  safeParseJson,
  sanitizeImportedState,
  validateCycleLength,
  validateImportPayload,
  validatePeriodEntry,
  validateSimpleState,
} from "@/lib/validation";

describe("validation helpers", () => {
  it("accepts valid cycle lengths", () => {
    expect(validateCycleLength(28).valid).toBe(true);
    expect(validateCycleLength(30).valid).toBe(true);
  });

  it("rejects invalid cycle lengths", () => {
    expect(validateCycleLength(20).valid).toBe(false);
    expect(validateCycleLength(46).valid).toBe(false);
  });

  it("recognizes valid ISO dates", () => {
    expect(isValidISODate("2026-05-28")).toBe(true);
    expect(isValidISODate("2026-13-28")).toBe(false);
  });

  it("validates period entries defensively", () => {
    expect(
      validatePeriodEntry({
        id: "entry-1",
        periodStartDate: "2026-05-01",
        source: "manual",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
        notes: "ok",
      }).valid,
    ).toBe(true);
    expect(
      validatePeriodEntry({
        id: "entry-2",
        periodStartDate: "2099-01-01",
        source: "manual",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
        notes: "future",
      }).valid,
    ).toBe(false);
  });

  it("rejects future dates in the simple flow", () => {
    expect(
      validateSimpleState({
        lastPeriodStart: "2099-01-01",
        averageCycleLength: 28,
      }).issues,
    ).toContain("La fecha no puede estar en el futuro.");
  });

  it("surfaces a gentle notice for very old dates", () => {
    expect(getSimpleDateNotice("2023-01-01")).toContain("parece antigua");
  });

  it("parses JSON safely", () => {
    expect(safeParseJson("{\"ok\":true}").ok).toBe(true);
    expect(safeParseJson("{not-json}").ok).toBe(false);
  });

  it("rejects malformed import payloads", () => {
    expect(validateImportPayload("{not-json}").valid).toBe(false);
  });

  it("sanitizes migratable imported states", () => {
    const state = sanitizeImportedState({
      version: 1,
      updatedAt: "2026-05-01T00:00:00.000Z",
      lastPeriodStart: "2026-05-01",
      averageCycleLength: 28,
      regularity: "regular",
      isDemo: false,
    });

    expect(state?.version).toBe(2);
    expect(state?.entries).toHaveLength(1);
    expect(state?.entries[0]?.periodStartDate).toBe("2026-05-01");
  });
});
