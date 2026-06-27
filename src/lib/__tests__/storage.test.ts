import { describe, expect, it } from "vitest";

import { createDefaultState, sanitizeState } from "@/lib/storage";

describe("sanitización local", () => {
  it("descarta valores de enum desconocidos", () => {
    const state = sanitizeState({ ...createDefaultState(), regularity: "inyectado", dailyLogs: { "2026-06-01": { note: "<script>x</script>", sexMethods: ["desconocido"] } } });
    expect(state.regularity).toBe("regular");
    expect(state.dailyLogs["2026-06-01"].sexMethods).toEqual([]);
    expect(state.dailyLogs["2026-06-01"].note).toBe("<script>x</script>");
  });
});
