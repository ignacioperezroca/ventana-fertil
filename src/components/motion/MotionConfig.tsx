"use client";

import { useReducedMotion } from "framer-motion";

export const vfSpring = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.8,
} as const;

export const vfFadeUp = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.99 },
} as const;

export const vfStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
} as const;

export function useVfMotionAllowed() {
  return !useReducedMotion();
}

