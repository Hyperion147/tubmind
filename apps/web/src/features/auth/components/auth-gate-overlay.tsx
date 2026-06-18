"use client";

import { AuthModal } from "@/features/auth/components/auth-modal";

type AuthGateOverlayProps = {
  title: string;
  description: string;
  next?: string;
};

export function AuthGateOverlay({
  title,
  description,
  next = "/",
}: AuthGateOverlayProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_30%,rgba(15,23,42,0.34)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-72 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_72%)]" />
      <div className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-6">
        <AuthModal
          title={title}
          description={description}
          next={next}
          showClose={false}
        />
      </div>
    </>
  );
}
