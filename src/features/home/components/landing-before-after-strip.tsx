"use client";

import type { LucideIcon } from "lucide-react";
import { Mic, RefreshCcw, StickyNote, Images, ArrowRight, LockKeyhole, Globe2, CheckSquare, Square, FilePenLine, Send } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ComparisonDraft = {
  rawNotes: string;
  voiceMemo: string;
  screenshots: string;
  title: string;
  summary: string;
  status: "draft" | "submitted";
  visibility: "private" | "public";
  allowComments: boolean;
};

const STORAGE_KEY = "bathideas:landing-comparison-draft";
const STORAGE_EVENT = "bathideas:landing-comparison-draft-change";

const defaultDraft: ComparisonDraft = {
  rawNotes: "Need vanity storage, warm wood, soft lighting, less hotel and more spa.",
  voiceMemo: "Voice memo: keep the room calm, hide clutter, maybe floating oak shelves near the mirror.",
  screenshots: "Saved: terrazzo sink reference, ribbed glass partition, brushed brass sconce.",
  title: "Warm spa bathroom with oak storage",
  summary: "A calmer master-bath concept focused on hidden storage, soft light, and tactile materials.",
  status: "draft",
  visibility: "private",
  allowComments: true,
};

let cachedDraftSource: string | null | undefined;
let cachedDraftSnapshot: ComparisonDraft = defaultDraft;
const CONNECTOR_LOOP_MS = 2400;
const MAX_BORDER_CHARGE = 6;

