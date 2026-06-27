"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { vfFadeUp, vfSpring, useVfMotionAllowed } from "./MotionConfig";

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  reducedMotion = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  reducedMotion?: boolean;
}) {
  const motionAllowed = useVfMotionAllowed();
  if (!motionAllowed || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={vfFadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ ...vfSpring, delay }}
    >
      {children}
    </motion.div>
  );
}
