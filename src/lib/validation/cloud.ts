import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const limitedText = (max: number) => z.string().trim().max(max).default("");

export const cycleSchema = z.object({
  id: z.string().uuid().optional(),
  periodStart: isoDate,
  averageCycleLength: z.number().int().min(21).max(45),
  minimumCycleLength: z.number().int().min(15).max(60),
  maximumCycleLength: z.number().int().min(15).max(60),
  regularity: z.enum(["regular", "algo_variable", "irregular", "no_se"]),
  ovulationMethod: z.enum(["calendar", "known", "lh", "unsure"]),
  knownOvulationDate: isoDate.or(z.literal("")).optional(),
  lhSurgeDate: isoDate.or(z.literal("")).optional(),
  lhResult: z.enum(["low", "high", "peak", ""]).optional(),
  bodySignals: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true),
}).superRefine((value, ctx) => {
  if (value.minimumCycleLength > value.averageCycleLength || value.averageCycleLength > value.maximumCycleLength) {
    ctx.addIssue({ code: "custom", message: "Las duraciones mínima, promedio y máxima no son consistentes." });
  }
});

export const dailyLogSchema = z.object({
  id: z.string().uuid().optional(),
  cycleId: z.string().uuid().nullable().optional(),
  logDate: isoDate,
  note: limitedText(2000),
  symptoms: limitedText(1000),
  bbt: z.number().min(30).max(45).nullable().optional(),
  lhResult: z.enum(["low", "high", "peak", ""]).optional(),
  mucus: z.enum(["dry", "sticky", "creamy", "watery", "egg_white", ""]).optional(),
  cervixPosition: z.enum(["low", "medium", "high", ""]).optional(),
  sexMethods: z.array(z.string().max(50)).max(10).default([]),
  exposureNote: limitedText(1000),
  stressLevel: z.enum(["low", "medium", "high", ""]).optional(),
  sleepQuality: z.enum(["low", "medium", "high", ""]).optional(),
  travelOrIllness: z.boolean().default(false),
});

export const exposureSchema = z.object({
  id: z.string().uuid().optional(),
  cycleId: z.string().uuid().nullable().optional(),
  exposureDate: isoDate,
  methods: z.array(z.string().max(50)).max(10).default([]),
  notes: limitedText(1000),
});

export const cloudSnapshotSchema = z.object({
  cycle: cycleSchema,
  dailyLogs: z.array(dailyLogSchema).max(4000),
  exposures: z.array(exposureSchema).max(4000),
  sourceUpdatedAt: z.string().datetime().optional(),
});

export const checkoutSchema = z.object({ plan: z.enum(["monthly", "yearly"]) });

export type CloudSnapshotInput = z.infer<typeof cloudSnapshotSchema>;
