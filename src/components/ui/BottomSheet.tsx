"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { vfFadeUp, vfSpring } from "@/components/motion/MotionConfig";

export function BottomSheet({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="w-full max-w-2xl rounded-[30px] border border-app-border bg-[rgba(255,251,248,0.96)] p-4 shadow-[0_28px_80px_-42px_rgba(36,22,47,0.56)] backdrop-blur-xl sm:p-6"
            variants={vfFadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={vfSpring}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-app-foreground">{title}</h2>
                {subtitle ? <p className="mt-1 text-sm leading-6 text-app-muted">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-10 items-center justify-center rounded-full border border-app-border bg-white text-app-muted transition hover:text-app-foreground focus:outline-none focus:ring-2 focus:ring-app-primary/20"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
