"use client";

import { useCallback, useEffect, useRef } from "react";

export function useMountedCallback<T extends unknown[]>(
 callback: (...args: T) => void,
) {
 const callbackRef = useRef(callback);
 const isMountedRef = useRef(false);

 useEffect(() => {
  callbackRef.current = callback;
 }, [callback]);

 useEffect(() => {
  isMountedRef.current = true;

  return () => {
   isMountedRef.current = false;
  };
 }, []);

 return useCallback((...args: T) => {
  if (!isMountedRef.current) {
   return;
  }

  callbackRef.current(...args);
 }, []);
}
