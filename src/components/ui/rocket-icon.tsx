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
export interface RocketIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface RocketIconProps extends Omit<
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

const RocketIcon = forwardRef<RocketIconHandle, RocketIconProps>(
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
  const reduced = useReducedMotion();
  const isControlled = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () =>
     reduced ? controls.start("normal") : controls.start("animate"),
    stopAnimation: () => controls.start("normal"),
   };
  });

  const handleEnter = useCallback(
   (e: MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     controls.start("animate");
     return;
    }

    onMouseEnter?.(e);
   },
   [controls, reduced, isAnimated, onMouseEnter],
  );

  const handleLeave = useCallback(
   (e: MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     controls.start("normal");
     return;
    }

    onMouseLeave?.(e);
   },
   [controls, onMouseLeave],
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
    controls.start("animate");
   };

   const stopAnimation = () => {
    controls.start("normal");
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
  }, [controls, isAnimated, loop, reduced]);

  const rocketVariants: Variants = {
   normal: { y: 0, x: 0 },
   animate: {
    y: [0, -3, 0],
    x: [0, 3, 0],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut",
     repeat: loop ? Infinity : 0,
     repeatDelay: loop ? 1 * duration : 0,
    },
   },
  };

  const thrustVariants: Variants = {
   normal: { opacity: 1, scale: 1 },
   animate: {
    opacity: [1, 0.3, 1],
    scale: [1, 1.4, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeInOut",
     repeat: loop ? Infinity : 0,
     repeatDelay: loop ? 1.3 * duration : 0,
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
     >
      <m.path
       d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
       variants={rocketVariants}
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
       style={{
        transformBox: "fill-box",
        transformOrigin: "center",
       }}
      />
      <m.path
       d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
       variants={rocketVariants}
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
      <m.path
       d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
       variants={rocketVariants}
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
      <m.path
       d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
       variants={thrustVariants}
       initial="normal"
       animate={loop && !reduced ? "animate" : controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

RocketIcon.displayName = "RocketIcon";
export { RocketIcon };
