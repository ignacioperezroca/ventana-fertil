"use client";

import type { ReactNode } from "react";
import { CalendarRange, Egg, Sparkles } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";

export function VisualExplanationSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Por qué los días previos importan?"
      subtitle="Una explicación corta, visual y sin rodeos."
    >
      <div className="grid gap-3">
        <Bullet
          icon={<Sparkles className="size-4 text-app-accent" />}
          title="Los espermatozoides pueden vivir varios días"
          text="Por eso el marcador sube antes de ovular, no solo el mismo día."
        />
        <Bullet
          icon={<Egg className="size-4 text-app-primary" />}
          title="El óvulo vive menos tiempo"
          text="La ventana se concentra alrededor de los días previos a la ovulación."
        />
        <Bullet
          icon={<CalendarRange className="size-4 text-app-rose" />}
          title="El calendario puede moverse"
          text="Si la ovulación cambia, la ventana también puede correrse algunos días."
        />
      </div>
    </BottomSheet>
  );
}

function Bullet({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-[24px] border border-app-border bg-white p-4">
      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-app-surface-2">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-app-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">{text}</p>
      </div>
    </div>
  );
}
