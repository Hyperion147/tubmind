"use client";

import { cn } from "@/lib/utils";
import type { Variants } from "motion/react";
import {
 LazyMotion,
 domMin,
 m,
 useAnimation,
 useReducedMotion,
} from "motion/react";
import {
 forwardRef,
 useEffect,
 useCallback,
 useImperativeHandle,
 useRef,
 type HTMLAttributes,
 type MouseEvent,
} from "react";
import { useMountedCallback } from "./use-mounted-callback";
export interface DashboardIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface DashboardIconProps extends Omit<
 HTMLAttributes<HTMLDivElement>,
 | "color"
 | "onDrag"
 | "onDragStart"
 | "onDragEnd"
 | "onAnimationStart"
 | "onAnimationEnd"
 | "onAnimationIteration"
> {
 size?: number;
 duration?: number;
 isAnimated?: boolean;
 loop?: boolean;
 color?: string;
}

const DashboardIcon = forwardRef<DashboardIconHandle, DashboardIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 0.6,
   isAnimated = true,
   loop = false,
   color,
   ...props
  },
  ref,
 ) => {
  const controls = useAnimation();
  const startControls = useMountedCallback((variant: "animate" | "normal") => {
   controls.start(variant);
  });
  const reduced = useReducedMotion();
  const isControlled = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () =>
     reduced ? startControls("normal") : startControls("animate"),
    stopAnimation: () => startControls("normal"),
   };
  });

  const handleEnter = useCallback(
   (e: MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     startControls("animate");
     return;
    }

    onMouseEnter?.(e);
   },
   [reduced, isAnimated, onMouseEnter, startControls],
  );

  const handleLeave = useCallback(
   (e: MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     startControls("normal");
     return;
    }

    onMouseLeave?.(e);
   },
   [onMouseLeave, startControls],
  );

  useEffect(() => {
   const node = rootRef.current;

   if (!node || !isAnimated || reduced || isControlled.current || loop) {
    return;
   }

   const parentButton = node.closest('[data-slot="button"]');

   if (!parentButton) {
    return;
   }

   const startAnimation = () => {
    startControls("animate");
   };

   const stopAnimation = () => {
    startControls("normal");
   };

   parentButton.addEventListener("mouseenter", startAnimation);
   parentButton.addEventListener("mouseleave", stopAnimation);
   parentButton.addEventListener("focusin", startAnimation);
   parentButton.addEventListener("focusout", stopAnimation);

   return () => {
    parentButton.removeEventListener("mouseenter", startAnimation);
    parentButton.removeEventListener("mouseleave", stopAnimation);
    parentButton.removeEventListener("focusin", startAnimation);
    parentButton.removeEventListener("focusout", stopAnimation);
   };
  }, [isAnimated, loop, reduced, startControls]);

  const iconVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.06, 0.98, 1],
    rotate: [0, -1.5, 1.5, 0],
    transition: {
     duration: 1.1 * duration,
     ease: "easeInOut",
     repeat: loop ? Infinity : 0,
     repeatDelay: loop ? 1 * duration : 0,
    },
   },
  };

  const tileVariants: Variants = {
   normal: { opacity: 1, scale: 1, y: 0 },
   animate: (i: number) => ({
    opacity: [0.6, 1],
    scale: [0.95, 1.04, 1],
    y: [3, -2, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
     delay: i * 0.08,
     repeat: loop ? Infinity : 0,
     repeatDelay: loop ? 1.1 * duration : 0,
    },
   }),
  };

  return (
   <LazyMotion features={domMin} strict>
    <m.div
     ref={rootRef}
     className={cn("inline-flex items-center justify-center", className)}
     onMouseEnter={handleEnter}
     onMouseLeave={handleLeave}
     {...props}
     style={{ color, ...props.style }}
    >
     <m.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={loop && !reduced ? "animate" : controls}
      initial="normal"
      variants={iconVariants}
     >
      <m.rect
       width="7"
       height="9"
       x="3"
       y="3"
       rx="1"
       variants={tileVariants}
       custom={0}
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
      <m.rect
       width="7"
       height="5"
       x="14"
       y="3"
       rx="1"
       variants={tileVariants}
       custom={1}
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
      <m.rect
       width="7"
       height="9"
       x="14"
       y="12"
       rx="1"
       variants={tileVariants}
       custom={2}
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
      <m.rect
       width="7"
       height="5"
       x="3"
       y="16"
       rx="1"
       variants={tileVariants}
       custom={3}
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

DashboardIcon.displayName = "DashboardIcon";
export { DashboardIcon };
