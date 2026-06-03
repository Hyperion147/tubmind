"use client";

import {
  Globe2,
  LayoutPanelTop,
  LockKeyhole,
  MessagesSquare,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const workflowSteps = [
  { icon: "draft", index: "01", label: "Private draft", x: 110 },
  { icon: "page", index: "02", label: "Detailed page", x: 340 },
  { icon: "listing", index: "03", label: "Public listing", x: 570 },
  { icon: "comments", index: "04", label: "Comments", x: 800 },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;
const desktopRail = { start: 38, end: 882 };
const mobileRail = { start: 24, end: 264 };
const cycle = {
  duration: 7.2,
  delay: 0.65,
  hold: 0.075,
  resetAt: 0.97,
};

function getDesktopProgress(x: number) {
  return (x - desktopRail.start) / (desktopRail.end - desktopRail.start);
}

function getMobileProgress(y: number) {
  return (y - mobileRail.start) / (mobileRail.end - mobileRail.start);
}

function getCheckpointStart(progress: number, index: number) {
  const travelWindow = cycle.resetAt - workflowSteps.length * cycle.hold;

  return progress * travelWindow + index * cycle.hold;
}

function getCheckpointTimes(progress: number, index: number) {
  const start = getCheckpointStart(progress, index);

  return [0, start, start + cycle.hold, cycle.resetAt, 1];
}

function getProgressTimeline(progresses: number[]) {
  const times = [0];
  const values = [0];

  progresses.forEach((progress, index) => {
    const start = getCheckpointStart(progress, index);

    times.push(start, start + cycle.hold);
    values.push(progress, progress);
  });

  times.push(cycle.resetAt, 1);
  values.push(1, 1);

  return { times, values };
}

function StepIcon({
  icon,
  x,
  y,
}: {
  icon: (typeof workflowSteps)[number]["icon"];
  x: number;
  y: number;
}) {
  const icons = {
    comments: MessagesSquare,
    draft: LockKeyhole,
    listing: Globe2,
    page: LayoutPanelTop,
  } as const;
  const Icon = icons[icon];

  return (
    <Icon
      aria-hidden="true"
      height="22"
      strokeWidth="1.6"
      width="22"
      x={x - 11}
      y={y - 11}
    />
  );
}

export function LandingWorkflowLine() {
  const prefersReducedMotion = useReducedMotion();
  const desktopProgresses = workflowSteps.map((step) => getDesktopProgress(step.x));
  const desktopTimeline = getProgressTimeline(desktopProgresses);
  const mobileProgresses = workflowSteps.map((_, index) =>
    getMobileProgress(32 + index * 72)
  );
  const mobileTimeline = getProgressTimeline(mobileProgresses);

  return (
    <figure
      aria-label="Workflow: Private draft, Detailed page, Public listing, Comments"
      className="relative mt-8 w-full max-w-5xl overflow-hidden md:mt-10"
    >
      <svg
        className="hidden h-30 w-full overflow-visible text-foreground md:block"
        viewBox="0 0 920 132"
        role="img"
      >
        <path
          d="M38 42H882"
          fill="none"
          stroke="var(--color-border)"
          strokeLinecap="round"
          strokeOpacity="0.34"
          strokeWidth="1"
        />
        <motion.path
          d="M38 42H882"
          fill="none"
          stroke="var(--color-primary)"
          strokeLinecap="round"
          strokeWidth="1"
          initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  pathLength: desktopTimeline.values,
                  opacity: [0.18, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72],
                }
          }
          transition={{
            duration: cycle.duration,
            delay: cycle.delay,
            ease: "linear",
            times: desktopTimeline.times,
          }}
        />

        {!prefersReducedMotion && (
          <motion.circle
            r="2.5"
            cy="42"
            fill="var(--color-primary)"
            initial={{ cx: 38, opacity: 0 }}
            animate={{
              cx: desktopTimeline.values.map(
                (progress) =>
                  desktopRail.start +
                  progress * (desktopRail.end - desktopRail.start)
              ),
              opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            }}
            transition={{
              duration: cycle.duration,
              delay: cycle.delay,
              ease: "linear",
              times: desktopTimeline.times,
            }}
          />
        )}

        {workflowSteps.map((step, index) => (
          <motion.g
            key={step.label}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 + index * 0.12, ease }}
          >
            <motion.rect
              x={step.x - 28}
              y="14"
              width="56"
              height="56"
              fill="var(--color-background)"
              stroke="var(--color-border)"
              strokeWidth="1"
              initial={
                prefersReducedMotion
                  ? false
                  : { pathLength: 0, rotate: 45, scale: 0.72 }
              }
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      pathLength: [0, 0, 1, 1, 1],
                      rotate: 0,
                      scale: 1,
                      stroke: [
                        "var(--color-border)",
                        "var(--color-border)",
                        "var(--color-primary)",
                        "var(--color-primary)",
                        "var(--color-primary)",
                      ],
                    }
              }
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              transition={{
                default: {
                  duration: 0.45,
                  delay: 0.38 + index * 0.12,
                  ease,
                },
                pathLength: {
                  duration: cycle.duration,
                  delay: cycle.delay,
                  ease: "linear",
                  times: getCheckpointTimes(
                    getDesktopProgress(step.x),
                    index
                  ),
                },
                stroke: {
                  duration: cycle.duration,
                  delay: cycle.delay,
                  ease: "linear",
                  times: getCheckpointTimes(
                    getDesktopProgress(step.x),
                    index
                  ),
                },
              }}
            />
            <motion.rect
              x={step.x - 16}
              y="26"
              width="32"
              height="32"
              fill="color-mix(in oklch, var(--color-primary) 30%, var(--color-background))"
              opacity="0.72"
            />
            <motion.g
              clipPath={`url(#workflow-icon-clip-${index})`}
              fill="none"
              stroke="var(--color-primary)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.2"
            >
              <StepIcon icon={step.icon} x={step.x} y={42} />
            </motion.g>
            <clipPath id={`workflow-icon-clip-${index}`}>
              <motion.rect
                x={step.x - 16}
                y="26"
                width="32"
                height="32"
                initial={prefersReducedMotion ? false : { height: 0 }}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { height: [0, 0, 32, 32, 32] }
                }
                transition={{
                  duration: cycle.duration,
                  delay: cycle.delay,
                  ease: "linear",
                  times: getCheckpointTimes(getDesktopProgress(step.x), index),
                }}
              />
            </clipPath>
            <path
              d={`M${step.x} 58V78`}
              stroke="var(--color-border)"
              strokeOpacity="0.8"
              strokeWidth="1"
            />
            <text
              x={step.x}
              y="94"
              fill="var(--color-muted-foreground)"
              fontFamily="var(--font-mono)"
              fontSize="10"
              letterSpacing="3"
              textAnchor="middle"
            >
              {step.index}
            </text>
            <motion.text
              x={step.x}
              y="128"
              fill="currentColor"
              fontFamily="var(--font-sans)"
              fontSize="19"
              fontWeight="520"
              initial={prefersReducedMotion ? false : { opacity: 0.7 }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : { opacity: [0.7, 0.7, 1, 1, 1] }
              }
              textAnchor="middle"
              transition={{
                duration: cycle.duration,
                delay: cycle.delay,
                ease: "linear",
                times: getCheckpointTimes(getDesktopProgress(step.x), index),
              }}
            >
              {step.label}
            </motion.text>
          </motion.g>
        ))}
      </svg>

      <svg
        className="h-72 w-full overflow-visible text-foreground md:hidden"
        viewBox="0 0 340 288"
        role="img"
      >
        <title>Private draft to detailed page to public listing to comments</title>
        <path
          d="M42 24V264"
          fill="none"
          stroke="var(--color-border)"
          strokeLinecap="round"
          strokeOpacity="0.34"
          strokeWidth="1"
        />
        <motion.path
          d="M42 24V264"
          fill="none"
          stroke="var(--color-primary)"
          strokeLinecap="round"
          strokeWidth="1"
          initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  pathLength: mobileTimeline.values,
                  opacity: [0.18, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72, 0.72],
                }
          }
          transition={{
            duration: cycle.duration,
            delay: cycle.delay,
            ease: "linear",
            times: mobileTimeline.times,
          }}
        />

        {!prefersReducedMotion && (
          <motion.circle
            r="2.5"
            cx="42"
            fill="var(--color-primary)"
            initial={{ cy: mobileRail.start, opacity: 0 }}
            animate={{
              cy: mobileTimeline.values.map(
                (progress) =>
                  mobileRail.start +
                  progress * (mobileRail.end - mobileRail.start)
              ),
              opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            }}
            transition={{
              duration: cycle.duration,
              delay: cycle.delay,
              ease: "linear",
              times: mobileTimeline.times,
            }}
          />
        )}

        {workflowSteps.map((step, index) => {
          const y = 32 + index * 72;

          return (
            <motion.g
              key={step.label}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.48, delay: 0.24 + index * 0.12, ease }}
            >
              <motion.rect
                x="18"
                y={y - 24}
                width="48"
                height="48"
                fill="var(--color-background)"
                stroke="var(--color-border)"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        pathLength: [0, 0, 1, 1, 1],
                        stroke: [
                          "var(--color-border)",
                          "var(--color-border)",
                          "var(--color-primary)",
                          "var(--color-primary)",
                          "var(--color-primary)",
                        ],
                      }
                }
                transition={{
                pathLength: {
                  duration: cycle.duration,
                  delay: cycle.delay,
                  ease: "linear",
                  times: getCheckpointTimes(getMobileProgress(y), index),
                },
                stroke: {
                  duration: cycle.duration,
                  delay: cycle.delay,
                  ease: "linear",
                  times: getCheckpointTimes(getMobileProgress(y), index),
                },
              }}
              />
              <motion.rect
                x="30"
                y={y - 12}
                width="24"
                height="24"
                fill="color-mix(in oklch, var(--color-primary) 30%, var(--color-background))"
                opacity="0.72"
              />
              <motion.g
                clipPath={`url(#workflow-mobile-icon-clip-${index})`}
                fill="none"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.2"
              >
                <StepIcon icon={step.icon} x={42} y={y} />
              </motion.g>
              <clipPath id={`workflow-mobile-icon-clip-${index}`}>
                <motion.rect
                  x="30"
                  y={y - 12}
                  width="24"
                  height="24"
                  initial={prefersReducedMotion ? false : { height: 0 }}
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { height: [0, 0, 24, 24, 24] }
                  }
                  transition={{
                    duration: cycle.duration,
                    delay: cycle.delay,
                    ease: "linear",
                    times: getCheckpointTimes(getMobileProgress(y), index),
                  }}
                />
              </clipPath>
              <text
                x="72"
                y={y + 9}
                fill="var(--color-muted-foreground)"
                fontFamily="var(--font-mono)"
                fontSize="10"
                letterSpacing="3"
              >
                {step.index}
              </text>
              <motion.text
                x="72"
                y={y + 14}
                fill="currentColor"
                fontFamily="var(--font-sans)"
                fontSize="20"
                fontWeight="520"
                initial={prefersReducedMotion ? false : { opacity: 0.7 }}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: [0.7, 0.7, 1, 1, 1] }
                }
                transition={{
                  duration: cycle.duration,
                  delay: cycle.delay,
                  ease: "linear",
                  times: getCheckpointTimes(getMobileProgress(y), index),
                }}
              >
                {step.label}
              </motion.text>
            </motion.g>
          );
        })}
      </svg>
    </figure>
  );
}
