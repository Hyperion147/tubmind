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
export interface LockIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface LockIconProps extends Omit<
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

const LockIcon = forwardRef<LockIconHandle, LockIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 1,
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

  const lockVariants: Variants = {
   normal: { x: 0, rotate: 0 },
   animate: {
    x: [0, -3, 3, -3, 3, 0],
    rotate: [0, -2, 2, -2, 2, 0],
    transition: {
     duration: 0.4 * duration,
     repeat: loop ? Infinity : 0,
     repeatDelay: loop ? 1.2 * duration : 0,
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
      variants={lockVariants}
      animate={loop && !reduced ? "animate" : controls}
      initial="normal"
     >
      <m.rect
       width="18"
       height="11"
       x="3"
       y="11"
       rx="2"
       ry="2"
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
      <m.path
       d="M7 11V7a5 5 0 0 1 10 0v4"
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

LockIcon.displayName = "LockIcon";
export { LockIcon };
