"use client";

import { motion, useReducedMotion } from "motion/react";

const featurePanels = [
  {
    title: "Private capture with Google sign-in",
    description:
      "Save rough thoughts quickly, then keep them in a private workspace that starts with Google sign-in.",
    visual: "publish",
  },
  {
    title: "Rich idea pages",
    description:
      "Track summaries, notes, features, and structure in one focused place instead of scattered notes.",
    visual: "blueprint",
  },
  {
    title: "Public listings and moderation",
    description:
      "Publish the strongest ideas for reactions and discussion, while admin tools help moderate users, ideas, and comments during beta.",
    visual: "discussion",
  },
] as const;

type FeaturePanelItem = (typeof featurePanels)[number];
type FeatureVisual = FeaturePanelItem["visual"];

const ease = [0.22, 1, 0.36, 1] as const;

const panelVariants = {
  rest: {},
  hover: {},
} as const;

const studyVariants = {
  rest: { y: 0 },
  hover: { y: -6 },
} as const;

const lineVariants = {
  rest: { opacity: 0.55 },
  hover: { opacity: 0.9 },
} as const;

const accentVariants = {
  rest: { opacity: 0.45 },
  hover: { opacity: 1 },
} as const;

export function LandingFeaturePanels() {
  return (
    <div className="mt-20 grid w-full border-y border-border bg-card/58 text-left shadow-sm backdrop-blur lg:grid-cols-3">
      {featurePanels.map((item) => (
        <FeaturePanel key={item.title} item={item} />
      ))}
    </div>
  );
}

function FeaturePanel({ item }: { item: FeaturePanelItem }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      animate="rest"
      className="group relative min-h-100 overflow-hidden border-border px-6 py-6 transition-colors duration-500 hover:bg-card/82 lg:border-r lg:last:border-r-0"
      initial="rest"
      variants={panelVariants}
      whileHover={prefersReducedMotion ? undefined : "hover"}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <FeatureStudy prefersReducedMotion={prefersReducedMotion} type={item.visual} />
      <div className="mt-4 max-w-sm">
        <h3 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
          {item.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {item.description}
        </p>
      </div>
    </motion.article>
  );
}

function FeatureStudy({
  prefersReducedMotion,
  type,
}: {
  prefersReducedMotion: boolean | null;
  type: FeatureVisual;
}) {
  if (type === "blueprint") {
    return <BlueprintStudy prefersReducedMotion={prefersReducedMotion} />;
  }

  if (type === "discussion") {
    return <DiscussionStudy />;
  }

  return <PublishStudy />;
}

