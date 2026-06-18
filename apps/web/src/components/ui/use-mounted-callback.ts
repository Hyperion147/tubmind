"use client";

import { useCallback, useEffect, useRef } from "react";

export function useMountedCallback<T extends unknown[]>(
  callback: (...args: T) => void,
) {
  const callbackRef = useRef(callback);
  const isMountedRef = useRef(false);
  const isReadyRef = useRef(false);
  const queuedArgsRef = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);

  const cancelScheduledFrame = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const flushQueuedCallback = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    const args = queuedArgsRef.current;

    if (!args) {
      return;
    }

    queuedArgsRef.current = null;
    callbackRef.current(...args);
  }, []);

  const scheduleFlush = useCallback(() => {
    cancelScheduledFrame();
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      flushQueuedCallback();
    });
  }, [cancelScheduledFrame, flushQueuedCallback]);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    isMountedRef.current = true;
    isReadyRef.current = false;
    scheduleFlush();

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      isReadyRef.current = true;
      flushQueuedCallback();
    });

    return () => {
      cancelScheduledFrame();
      isMountedRef.current = false;
      isReadyRef.current = false;
      queuedArgsRef.current = null;
    };
  }, [cancelScheduledFrame, flushQueuedCallback, scheduleFlush]);

  return useCallback(
    (...args: T) => {
      if (!isMountedRef.current) {
        return;
      }

      queuedArgsRef.current = args;

      if (!isReadyRef.current) {
        return;
      }

      scheduleFlush();
    },
    [scheduleFlush],
  );
}
