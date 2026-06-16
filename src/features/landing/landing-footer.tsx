"use client";

import { motion, useReducedMotion } from "motion/react";
import { useHydrated } from "@/hooks/use-hydrated";

const LandingFooter = () => {
    const isHydrated = useHydrated();
    const prefersReducedMotion = useReducedMotion();
    const shouldReduceMotion = isHydrated && prefersReducedMotion;

    return (
        <div
            className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
            style={{
                WebkitMaskImage:
                    "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 28%, rgba(0,0,0,0.72) 52%, rgba(0,0,0,0) 100%)",
                maskImage:
                    "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 28%, rgba(0,0,0,0.72) 52%, rgba(0,0,0,0) 100%)",
            }}
        >
            <motion.p
                className="w-full translate-y-[20%] text-center font-sans text-[clamp(2em,10vw,14rem)] font-semibold tracking-[-0.08em] text-foreground/8"
                initial={
                    shouldReduceMotion
                        ? false
                        : {
                              opacity: 0,
                              y: 40,
                              filter: "blur(14px)",
                          }
                }
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                              opacity: 1,
                              y: 0,
                              filter: "blur(0px)",
                          }
                }
                transition={{
                    duration: 0.9,
                    delay: 0.44,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                draft. update. review.
            </motion.p>
        </div>
    );
};

export default LandingFooter;
