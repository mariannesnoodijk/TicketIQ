"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import {
  IDLE_ACTIVITY_THROTTLE_MS,
  IDLE_TIMEOUT_MS,
  IDLE_WARNING_BEFORE_MS,
} from "@/lib/auth/session-timeout";

type UseIdleTimeoutOptions = {
  enabled?: boolean;
  timeoutMs?: number;
  warningBeforeMs?: number;
  onTimeout: () => void;
};

export type IdleTimeoutState = {
  warningOpen: boolean;
  secondsRemaining: number;
  staySignedIn: () => void;
};

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

/**
 * Detecteert inactiviteit en toont een waarschuwing vóór automatische logout.
 * Activiteit (of "blijf ingelogd") reset de timers.
 */
export function useIdleTimeout({
  enabled = true,
  timeoutMs = IDLE_TIMEOUT_MS,
  warningBeforeMs = IDLE_WARNING_BEFORE_MS,
  onTimeout,
}: UseIdleTimeoutOptions): IdleTimeoutState {
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.ceil(warningBeforeMs / 1000)
  );

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef(0);
  const warningOpenRef = useRef(false);

  const handleTimeout = useEffectEvent(() => {
    onTimeout();
  });

  function clearTimers() {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    warningTimerRef.current = null;
    logoutTimerRef.current = null;
    countdownRef.current = null;
  }

  function startCountdown(ms: number) {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSecondsRemaining(Math.ceil(ms / 1000));
    countdownRef.current = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1_000);
  }

  function scheduleTimers() {
    clearTimers();
    warningOpenRef.current = false;
    setWarningOpen(false);

    const warningDelay = Math.max(0, timeoutMs - warningBeforeMs);

    warningTimerRef.current = setTimeout(() => {
      warningOpenRef.current = true;
      setWarningOpen(true);
      startCountdown(warningBeforeMs);
    }, warningDelay);

    logoutTimerRef.current = setTimeout(() => {
      clearTimers();
      warningOpenRef.current = false;
      setWarningOpen(false);
      handleTimeout();
    }, timeoutMs);
  }

  function staySignedIn() {
    scheduleTimers();
  }

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      warningOpenRef.current = false;
      setWarningOpen(false);
      return;
    }

    scheduleTimers();

    const onActivity = () => {
      if (warningOpenRef.current) return;

      const now = Date.now();
      if (now - lastActivityRef.current < IDLE_ACTIVITY_THROTTLE_MS) return;
      lastActivityRef.current = now;
      scheduleTimers();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    return () => {
      clearTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
    };
    // Timers worden opnieuw gezet bij enabled/timeout-wijzigingen; scheduleTimers is stabiel genoeg via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: reset only when policy changes
  }, [enabled, timeoutMs, warningBeforeMs]);

  return { warningOpen, secondsRemaining, staySignedIn };
}
