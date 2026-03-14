"use client";

import { useMemo } from "react";
import { useAppSettings } from "@/context/AppSettingsContext";

export interface OperatingHoursState {
  isOpen: boolean;
  nowIstMinutes: number;
  openMinutes: number;
  closeMinutes: number;
}

function parseTimeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map((part) => Number(part));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return 0;
  }

  return hour * 60 + minute;
}

function getIstMinutesNow(): number {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const hourPart = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minutePart =
    parts.find((part) => part.type === "minute")?.value ?? "00";

  const hour = Number(hourPart);
  const minute = Number(minutePart);
  return hour * 60 + minute;
}

export function useOperatingHours(): OperatingHoursState {
  const { settings } = useAppSettings();

  return useMemo(() => {
    const openMinutes = parseTimeToMinutes(settings.order.openTimeIst);
    const closeMinutes = parseTimeToMinutes(settings.order.closeTimeIst);
    const nowIstMinutes = getIstMinutesNow();

    const isOpen =
      closeMinutes > openMinutes
        ? nowIstMinutes >= openMinutes && nowIstMinutes < closeMinutes
        : nowIstMinutes >= openMinutes || nowIstMinutes < closeMinutes;

    return {
      isOpen,
      nowIstMinutes,
      openMinutes,
      closeMinutes,
    };
  }, [settings.order.closeTimeIst, settings.order.openTimeIst]);
}
