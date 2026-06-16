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

 useEffect(() => {
  callbackRef.current = callback;
 }, [callback]);

 useEffect(() => {
  isMountedRef.current = true;
  isReadyRef.current = false;
  frameRef.current = window.requestAnimationFrame(() => {
   isReadyRef.current = true;

   if (queuedArgsRef.current) {
    const args = queuedArgsRef.current;
    queuedArgsRef.current = null;
    callbackRef.current(...args);
   }
  });

  return () => {
   if (frameRef.current !== null) {
    window.cancelAnimationFrame(frameRef.current);
   }

   isMountedRef.current = false;
   isReadyRef.current = false;
   queuedArgsRef.current = null;
  };
 }, []);

 return useCallback((...args: T) => {
  if (!isMountedRef.current) {
   return;
  }

   if (!isReadyRef.current) {
    queuedArgsRef.current = args;
    return;
   }

  callbackRef.current(...args);
 }, []);
}
