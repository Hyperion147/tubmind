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
export interface ShieldUserIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ShieldUserIconProps extends Omit<
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

const ShieldUserIcon = forwardRef<ShieldUserIconHandle, ShieldUserIconProps>(
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
  const reduced = useReducedMotion();
  const isControlled = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => controls.start("animate"),
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

   if (!node || !isAnimated || reduced || isControlled.current) {
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
  }, [controls, isAnimated, reduced]);

  const shieldVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [120, 0],
    opacity: [0.3, 1],
    transition: { duration: 0.8 * duration, ease: "easeInOut" },
   },
  };

  const bodyVariants: Variants = {
   normal: { opacity: 1, y: 0 },
   animate: {
    opacity: [0, 1],
    y: [6, 0],
    transition: {
     duration: 0.5 * duration,
     delay: 0.5,
     ease: "easeOut",
    },
   },
  };

  const headVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.5, 1.2, 1],
    opacity: [0, 1],
    transition: {
     duration: 0.6 * duration,
     delay: 0.3,
     ease: "easeOut",
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
      className="lucide lucide-shield-user-icon lucide-shield-user"
     >
      <m.path
       d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
       strokeDasharray="120"
       strokeDashoffset="0"
       variants={shieldVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M6.376 18.91a6 6 0 0 1 11.249.003"
       variants={bodyVariants}
       initial="normal"
       animate={controls}
      />
      <m.circle
       cx="12"
       cy="11"
       r="4"
       variants={headVariants}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ShieldUserIcon.displayName = "ShieldUserIcon";
export { ShieldUserIcon };
