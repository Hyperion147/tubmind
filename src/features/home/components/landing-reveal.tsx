"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: number;
  duration?: number;
  inherit?: boolean;
};

export function LandingReveal({
  children,
  className,
  delay = 0,
  y = 18,
  blur = 15,
  duration = 1,
  inherit = false,
}: LandingRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    hidden: {
      opacity: 0,
      y,
      filter: `blur(${blur}px)`,
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  } as const;

  if (inherit) {
    return (
      <motion.div className={className} variants={variants}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
