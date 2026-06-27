import type { ReactNode } from "react";

export function ValidationMessage({ children }: { children: ReactNode }) {
  if (!children) return null;

  return (
    <p className="text-sm leading-6 text-rose-700" role="status" aria-live="polite">
      {children}
    </p>
  );
}
