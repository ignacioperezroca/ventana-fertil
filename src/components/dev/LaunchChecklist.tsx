"use client";

const ITEMS = [
  "Core flow works",
  "Result generated",
  "Share works",
  "Copy works",
  "Calendar download works",
  "Privacy section exists",
  "FAQ exists",
  "Metadata exists",
  "No unsafe phrases detected manually",
  "Build passes",
];

export function LaunchChecklist() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <section className="rounded-[30px] border border-dashed border-app-border bg-white/80 p-4 shadow-[0_16px_50px_-36px_rgba(36,22,47,0.24)] sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Dev only</p>
      <h3 className="mt-2 text-lg font-semibold text-app-foreground">Launch checklist</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-app-muted">
        {ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span aria-hidden="true">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
