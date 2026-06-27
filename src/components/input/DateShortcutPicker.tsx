"use client";

import { CalendarDays, ChevronRight } from "lucide-react";

import { addDays, formatDateInput, todayIsoDate } from "@/lib/cycle";
import { trackEvent } from "@/lib/analytics";

const SHORTCUTS = [
  { label: "Hoy", offset: 0 },
  { label: "Ayer", offset: -1 },
  { label: "Hace 2 días", offset: -2 },
  { label: "Hace 3 días", offset: -3 },
] as const;

export function DateShortcutPicker({
  value,
  onChange,
  onOpenPicker,
  isDemo = false,
}: {
  value: string;
  onChange: (date: string) => void;
  onOpenPicker: () => void;
  isDemo?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Atajos</p>
      <div className="flex flex-wrap gap-2">
        {SHORTCUTS.map((shortcut) => {
          const iso = shortcut.offset === 0 ? todayIsoDate() : formatDateInput(addDays(new Date(), shortcut.offset));
          const active = value === iso;
          return (
            <button
              key={shortcut.label}
              type="button"
              onClick={() => {
                onChange(iso);
                trackEvent("date_shortcut_selected", {
                  source: shortcut.label.toLowerCase().replace(/\s+/g, "-"),
                  hasResult: false,
                  isDemo,
                  eventVersion: "g1",
                });
              }}
              className={`vf-press inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
                active ? "border-app-primary bg-app-primary/6 text-app-primary" : "border-app-border bg-white text-app-foreground hover:border-app-primary/25"
              }`}
              aria-pressed={active}
            >
              {shortcut.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenPicker}
          className="vf-press inline-flex h-10 items-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/25 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
        >
          <CalendarDays className="size-4 text-app-primary" />
          Elegir fecha
          <ChevronRight className="size-4 text-app-muted" />
        </button>
      </div>
      <p className="text-xs leading-5 text-app-muted">Usá un atajo o abrí el calendario. Si querés, después podés corregirlo.</p>
    </div>
  );
}
