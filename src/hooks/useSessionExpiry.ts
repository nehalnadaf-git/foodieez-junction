"use client";

import { useState, useEffect } from "react";
import type { DineSession } from "./usePayAtLast";

export interface SessionExpiryState {
  isExpiringSoon: boolean;  // < 10 minutes remaining
  isExpiringSoon5: boolean; // < 5 minutes remaining
  isExpired: boolean;
  minutesLeft: number;
  secondsLeft: number;
  timeDisplay: string;      // e.g. "9:45 remaining"
}

const IDLE_STATE: SessionExpiryState = {
  isExpiringSoon: false,
  isExpiringSoon5: false,
  isExpired: false,
  minutesLeft: 240,
  secondsLeft: 0,
  timeDisplay: "",
};

export function useSessionExpiry(session: DineSession | null): SessionExpiryState {
  const [state, setState] = useState<SessionExpiryState>(IDLE_STATE);

  useEffect(() => {
    if (!session) {
      setState(IDLE_STATE);
      return;
    }

    function compute(): SessionExpiryState {
      const now = Date.now();
      const msLeft = session!.sessionExpiry - now;

      if (msLeft <= 0) {
        return {
          isExpiringSoon: true,
          isExpiringSoon5: true,
          isExpired: true,
          minutesLeft: 0,
          secondsLeft: 0,
          timeDisplay: "0:00 remaining",
        };
      }

      const totalSeconds = Math.floor(msLeft / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return {
        isExpiringSoon: msLeft < 10 * 60 * 1000,
        isExpiringSoon5: msLeft < 5 * 60 * 1000,
        isExpired: false,
        minutesLeft: minutes,
        secondsLeft: seconds,
        timeDisplay: `${minutes}:${seconds.toString().padStart(2, "0")} remaining`,
      };
    }

    setState(compute());

    const interval = setInterval(() => {
      setState(compute());
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  return state;
}
