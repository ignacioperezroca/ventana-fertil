import type { ReactNode } from "react";

export function AnimatedTabs({ children }: { children: ReactNode }) {
  return <div className="transition-all duration-200 motion-safe:transition-transform">{children}</div>;
}
