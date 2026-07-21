'use client';

import { useEffect, useState } from 'react';
import { isBranchOpenNow } from '@/lib/branchOpenStatus';

interface OpenStatusBadgeProps {
  openingHours: string; // e.g. "Lun a Dom 10:00 - 23:00"
}

export default function OpenStatusBadge({ openingHours }: OpenStatusBadgeProps) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setOpen(isBranchOpenNow(openingHours));

    const interval = setInterval(() => {
      setOpen(isBranchOpenNow(openingHours));
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