export function LandingBeforeAfterStrip() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const draft = useSyncExternalStore(
    subscribeToDraft,
    getDraftSnapshot,
    () => defaultDraft
  );
  const [completedLoops, setCompletedLoops] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry?.isIntersecting ?? false);
      },
      {
        threshold: 0.45,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isActive || completedLoops >= MAX_BORDER_CHARGE) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCompletedLoops((current) => {
        const next = Math.min(current + 1, MAX_BORDER_CHARGE);
        return next;
      });
    }, CONNECTOR_LOOP_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [completedLoops, isActive]);

  function updateDraft<Key extends keyof ComparisonDraft>(key: Key, value: ComparisonDraft[Key]) {
    writeDraft({
      ...draft,
      [key]: value,
    });
  }

  function resetDraft() {
    clearDraft();
  }

  return (
    <section ref={sectionRef} className="mt-10 w-full border border-border bg-card/88 p-4 text-left shadow-sm backdrop-blur md:p-6">
      <div className="flex gap-3 md:items-end justify-between">
        <div className="space-y-3">
          <Badge variant="outline" className="px-3 py-1 font-mono">
            Before / After
          </Badge>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={resetDraft} className="shrink-0">
          <RefreshCcw className="size-3 md:size-4" />
          Reset demo
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <ComparisonPanel
          title="Messy capture"
          description="Notes, voice scraps, and saved references before the idea has any structure."
        >
          <MessyField
            icon={StickyNote}
            label="Rough notes"
            value={draft.rawNotes}
            onChange={(value) => updateDraft("rawNotes", value)}
            placeholder="Dump the rough thought here..."
            variant="tilted-left"
          />
          <MessyField
            icon={Mic}
            label="Voice memo"
            value={draft.voiceMemo}
            onChange={(value) => updateDraft("voiceMemo", value)}
            placeholder="Paste a quick voice transcript..."
            variant="tilted-right"
            visual="voice-memo"
          />
          <MessyField
            icon={Images}
            label="Screenshots"
            value={draft.screenshots}
            onChange={(value) => updateDraft("screenshots", value)}
            placeholder="List what was saved..."
            variant="tilted-left"
            visual="screenshots"
          />
        </ComparisonPanel>

        <div className="hidden items-center justify-center md:flex">
          <ComparisonConnector isActive={isActive} />
        </div>

        <ComparisonPanel
          title="Short Bathideas draft"
          description="A compact version of the edit flow, ready to refine later in the app."
          chargeLevel={completedLoops}
          formChargeLevel={Math.max(completedLoops - 1, 0)}
          controlChargeLevel={Math.max(completedLoops - 2, 0)}
          renderContent={({
            controlChargeLevel,
            formChargeLevel,
          }: {
            controlChargeLevel: number;
            formChargeLevel: number;
          }) => (
            <div
              className="space-y-3 border bg-linear-to-b from-background/92 via-background/84 to-secondary/38 p-3 shadow-sm transition-[background-color,border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-md"
              style={{
                borderColor: getChargedBorderColor(formChargeLevel, 8, 8),
              }}
            >
              <div
                className="space-y-3 duration-300"
                style={{
                  borderColor: getChargedBorderColor(controlChargeLevel, 6, 7),
                }}
              >
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-foreground">Idea title</span>
                  <Input
                    value={draft.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    placeholder="Give the concept a clear title"
                    className="h-11 bg-background/76 transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/25 hover:bg-background/88 focus-visible:border-primary/45"
                    style={{
                      borderColor: getChargedBorderColor(controlChargeLevel, 4, 6),
                    }}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-foreground">Summary</span>
                  <Textarea
                    value={draft.summary}
                    onChange={(event) => updateDraft("summary", event.target.value)}
                    placeholder="Summarize the concept in one calm paragraph"
                    className="min-h-28 resize-none bg-background/76 transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/25 hover:bg-background/88 focus-visible:border-primary/45"
                    style={{
                      borderColor: getChargedBorderColor(controlChargeLevel, 4, 6),
                    }}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <button
                    type="button"
                    onClick={() => updateDraft("status", draft.status === "draft" ? "submitted" : "draft")}
                    className={cn(
                      "inline-flex min-h-10 items-center justify-center gap-2 border border-border bg-card/90 px-3 py-2 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:border-primary/55 hover:bg-secondary/80 hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_color-mix(in_oklch,var(--primary)_18%,transparent)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      draft.status === "draft" &&
                        "border-primary/35 bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_0_0_1px_color-mix(in_oklch,var(--primary)_16%,transparent)]"
                    )}
                  >
                    {draft.status === "draft" ? (
                      <FilePenLine className="size-3.5" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    {draft.status === "draft" ? "Draft" : "Submitted"}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDraft("visibility", draft.visibility === "private" ? "public" : "private")}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2 border border-border bg-card/90 px-3 py-2 text-muted-foreground transition-colors duration-200 hover:border-primary/55 hover:bg-secondary/80 hover:text-foreground",
                      draft.visibility === "private" && "border-primary/35 bg-secondary text-secondary-foreground"
                    )}
                  >
                    {draft.visibility === "private" ? (
                      <LockKeyhole className="size-3.5" />
                    ) : (
                      <Globe2 className="size-3.5" />
                    )}
                    {draft.visibility}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDraft("allowComments", !draft.allowComments)}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2 border border-border bg-card/90 px-3 py-2 text-muted-foreground transition-colors duration-200 hover:border-primary/55 hover:bg-secondary/80 hover:text-foreground",
                      draft.allowComments && "border-primary/35 bg-secondary text-secondary-foreground"
                    )}
                  >
                    {draft.allowComments ? (
                      <CheckSquare className="size-3.5" />
                    ) : (
                      <Square className="size-3.5" />
                    )}
                    Comments
                  </button>
                </div>
              </div>
            </div>
          )}
        >
          <ListingPreviewCard draft={draft} />
        </ComparisonPanel>
      </div>
    </section>
  );
}

