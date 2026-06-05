"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import {
  FolderOpenIcon,
  type FolderOpenIconHandle,
} from "@/components/ui/folder-open-icon";
import { LockIcon, type LockIconHandle } from "@/components/ui/lock-icon";
import { RocketIcon, type RocketIconHandle } from "@/components/ui/rocket-icon";
import {
  ShieldUserIcon,
  type ShieldUserIconHandle,
} from "@/components/ui/shield-user-icon";

const principles = [
  { title: "Private by default", motion: "lock" },
  { title: "Structured detail", motion: "folder" },
  { title: "Publish when ready", motion: "rocket" },
  { title: "Authenticated discussion", motion: "shield" },
] as const;

type PrincipleMotion = (typeof principles)[number]["motion"];
type TrustIconHandle =
  | LockIconHandle
  | FolderOpenIconHandle
  | RocketIconHandle
  | ShieldUserIconHandle;

export function LandingTrustRow() {
  return (
    <section className="mt-6 w-full">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {principles.map((principle) => (
          <TrustCard key={principle.title} {...principle} />
        ))}
      </div>
    </section>
  );
}

function TrustCard({
  title,
  motion: motionType,
}: {
  title: string;
  motion: PrincipleMotion;
}) {
  const iconRef = useRef<TrustIconHandle | null>(null);

  return (
    <motion.article
      className="group flex items-center gap-3 border border-border bg-card/72 px-4 py-3 text-left shadow-sm transition-[background-color,border-color,transform] duration-200 hover:border-primary/28 hover:bg-card/88"
      onFocusCapture={() => iconRef.current?.startAnimation()}
      onHoverEnd={() => iconRef.current?.stopAnimation()}
      onHoverStart={() => iconRef.current?.startAnimation()}
      onBlurCapture={() => iconRef.current?.stopAnimation()}
    >
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center border border-primary/18 bg-secondary/55 text-primary">
        <TrustIcon ref={iconRef} motionType={motionType} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
    </motion.article>
  );
}

function TrustIcon({
  motionType,
  ref,
}: {
  motionType: PrincipleMotion;
  ref: React.Ref<TrustIconHandle>;
}) {
  if (motionType === "lock") {
    return <LockIcon ref={ref} size={16} />;
  }

  if (motionType === "folder") {
    return <FolderOpenIcon ref={ref} size={16} />;
  }

  if (motionType === "rocket") {
    return <RocketIcon ref={ref} size={16} />;
  }

  return <ShieldUserIcon ref={ref} size={16} />;
}
