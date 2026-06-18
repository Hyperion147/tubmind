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
 useCallback,
 useEffect,
 useImperativeHandle,
 useRef,
 type HTMLAttributes,
 type MouseEvent,
} from "react";
import { useMountedCallback } from "./use-mounted-callback";
export interface PlusIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface PlusIconProps extends Omit<
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
 color?: string;
}

const PlusIcon = forwardRef<PlusIconHandle, PlusIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 1,
   isAnimated = true,
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
    if (!isControlled.current) startControls("animate");
    else onMouseEnter?.(e);
   },
   [reduced, isAnimated, onMouseEnter, startControls],
  );

  const handleLeave = useCallback(
   (e: MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     startControls("normal");
    } else {
     onMouseLeave?.(e);
    }
   },
   [onMouseLeave, startControls],
  );

  useEffect(() => {
   const node = rootRef.current;

   if (!node || !isAnimated || reduced || isControlled.current) {
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
  }, [isAnimated, reduced, startControls]);

  const plusVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.2, 0.85, 1],
    rotate: [0, 10, -10, 0],
    transition: { duration: 1 * duration, ease: "easeInOut", repeat: 0 },
   },
  };

  const lineVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: 1,
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut",
     repeat: 0,
     repeatDelay: 0.4,
    },
   },
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
      animate={controls}
      initial="normal"
      variants={plusVariants}
     >
      <m.path d="M5 12h14" variants={lineVariants} />
      <m.path d="M12 5v14" variants={lineVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

PlusIcon.displayName = "PlusIcon";
export { PlusIcon };
