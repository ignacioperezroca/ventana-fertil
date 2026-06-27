"use client";

import type { PointerEvent } from "react";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";

export function EggOrbitHero({
  onPrimaryAction,
  onSecondaryAction,
  title = "🥚 Ventana Fértil",
  subtitle = "Calculá tus días más fértiles del mes en segundos.",
  compactNote = "Estimación educativa. La ovulación puede moverse.",
  showContent = true,
}: {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  title?: string;
  subtitle?: string;
  compactNote?: string;
  showContent?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [pulseTick, setPulseTick] = useState(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [8, -8]), { stiffness: 220, damping: 18, mass: 0.6 });
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-10, 10]), { stiffness: 220, damping: 18, mass: 0.6 });

  const dots = useMemo(
    () => [
      { left: "12%", top: "26%", size: 8, glow: "bg-app-accent" },
      { left: "24%", top: "74%", size: 6, glow: "bg-app-rose" },
      { left: "78%", top: "20%", size: 7, glow: "bg-app-deep-rose" },
      { left: "84%", top: "60%", size: 5, glow: "bg-app-accent" },
      { left: "52%", top: "10%", size: 5, glow: "bg-app-rose" },
    ],
    [],
  );

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    pointerX.set(x);
    pointerY.set(y);
  };

  const handleLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-app-border bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98)_0%,rgba(255,248,242,0.96)_38%,rgba(246,230,222,0.9)_100%)] p-4 shadow-[0_28px_80px_-46px_rgba(36,22,47,0.5)] sm:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(216,111,143,0.08)_0%,rgba(75,44,85,0.04)_46%,transparent_75%)]" aria-hidden="true" />
      <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(228,183,51,0.18)_0%,rgba(228,183,51,0.02)_68%,transparent_72%)] blur-2xl" aria-hidden="true" />

      <div className={`relative grid gap-6 ${showContent ? "lg:grid-cols-[1.15fr_0.85fr] lg:items-center" : "grid-cols-1 justify-items-center"}`}>
        {showContent ? (
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-app-muted">
              <Sparkles className="size-3.5 text-app-accent" />
              Modo visual
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-app-foreground sm:text-5xl">{title}</h1>
              <p className="max-w-xl text-base leading-7 text-app-muted sm:text-lg">{subtitle}</p>
            </div>
            <p className="max-w-md text-sm leading-6 text-app-muted">{compactNote}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(75,44,85,0.55)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/25"
              >
                <Wand2 className="mr-2 size-4" />
                Calcular
              </button>
              <button
                type="button"
                onClick={onSecondaryAction}
                className="vf-press inline-flex h-12 items-center justify-center rounded-full border border-app-border bg-white/90 px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-app-primary/15"
              >
                Ver ejemplo
              </button>
            </div>
          </div>
        ) : null}

        <motion.div
          className={`relative mx-auto h-[320px] w-full max-w-[360px] cursor-grab [perspective:1200px] active:cursor-grabbing ${showContent ? "" : "lg:mx-0"}`}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          onPointerDown={() => setPulseTick((value) => value + 1)}
        >
          <motion.div
            key={pulseTick}
            className="absolute inset-0 rounded-[34px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,250,247,0.72)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_24px_60px_-36px_rgba(36,22,47,0.34)] backdrop-blur-xl"
            style={{
              rotateX: reducedMotion ? 0 : rotateX,
              rotateY: reducedMotion ? 0 : rotateY,
            }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[34px]">
              <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-app-rose/20" aria-hidden="true" />
              <div className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-app-primary/10" aria-hidden="true" />
              <div className="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_35%,#fffefc_0%,#fff5eb_48%,#eed6bc_100%)] shadow-[0_22px_45px_-28px_rgba(75,44,85,0.42)] vf-animate-float" aria-hidden="true">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.62)_16%,transparent_42%)]" aria-hidden="true" />
                <div className="absolute left-[30%] top-[24%] h-[42%] w-[26%] rounded-[50%_50%_44%_44%/60%_60%_40%_40%] bg-[radial-gradient(circle_at_40%_34%,#fffdf8_0%,#fff2de_46%,#ead2b4_100%)] shadow-[inset_0_-16px_20px_rgba(75,44,85,0.08),0_18px_24px_-18px_rgba(75,44,85,0.4)]" aria-hidden="true" />
                <div className="absolute left-[50%] top-[56%] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fffdf9_0%,#e4b733_70%,#c97a25_100%)] shadow-[0_0_0_10px_rgba(228,183,51,0.12)] vf-animate-pulse-soft" aria-hidden="true" />
              </div>
            </div>

            <div className="absolute inset-0" aria-hidden="true">
              <motion.div
                className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
                animate={reducedMotion ? undefined : { rotate: 360 }}
                transition={reducedMotion ? undefined : { duration: 24, repeat: Infinity, ease: "linear" }}
              >
                {dots.map((dot, index) => (
                  <span
                    key={`${dot.left}-${dot.top}`}
                    className={`absolute rounded-full ${dot.glow} shadow-[0_0_18px_rgba(255,255,255,0.6)]`}
                    style={{
                      left: dot.left,
                      top: dot.top,
                      width: `${dot.size}px`,
                      height: `${dot.size}px`,
                      transform: "translate(-50%, -50%)",
                      opacity: 0.9 - index * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/60 bg-white/72 p-4 shadow-[0_16px_30px_-24px_rgba(36,22,47,0.45)] backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-app-muted">Estado</p>
              <p className="mt-1 text-sm font-medium text-app-foreground">Ventana fértil estimada, lista para mover y explorar.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
