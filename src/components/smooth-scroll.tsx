"use client";

import { useEffect } from "react";

export function AppSmoothScroll() {
  useEffect(() => {
    let frame = 0;
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let cancelled = false;

    if (typeof window === "undefined") {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      return;
    }

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) {
        return;
      }

      lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = window.requestAnimationFrame(raf);
      };

      frame = window.requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      lenis?.destroy();
    };
  }, []);

  return null;
}
