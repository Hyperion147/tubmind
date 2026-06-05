"use client";

import { motion, useReducedMotion } from "motion/react";

const blueprintBlocks = [
  {
    className: "left-6 top-28 hidden xl:block",
    lines: [
      "+----------------+   +----------------+",
      "| private capture |   | google sign in |",
      "+----------------+   +----------------+",
      "",
      "+----------------+   +----------------+",
      "| notes + tags    |   | structure      |",
      "+----------------+   +----------------+",
    ],
  },
  {
    className: "right-10 top-40 hidden 2xl:block",
    lines: [
      "+----------------+   +----------------+",
      "| public listing  |   | reactions      |",
      "+----------------+   +----------------+",
      "",
      "+----------------+   +----------------+",
      "| discussion      |   | moderation     |",
      "+----------------+   +----------------+",
    ],
  },
  {
    className: "left-10 bottom-36 hidden xl:block",
    lines: [
      "+----+    +----+    +----+",
      "| 01 |    | 02 |    | 03 |",
      "+----+    +----+    +----+",
      "",
      "| save | refine | publish |",
    ],
  },
] as const;

const noteBlocks = [
  {
    className: "right-24 top-96 hidden lg:block",
    lines: [
      "[ capture ]",
      "idea: warm spa bathroom",
      "source: bathroom thought",
      ">> save with google sign in",
      ">> add notes and features",
      ">> keep private for now",
    ],
  },
  {
    className: "left-20 top-[28rem] hidden lg:block",
    lines: [
      "[ organize ]",
      "summary: softer light near mirror",
      "notes: terrazzo sink / ribbed glass",
      "status: refining structure",
      "dashboard: main hub",
    ],
  },
  {
    className: "right-20 bottom-40 hidden xl:block",
    lines: [
      "[ publish ]",
      "slug: /oak-spa-concept",
      "comments: public listing",
      "admin: moderation ready",
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
