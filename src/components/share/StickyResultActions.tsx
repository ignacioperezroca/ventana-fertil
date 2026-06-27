"use client";

import { CalendarDays, Copy, MessageCircleMore } from "lucide-react";

export function StickyResultActions({
  onWhatsApp,
  onCopy,
  onCalendar,
}: {
  onWhatsApp: () => void;
  onCopy: () => void;
  onCalendar: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[55] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 lg:hidden">
      <div className="mx-auto flex max-w-3xl gap-2 rounded-[24px] border border-app-border bg-[rgba(255,255,255,0.92)] p-2 shadow-[0_24px_60px_-30px_rgba(36,22,47,0.5)] backdrop-blur-xl">
        <ActionButton icon={MessageCircleMore} label="WhatsApp" onClick={onWhatsApp} tone="primary" />
        <ActionButton icon={Copy} label="Copiar" onClick={onCopy} tone="secondary" />
        <ActionButton icon={CalendarDays} label="Calendario" onClick={onCalendar} tone="secondary" />
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: typeof CalendarDays;
  label: string;
  onClick: () => void;
  tone: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`vf-press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[18px] px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
        tone === "primary" ? "bg-app-primary text-white shadow-[0_14px_26px_-18px_rgba(75,44,85,0.48)]" : "border border-app-border bg-white text-app-foreground"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

