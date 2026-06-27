import { afterEach, describe, expect, it, vi } from "vitest";

import { LEGACY_SIMPLE_STORAGE_KEY, readCycleRepositoryStateSync, writeCycleRepositoryStateSync, clearCycleRepositoryStateSync } from "@/lib/repositories/localStorageCycleRepository";
import { createDefaultAppState } from "@/lib/repositories/cycleRepository";

function createMockLocalStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    dump: () => Object.fromEntries(store.entries()),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("localStorage cycle repository", () => {
  it("migrates legacy v1 data without deleting the source", () => {
    const localStorage = createMockLocalStorage({
      [LEGACY_SIMPLE_STORAGE_KEY]: JSON.stringify({
        version: 1,
        updatedAt: "2026-05-01T00:00:00.000Z",
        lastPeriodStart: "2026-05-01",
        averageCycleLength: 28,
        regularity: "regular",
        isDemo: false,
      }),
    });

    vi.stubGlobal("window", { localStorage } as unknown as Window);

    const result = readCycleRepositoryStateSync();
    expect(result.state.entries).toHaveLength(1);
    expect(result.warnings.some((warning) => warning.code === "legacy-migration")).toBe(true);
    expect(localStorage.getItem(LEGACY_SIMPLE_STORAGE_KEY)).not.toBeNull();
  });

  it("writes a normalized v2 state", () => {
    const localStorage = createMockLocalStorage();
    vi.stubGlobal("window", { localStorage } as unknown as Window);

    const saved = writeCycleRepositoryStateSync({
      ...createDefaultAppState(),
      updatedAt: "2026-05-28T00:00:00.000Z",
      entries: [
        {
          id: "entry-1",
          periodStartDate: "2026-05-01",
          source: "manual",
          createdAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
          notes: "",
        },
      ],
      currentEntryId: "entry-1",
    });

    expect(saved.version).toBe(2);
    expect(localStorage.getItem("ventana-fertil:v2")).not.toBeNull();
  });

  it("clears stored state safely", () => {
    const localStorage = createMockLocalStorage({
      "ventana-fertil:v2": "{}",
      [LEGACY_SIMPLE_STORAGE_KEY]: "{}",
    });
    vi.stubGlobal("window", { localStorage } as unknown as Window);

    clearCycleRepositoryStateSync();

    expect(localStorage.getItem("ventana-fertil:v2")).toBeNull();
    expect(localStorage.getItem(LEGACY_SIMPLE_STORAGE_KEY)).toBeNull();
  });
});