function ComparisonConnector({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex h-full min-h-52 w-40 flex-col items-center justify-center gap-3 px-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        Structure
      </span>

      <div className="relative flex h-12 w-full items-center justify-center overflow-hidden">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border/75" />
        <motion.div
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-3 w-24 -translate-y-1/2 bg-linear-to-r from-primary/0 via-primary/28 to-primary/0 blur-md"
          animate={isActive ? { x: ["-10%", "95%"] } : { x: "-10%" }}
          transition={
            isActive
              ? { duration: CONNECTOR_LOOP_MS / 1000, repeat: Infinity, ease: "linear" }
              : { duration: 0.2 }
          }
        />
        {[0, 0.3, 0.6, 1.0].map((delay) => (
          <motion.div
            key={delay}
            aria-hidden="true"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-primary w-full"
            animate={
              isActive
                ? { x: ["0%", "100%"], opacity: [0, 0.95, 0.95, 0] }
                : { x: "0%", opacity: 0 }
            }
            transition={
              isActive
                ? {
                    duration: CONNECTOR_LOOP_MS / 1000,
                    repeat: Infinity,
                    ease: "linear",
                    delay,
                  }
                : { duration: 0.2 }
            }
          >
            <ArrowRight className="size-4" />
          </motion.div>
        ))}
      </div>

      <span className="max-w-20 text-center text-xs leading-5 text-muted-foreground">
        Same idea, cleaner shape
      </span>
    </div>
  );
}

function subscribeToDraft(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleDraftChange = () => onStoreChange();

  window.addEventListener(STORAGE_EVENT, handleDraftChange);
  window.addEventListener("storage", handleDraftChange);

  return () => {
    window.removeEventListener(STORAGE_EVENT, handleDraftChange);
    window.removeEventListener("storage", handleDraftChange);
  };
}

function getDraftSnapshot() {
  if (typeof window === "undefined") {
    return defaultDraft;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved === cachedDraftSource) {
      return cachedDraftSnapshot;
    }

    cachedDraftSource = saved;
    cachedDraftSnapshot = saved
      ? { ...defaultDraft, ...(JSON.parse(saved) as Partial<ComparisonDraft>) }
      : defaultDraft;

    return cachedDraftSnapshot;
  } catch {
    cachedDraftSource = null;
    cachedDraftSnapshot = defaultDraft;
    return defaultDraft;
  }
}

function writeDraft(nextDraft: ComparisonDraft) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function clearDraft() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function ComparisonPanel({
  chargeLevel = 0,
  children,
  description,
  eyebrow,
  formChargeLevel = 0,
  renderContent,
  title,
  controlChargeLevel = 0,
}: {
  chargeLevel?: number;
  children?: ReactNode;
  description: string;
  eyebrow?: string;
  formChargeLevel?: number;
  renderContent?: (args: { controlChargeLevel: number; formChargeLevel: number }) => ReactNode;
  title: string;
  controlChargeLevel?: number;
}) {
  const chargedBorder = Math.min(chargeLevel, MAX_BORDER_CHARGE);
  const borderMix = 12 + chargedBorder * 9;

  return (
    <article
      className="relative flex h-full flex-col gap-4 border bg-card/74 p-4 shadow-sm"
      style={{
        borderColor: `color-mix(in oklch, var(--primary) ${borderMix}%, var(--border))`,
      }}
    >
      {chargeLevel > 0 ? (
        <BorderCircuitOverlay chargeLevel={chargeLevel} />
      ) : null}
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {eyebrow}
        </p>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3">
        {renderContent
          ? renderContent({ controlChargeLevel, formChargeLevel })
          : null}
        {children}
      </div>
    </article>
  );
}

function getChargedBorderColor(level: number, basePercent: number, stepPercent: number) {
  const mix = basePercent + Math.max(level, 0) * stepPercent;
  return `color-mix(in oklch, var(--primary) ${mix}%, var(--border))`;
}

