import type { ReactNode } from "react";

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 rounded-full border border-app-border bg-app-primary px-3 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  );
}
