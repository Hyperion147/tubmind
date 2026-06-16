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
export interface FolderOpenIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface FolderOpenIconProps extends Omit<
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

const FolderOpenIcon = forwardRef<FolderOpenIconHandle, FolderOpenIconProps>(
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
  const folderControls = useAnimation();
  const paperControls = useAnimation();
  const startFolderControls = useMountedCallback(
   (variant: "animate" | "normal") => {
    folderControls.start(variant);
   },
  );
  const startPaperControls = useMountedCallback(
   (variant: "animate" | "normal") => {
    paperControls.start(variant);
   },
  );
  const reduced = useReducedMotion();
  const isControlled = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (reduced) {
      startFolderControls("normal");
      startPaperControls("normal");
     } else {
      startFolderControls("animate");
      startPaperControls("animate");
     }
    },
    stopAnimation: () => {
     startFolderControls("normal");
     startPaperControls("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e: MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     startFolderControls("animate");
     startPaperControls("animate");
     return;
    }

    onMouseEnter?.(e);
   },
   [reduced, onMouseEnter, isAnimated, startFolderControls, startPaperControls],
  );

  const handleLeave = useCallback(
   (e: MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     startFolderControls("normal");
     startPaperControls("normal");
     return;
    }

    onMouseLeave?.(e);
   },
   [onMouseLeave, startFolderControls, startPaperControls],
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
    startFolderControls("animate");
    startPaperControls("animate");
   };

   const stopAnimation = () => {
    startFolderControls("normal");
    startPaperControls("normal");
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
  }, [isAnimated, loop, reduced, startFolderControls, startPaperControls]);

  const folderVariants: Variants = {
   normal: { scale: 1, rotate: 0, y: 0 },
   animate: {
    scale: [1, 1.05, 0.97, 1],
    rotate: [0, -2, 2, 0],
    y: [0, -1.5, 0.5, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
     repeat: loop ? Infinity : 0,
     repeatDelay: loop ? 1 * duration : 0,
    },
   },
  };

  const paperVariants: Variants = {
   normal: { y: 0, opacity: 0 },
   animate: {
    y: [-6, 0],
    opacity: [0, 1, 0],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
     delay: 0.2,
     repeat: loop ? Infinity : 0,
     repeatDelay: loop ? 0.9 * duration : 0,
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
       d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
       animate={loop && !reduced ? "animate" : folderControls}
       initial="normal"
       variants={folderVariants}
      />
      <m.rect
       x="7"
       y="11"
       width="10"
       height="6"
       rx="1"
       animate={loop && !reduced ? "animate" : paperControls}
       initial="normal"
       variants={paperVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

FolderOpenIcon.displayName = "FolderOpenIcon";
export { FolderOpenIcon };
