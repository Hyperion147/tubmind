"use client";

import { motion } from "motion/react";

const principles = [
  { title: "Private by default", motion: "lock" },
  { title: "Structured detail", motion: "tree" },
  { title: "Publish when ready", motion: "send" },
  { title: "Authenticated discussion", motion: "chat" },
] as const;

export function LandingTrustRow() {
  return (
    <section className="mt-6 w-full">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {principles.map(({ title, motion: motionType }) => (
          <motion.article
            key={title}
            initial="rest"
            whileHover="hover"
            className="group flex items-center gap-3 border border-border bg-card/72 px-4 py-3 text-left shadow-sm transition-[background-color,border-color,transform] duration-200 hover:border-primary/28 hover:bg-card/88"
          >
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center border border-primary/18 bg-secondary/55 text-primary">
              <TrustIcon motionType={motionType} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function TrustIcon({
  motionType,
}: {
  motionType: "lock" | "tree" | "send" | "chat";
}) {
  if (motionType === "lock") {
    return <LockIcon />;
  }

  if (motionType === "tree") {
    return <TreeIcon />;
  }

  if (motionType === "send") {
    return <SendIcon />;
  }

  return <ChatIcon />;
}

function LockIcon() {
  return (
    <motion.svg
      className="size-4 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.rect
        x="3"
        y="10"
        width="18"
        height="12"
        rx="2"
        fill="currentColor"
        stroke="none"
        variants={{
          rest: { scaleY: 0.08, opacity: 0.12 },
          hover: { scaleY: 1, opacity: 0.22 },
        }}
        style={{ originX: "50%", originY: "100%" }}
        transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx="12"
        cy="16"
        r="1"
        fill="currentColor"
        stroke="none"
        variants={{
          rest: { scale: 1, opacity: 1 },
          hover: { scale: [1, 0.86, 1], opacity: [1, 0.55, 1] },
        }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />
      <motion.rect
        x="3"
        y="10"
        width="18"
        height="12"
        rx="2"
        variants={{
          rest: { strokeOpacity: 1 },
          hover: { strokeOpacity: [1, 0.7, 1] },
        }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M7 10V7a5 5 0 0 1 10 0v3"
        variants={{
          rest: { y: 0, strokeOpacity: 1 },
          hover: { y: [0, -0.6, 0], strokeOpacity: [1, 0.72, 1] },
        }}
        transition={{ duration: 0.24, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

function TreeIcon() {
  return (
    <motion.svg
      className="size-5 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"
        variants={{
          rest: { y: 0, strokeOpacity: 1 },
          hover: { y: [0, -0.5, 0], strokeOpacity: [1, 0.78, 1] },
        }}
        transition={{ duration: 1, ease: "easeInOut", delay: 0.04 }}
      />
      <motion.path
        d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"
        variants={{
          rest: { y: 0, strokeOpacity: 1 },
          hover: { y: [0, 0.35, 0], strokeOpacity: [1, 0.82, 1] },
        }}
        transition={{ duration: 0.42, ease: "easeInOut", delay: 0.05 }}
      />
      <motion.path
        d="M3 5a2 2 0 0 0 2 2h3"
        variants={{
          rest: { pathLength: 1, opacity: 1 },
          hover: { pathLength: [0.3, 1, 1], opacity: [0.5, 1, 1] },
        }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M3 3v13a2 2 0 0 0 2 2h3"
        variants={{
          rest: { pathLength: 1, opacity: 1 },
          hover: { pathLength: [0.2, 1, 1], opacity: [0.45, 1, 1] },
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
      />
    </motion.svg>
  );
}

function SendIcon() {
  return (
    <motion.svg
      className="size-5 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
        variants={{
          rest: { x: 0, y: 0, rotate: 0 },
          hover: { x: [0, 1.2, 3.2, 0], y: [0, -0.8, 0], rotate: [0, -7, 0] },
        }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="m21.854 2.147-10.94 10.939"
        variants={{
          rest: { opacity: 0.35, pathLength: 0.55 },
          hover: { opacity: [0.35, 0.8, 0.35], pathLength: [0.55, 1, 0.55] },
        }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

function ChatIcon() {
  return (
    <motion.svg
      className="size-5 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M5 6h14v9H9l-4 3V6Z"
        variants={{
          rest: { y: 0, scale: 1 },
          hover: { y: [0, -1.2, 0], scale: [1, 1.04, 1] },
        }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.48, ease: "easeInOut" }}
      />
      {[8, 12, 16].map((cx, index) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy="10.5"
          r="1"
          fill="currentColor"
          stroke="none"
          variants={{
            rest: { y: 0, opacity: 0.65 },
            hover: { y: [0, -1.4, 0], opacity: [0.65, 1, 0.65] },
          }}
          transition={{ duration: 0.42, ease: "easeInOut", delay: index * 0.06 }}
        />
      ))}
    </motion.svg>
  );
}