function BorderCircuitOverlay({
  chargeLevel,
}: {
  chargeLevel: number;
}) {
  const perimeterPath =
    "M 0 50 L 0 0 L 100 0 L 100 100 L 0 100 L 0 50";
  const strokeOpacity = Math.min(0.18 + chargeLevel * 0.08, 0.58);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d={perimeterPath}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity={strokeOpacity}
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

function MessyField({
  icon: Icon,
  label,
  onChange,
  placeholder,
  value,
  variant,
  visual,
}: {
  icon: LucideIcon;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
  variant: "tilted-left" | "tilted-right";
  visual?: "voice-memo" | "screenshots";
}) {
  return (
    <label
      className={cn(
        "grid gap-2 border border-border bg-background/88 p-3 shadow-[0_10px_24px_rgba(0,0,0,0.04)]",
        variant === "tilted-left" ? "rotate-[-1deg]" : "rotate-[1deg]"
      )}
    >
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      {visual === "voice-memo" ? <VoiceMemoPreview /> : null}
      {visual === "screenshots" ? <ScreenshotPreview /> : null}
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-24 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
    </label>
  );
}

function VoiceMemoPreview() {
  return (
    <div className="border border-border bg-card/72 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center border border-primary/22 bg-secondary/60 text-primary">
            <Mic className="size-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Recording
            </p>
            <p className="text-xs text-foreground">00:42 idea note</p>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          live
        </span>
      </div>
    </div>
  );
}

function ScreenshotPreview() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { accent: "bg-[color-mix(in_oklch,var(--primary)_20%,white)]", label: "Tile" },
        { accent: "bg-[color-mix(in_oklch,var(--accent)_70%,white)]", label: "Mirror" },
        { accent: "bg-[color-mix(in_oklch,var(--secondary)_88%,white)]", label: "Light" },
      ].map((item) => (
        <div key={item.label} className="border border-border bg-card/72 p-1.5 shadow-sm">
          <div className={cn("relative h-18 overflow-hidden border border-border", item.accent)}>
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full text-foreground/45"
              viewBox="0 0 120 90"
              fill="none"
            >
              <rect x="9" y="10" width="102" height="70" stroke="currentColor" strokeWidth="1" />
              <circle cx="35" cy="32" r="8" fill="currentColor" fillOpacity="0.18" />
              <path
                d="M18 68 44 46l18 14 18-24 22 32"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ListingPreviewCard({ draft }: { draft: ComparisonDraft }) {
  const previewTitle = draft.title.trim() || "Untitled bathroom concept";
  const previewSummary =
    draft.summary.trim() || "No summary yet. Add a short overview before publishing.";
  const previewVisibility = draft.visibility === "public" ? "Public" : "Private";
  const previewStatus = draft.status === "submitted" ? "Submitted" : "Draft";

  return (
    <article className="group relative overflow-hidden border border-border bg-card/92 shadow-md backdrop-blur transition-[background-color,border-color,box-shadow] duration-300 hover:border-primary/35 hover:bg-card">
      <div className="pointer-events-none absolute right-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
        Preview
      </div>

      <div className="space-y-5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>BI</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">Bathideas demo</p>
              <p className="font-mono text-xs text-muted-foreground">Live card preview</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono">
            {previewVisibility}
          </Badge>
        </div>

        <div className="space-y-2">
          <h4 className="max-w-[90%] text-2xl tracking-tight text-foreground transition-colors group-hover:text-primary">
            {previewTitle}
          </h4>
          <p className="line-clamp-3 text-sm leading-5 text-muted-foreground">
            {previewSummary}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="border border-border bg-secondary/65 px-2 py-2 text-secondary-foreground">
            {previewStatus}
          </span>
          <span className="border border-border bg-background/65 px-2 py-2">
            {draft.allowComments ? "Comments on" : "Comments off"}
          </span>
          <span className="border border-border bg-background/65 px-2 py-2">
            Details
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/70 px-4 py-4">
        <Badge variant="secondary" className="max-w-[55%] truncate px-3 py-1 font-mono">
          /demo-live-preview
        </Badge>
        <span className="inline-flex items-center gap-2 text-sm text-foreground">
          Open idea
          <ArrowRight className="size-4 text-primary" />
        </span>
      </div>
    </article>
  );
}
