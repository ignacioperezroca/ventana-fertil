"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { vfFadeUp, vfSpring, vfStagger, useVfMotionAllowed } from "./MotionConfig";

export function MotionPage({
  children,
  className = "",
  reducedMotion = false,
}: {
  children: ReactNode;
  className?: string;
  reducedMotion?: boolean;
}) {
  return <MotionPageInner className={className} reducedMotion={reducedMotion}>{children}</MotionPageInner>;
}

function MotionPageInner({
  children,
  className = "",
  reducedMotion = false,
}: {
  children: ReactNode;
  className?: string;
  reducedMotion?: boolean;
}) {
  const motionAllowed = useVfMotionAllowed();
  if (!motionAllowed || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={vfFadeUp} initial="hidden" animate="visible" transition={vfSpring}>
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const motionAllowed = useVfMotionAllowed();
  if (!motionAllowed) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={vfFadeUp} initial="hidden" animate="visible" transition={vfSpring}>
      {children}
    </motion.div>
  );
}

export function MotionStagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  const motionAllowed = useVfMotionAllowed();
  if (!motionAllowed) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={vfStagger} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

export { AnimatePresence };
