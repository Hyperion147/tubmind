"use client";

import { motion, useReducedMotion } from "motion/react";

const blueprintBlocks = [
  {
    className: "left-6 top-28 hidden xl:block",
    lines: [
      "+----+    +--+      |      :",
      "|    |    |  |      |      :",
      "+----+    +--+      |      :",
      "",
      "+-----------+    +------+  :",
      "| vanity    |    | tile |  :",
      "+-----------+    +------+  :",
    ],
  },
  {
    className: "right-10 top-40 hidden 2xl:block",
    lines: [
      "+------+    +-----------+",
      "| tub  |    | storage   |",
      "+------+    +-----------+",
      "",
      "|   :   |   |   :   |   |",
      "+---+---+   +---+---+---+",
    ],
  },
  {
    className: "left-10 bottom-36 hidden xl:block",
    lines: [
      "+----+    +----+    +----+",
      "| 01 |    | 02 |    | 03 |",
      "+----+    +----+    +----+",
      "",
      "|  wall  |  niche  |  light  |",
    ],
  },
] as const;

const noteBlocks = [
  {
    className: "right-24 top-96 hidden lg:block",
    lines: [
      "[ capture ]",
      "title: warm spa bathroom",
      "summary: calm, hidden storage",
      ">> capture fragments",
      ">> refine layout",
      ">> shape into plan",
    ],
  },
  {
    className: "left-20 top-[28rem] hidden lg:block",
    lines: [
      "[ organize ]",
      "voice memo:",
      "  softer light near mirror",
      "screens:",
      "  terrazzo sink / ribbed glass",
      "status: refining",
    ],
  },
  {
    className: "right-20 bottom-40 hidden xl:block",
    lines: [
      "[ review ]",
      "slug: /oak-spa-concept",
      "notes: ready to revisit",
      ">> ready for refinement",
    ],
  },
] as const;

const betaLaunchAscii = [
  "██████╗ ███████╗████████╗ █████╗",
  "██╔══██╗██╔════╝╚══██╔══╝██╔══██╗",
  "██████╔╝█████╗     ██║   ███████║",
  "██╔══██╗██╔══╝     ██║   ██╔══██║",
  "██████╔╝███████╗   ██║   ██║  ██║",
  "╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝",
] as const;

export function LandingGridBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-28 z-0 overflow-hidden"
      >
        <motion.pre
          className="relative left-1/2 -translate-x-1/2 whitespace-pre text-center font-mono text-[8px] leading-[1.1] tracking-[0.12em] text-foreground opacity-100 lg:block xl:text-[9px]"
          initial={
            prefersReducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 18,
                  filter: "blur(10px)",
                }
          }
          animate={
            prefersReducedMotion
              ? undefined
            : {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }
          }
          transition={{
            duration: 0.85,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {betaLaunchAscii.join("\n")}
        </motion.pre>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_28%,color-mix(in_oklch,var(--background)_86%,transparent)_58%,color-mix(in_oklch,var(--background)_98%,white)_100%)]" />

        <div className="absolute inset-y-0 left-0 w-56 bg-linear-to-r from-background/88 via-background/46 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-56 bg-linear-to-l from-background/88 via-background/46 to-transparent" />

        {blueprintBlocks.map((block, index) => (
          <motion.pre
            key={`blueprint-${index}`}
            className={`absolute whitespace-pre font-mono text-[10px] leading-4 tracking-[0.18em] text-primary/60 ${block.className}`}
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 16,
                    filter: "blur(10px)",
                  }
            }
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }
            }
            transition={{
              duration: 0.75,
              delay: 0.12 + index * 0.14,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {block.lines.join("\n")}
          </motion.pre>
        ))}

        {noteBlocks.map((block, index) => (
          <motion.pre
            key={`notes-${index}`}
            className={`absolute whitespace-pre font-mono text-[10px] leading-4 tracking-[0.14em] text-foreground ${block.className}`}
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 14,
                    filter: "blur(10px)",
                  }
            }
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }
            }
            transition={{
              duration: 0.7,
              delay: 0.18 + index * 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {block.lines.join("\n")}
          </motion.pre>
        ))}
      </div>
    </>
  );
}