function BlueprintStudy({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null;
}) {
  return (
    <motion.svg
      aria-hidden="true"
      className="mt-6 h-48 w-full text-foreground"
      transition={{ duration: 0.5, ease }}
      variants={studyVariants}
      viewBox="0 0 320 190"
    >
      <motion.g
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        transition={{ duration: 0.5, ease }}
        variants={lineVariants}
      >
        <rect x="56" y="28" width="208" height="134" />
        <path d="M56 52h208" />
        <path d="M214 52v110" />
        <path d="M78 72h86" />
        <path d="M78 88h116" />
        <path d="M78 104h76" />
        <rect x="78" y="122" width="52" height="22" />
        <rect x="144" y="122" width="50" height="22" />
        <path d="M228 70h20" />
        <path d="M228 86h20" />
        <path d="M228 102h20" />
        <path d="M228 122h20" />
        <path d="M78 154h170" />
        <path d="M78 40h30" />
        <path d="M226 40h22" />
      </motion.g>
      <motion.g
        className="text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        transition={{ duration: 0.5, ease }}
        variants={accentVariants}
      >
        <rect x="114" y="38" width="4" height="4" fill="currentColor" />
        <rect x="122" y="38" width="4" height="4" fill="currentColor" />
        <rect x="130" y="38" width="4" height="4" fill="currentColor" />
        <motion.path
          d="M78 64h48"
          transition={{ duration: 0.45, ease }}
          variants={{ rest: { pathLength: 0.35 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M88 133h28"
          transition={{ duration: 0.45, ease }}
          variants={{ rest: { pathLength: 0.55 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M154 133h28"
          transition={{ duration: 0.55, ease }}
          variants={{ rest: { pathLength: 0.55 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M228 112h20"
          transition={{ duration: 0.5, ease }}
          variants={{ rest: { pathLength: 0.3 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M78 154h104"
          transition={{ duration: 0.7, ease }}
          variants={{ rest: { pathLength: 0.25 }, hover: { pathLength: 1 } }}
        />
        {!prefersReducedMotion && (
          <motion.rect
            fill="var(--color-primary)"
            height="108"
            opacity="0"
            transition={{ duration: 1.1, ease }}
            variants={{
              rest: { opacity: 0, x: 60 },
              hover: { opacity: [0, 0.1, 0], x: 196 },
            }}
            width="10"
            x="60"
            y="53"
          />
        )}
      </motion.g>
    </motion.svg>
  );
}

function DiscussionStudy() {
  return (
    <motion.svg
      aria-hidden="true"
      className="mt-6 h-48 w-full text-foreground"
      transition={{ duration: 0.5, ease }}
      variants={studyVariants}
      viewBox="0 0 320 190"
    >
      <motion.g
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        transition={{ duration: 0.5, ease }}
        variants={lineVariants}
      >
        <motion.rect
          height="46"
          transition={{ duration: 0.45, ease }}
          variants={{ rest: { x: 30 }, hover: { x: 35 } }}
          width="240"
          y="34"
        />
        <motion.rect
          height="48"
          transition={{ duration: 0.45, ease }}
          variants={{ rest: { x: 76 }, hover: { x: 80 } }}
          width="178"
          y="112"
        />
        <path d="M86 80v18l24-18" />
        <path d="M228 160v18l-28-18" />
        <circle cx="58" cy="57" r="9" />
        <circle cx="100" cy="136" r="9" />
        <path d="M92 52h86" />
        <path d="M92 63h118" />
        <path d="M92 72h80" />
        <path d="M118 130h108" />
        <path d="M118 142h72" />
        <path d="M118 152h126" />
      </motion.g>
      <motion.g
        className="text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        transition={{ duration: 0.5, ease }}
        variants={accentVariants}
      >
        <path d="M54 57h8" />
        <path d="M58 53v8" />
        <path d="M96 136h8" />
        <path d="M100 132v8" />
        <motion.path
          d="M224 52h26"
          transition={{ duration: 0.45, ease, delay: 0.3 }}
          variants={{ rest: { pathLength: 0.25 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M218 63h18"
          transition={{ duration: 0.55, ease, delay: 0.3 }}
          variants={{ rest: { pathLength: 0.25 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M200 142h50"
          transition={{ duration: 0.55, ease, delay: 0.5 }}
          variants={{ rest: { pathLength: 0.2 }, hover: { pathLength: 1 } }}
        />
      </motion.g>
    </motion.svg>
  );
}

function PublishStudy() {
  return (
    <motion.svg
      aria-hidden="true"
      className="mt-6 h-48 w-full text-foreground"
      transition={{ duration: 0.5, ease }}
      variants={studyVariants}
      viewBox="0 0 320 190"
    >
      <motion.g
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        transition={{ duration: 0.5, ease }}
        variants={lineVariants}
      >
        <motion.rect
          height="120"
          transition={{ duration: 0.5, ease }}
          variants={{ rest: { x: 40 }, hover: { x: 46 } }}
          width="220"
          y="34"
        />
        <motion.rect
          height="120"
          transition={{ duration: 0.5, ease }}
          variants={{ rest: { x: 174 }, hover: { x: 180 } }}
          width="220"
          x="174"
          y="34"
        />
        <path d="M76 72h48" />
        <path d="M76 92h34" />
        <path d="M76 124h50" />
        <path d="M198 72h48" />
        <path d="M198 92h34" />
        <path d="M198 124h50" />
        <path d="M146 96h28" />
        <motion.path
          d="m164 86 10 10-10 10"
          transition={{ duration: 0.5, ease }}
          variants={{ rest: { x: 0 }, hover: { x: 8 } }}
        />
        <path d="M58 164h204" />
      </motion.g>
      <motion.g
        className="text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        transition={{ duration: 0.5, ease }}
        variants={accentVariants}
      >
        <motion.rect
          height="10"
          transition={{ duration: 0.45, ease }}
          variants={{ rest: { opacity: 0.35 }, hover: { opacity: 0.75 } }}
          width="44"
          x="76"
          y="50"
        />
        <motion.path
          d="M196 50h48v10h-48z"
          transition={{ duration: 0.55, ease, delay: 0.3 }}
          variants={{ rest: { pathLength: 0.7 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M204 136h30"
          transition={{ duration: 0.45, ease, delay: 0.5 }}
          variants={{ rest: { pathLength: 0.35 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M210 142h18"
          transition={{ duration: 0.5, ease, delay: 0.7 }}
          variants={{ rest: { pathLength: 0.35 }, hover: { pathLength: 1 } }}
        />
        <motion.path
          d="M90 136h18"
          transition={{ duration: 0.45, ease }}
          variants={{ rest: { pathLength: 0.25 }, hover: { pathLength: 1 } }}
        />
      </motion.g>
    </motion.svg>
  );
}
