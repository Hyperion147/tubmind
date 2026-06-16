"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { GoogleLoginButton } from "@/features/auth/components/google-login-button";

type AuthModalProps = {
  title?: string;
  description?: string;
  next?: string;
  onClose?: () => void;
  showClose?: boolean;
};

export function AuthModal({
  title = "Continue with Google",
  description = "Sign in to keep your ideas, comments, and dashboard activity connected to your account.",
  next = "/",
  onClose,
  showClose = true,
}: AuthModalProps) {
  const router = useRouter();
  const mounted = useHydrated();

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_26%,rgba(10,10,10,0.36)_100%)] p-4 backdrop-blur-sm md:p-6">
      <div className="relative w-full max-w-lg overflow-hidden border border-border/70 bg-card/94 p-7 shadow-[0_30px_100px_rgba(15,23,42,0.28)] md:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            background:
              "radial-gradient(circle at top left, var(--color-accent) 0%, transparent 30%), radial-gradient(circle at bottom right, var(--color-primary) 0%, transparent 34%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />
        {showClose ? (
          <button
            type="button"
            onClick={onClose ?? (() => router.back())}
            className="absolute right-4 top-4 border border-border bg-background/88 px-3 py-1 text-sm text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
            aria-label="Close login modal"
          >
            Close
          </button>
        ) : null}

        <div className="relative space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Tubmind Access
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-start">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {title}
              </h1>
              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3">
          <GoogleLoginButton next={next} />
          <p className="text-xs leading-6 text-muted-foreground">
            You will return to the exact screen you were trying to open after the Google flow completes.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
