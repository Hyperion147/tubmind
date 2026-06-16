"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useHydrated } from "@/hooks/use-hydrated";

type LandingStaggerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
};

export function LandingStagger({
  children,
  className,
  delay = 0,
  stagger = 0.08,
}: LandingStaggerProps) {
  const isHydrated = useHydrated();
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = isHydrated && prefersReducedMotion;

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}
