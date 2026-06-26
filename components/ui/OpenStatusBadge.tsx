'use client';

import { useEffect, useState } from 'react';

interface OpenStatusBadgeProps {
  openingHours: string; // e.g. "Lun a Dom 10:00 - 23:00"
}

// Spanish weekday abbreviations → JS getDay() (0=Sun, 1=Mon, …, 6=Sat)
const dayMap: Record<string, number> = {
  dom: 0,
  lun: 1,
  mar: 2,
  mié: 3,
  mie: 3,
  jue: 4,
  vie: 5,
  sáb: 6,
  sab: 6,
};

function getArgentinaNowParts() {
  const formatter = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === 'weekday')?.value?.toLowerCase() ?? '';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  const dayKey = weekday.replace('.', '').slice(0, 3);
  const day = dayMap[dayKey];

  return {
    day: day ?? 0,
    minutes: hour * 60 + minute,
  };
}

function isWithinMinuteRange(currentMinutes: number, openMinutes: number, closeMinutes: number) {
  // Rango nocturno que cruza medianoche.
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

function parseTimeToMinutes(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function isOpenWithDayRange(openingHours: string, currentDay: number, currentMinutes: number) {
  const match = openingHours.match(/^(\w+)\s+a\s+(\w+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/i);
  if (!match) return null;

  const [, dayStart, dayEnd, openTime, closeTime] = match;
  const dayStartNum = dayMap[dayStart.toLowerCase()];
  const dayEndNum = dayMap[dayEnd.toLowerCase()];
  const openMinutes = parseTimeToMinutes(openTime);
  const closeMinutes = parseTimeToMinutes(closeTime);
  if (dayStartNum === undefined || dayEndNum === undefined || openMinutes === null || closeMinutes === null) {
    return false;
  }

  let isDayInRange = false;
  if (dayStartNum <= dayEndNum) {
    isDayInRange = currentDay >= dayStartNum && currentDay <= dayEndNum;
  } else {
    isDayInRange = currentDay >= dayStartNum || currentDay <= dayEndNum;
  }
  if (!isDayInRange) return false;

  return isWithinMinuteRange(currentMinutes, openMinutes, closeMinutes);
}

function isOpenWithTimeWindows(openingHours: string, currentMinutes: number) {
  // Example: "11:30 a 14:30 | 19:30 a 23:30 hs"
  const cleaned = openingHours.toLowerCase().replace(/\bhs\b/g, '').trim();
  const windows = cleaned
    .split('|')
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (windows.length === 0) return null;

  const ranges = windows
    .map((segment) => {
      const match = segment.match(/^(\d{1,2}:\d{2})\s*a\s*(\d{1,2}:\d{2})$/i);
      if (!match) return null;
      const openMinutes = parseTimeToMinutes(match[1]);
      const closeMinutes = parseTimeToMinutes(match[2]);
      if (openMinutes === null || closeMinutes === null) return null;
      return { openMinutes, closeMinutes };
    })
    .filter((range): range is { openMinutes: number; closeMinutes: number } => Boolean(range));

  if (ranges.length === 0) return false;
  return ranges.some((range) => isWithinMinuteRange(currentMinutes, range.openMinutes, range.closeMinutes));
}

function isOpenNow(openingHours: string): boolean {
  try {
    const { day: currentDay, minutes: currentMinutes } = getArgentinaNowParts();

    const byDayRange = isOpenWithDayRange(openingHours, currentDay, currentMinutes);
    if (byDayRange !== null) return byDayRange;

    const byWindows = isOpenWithTimeWindows(openingHours, currentMinutes);
    if (byWindows !== null) return byWindows;

    return false;
  } catch {
    return false;
  }
}

export default function OpenStatusBadge({ openingHours }: OpenStatusBadgeProps) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    // Calcular estado inicial
    setOpen(isOpenNow(openingHours));

    // Recompute every minute
    const interval = setInterval(() => {
      setOpen(isOpenNow(openingHours));
    }, 60_000);

    return () => clearInterval(interval);
  }, [openingHours]);

  // Hide badge until hydrated to avoid SSR mismatch
  if (open === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
        <span className="h-2 w-2 rounded-full bg-stone-500" />
        ...
      </span>
    );
  }

  if (open) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Abierto
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      Cerrado
    </span>
  );
}



