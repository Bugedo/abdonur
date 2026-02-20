'use client';

import { useEffect, useState } from 'react';

interface OpenStatusBadgeProps {
  openingHours: string; // e.g. "Lun a Dom 10:00 - 23:00"
}

// Mapeo de días en español a JS getDay() (0=Dom, 1=Lun, ..., 6=Sáb)
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

function isOpenNow(openingHours: string): boolean {
  try {
    // Hora actual en Argentina
    const now = new Date();
    const argTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })
    );

    const currentDay = argTime.getDay(); // 0=Dom
    const currentMinutes = argTime.getHours() * 60 + argTime.getMinutes();

    // Parsear "Lun a Dom 10:00 - 23:00"
    const match = openingHours.match(
      /^(\w+)\s+a\s+(\w+)\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/i
    );

    if (!match) return false;

    const [, dayStart, dayEnd, hOpenStr, mOpenStr, hCloseStr, mCloseStr] = match;

    const dayStartNum = dayMap[dayStart.toLowerCase()];
    const dayEndNum = dayMap[dayEnd.toLowerCase()];

    if (dayStartNum === undefined || dayEndNum === undefined) return false;

    // Verificar si hoy está dentro del rango de días
    let isDayInRange = false;
    if (dayStartNum <= dayEndNum) {
      // Rango normal: Lun(1) a Vie(5)
      isDayInRange = currentDay >= dayStartNum && currentDay <= dayEndNum;
    } else {
      // Rango que cruza semana: Jue(4) a Dom(0) → 4,5,6,0
      isDayInRange = currentDay >= dayStartNum || currentDay <= dayEndNum;
    }

    if (!isDayInRange) return false;

    // Verificar horario
    const openMinutes = parseInt(hOpenStr) * 60 + parseInt(mOpenStr);
    let closeMinutes = parseInt(hCloseStr) * 60 + parseInt(mCloseStr);

    // Si cierra a las 00:00 significa medianoche (1440 min)
    if (closeMinutes === 0) closeMinutes = 24 * 60;

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } catch {
    return false;
  }
}

export default function OpenStatusBadge({ openingHours }: OpenStatusBadgeProps) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    // Calcular estado inicial
    setOpen(isOpenNow(openingHours));

    // Recalcular cada minuto
    const interval = setInterval(() => {
      setOpen(isOpenNow(openingHours));
    }, 60_000);

    return () => clearInterval(interval);
  }, [openingHours]);

  // Mientras hidrata, no mostrar nada para evitar mismatch
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


