'use client';

interface BranchClosedNoticeProps {
  openingHours: string;
  className?: string;
}

export default function BranchClosedNotice({ openingHours, className = '' }: BranchClosedNoticeProps) {
  return (
    <div
      className={`rounded-lg border border-amber-700/50 bg-amber-900/25 px-4 py-3 text-sm text-amber-200 ${className}`}
      role="status"
    >
      <p className="font-semibold text-amber-100">El local está cerrado</p>
      <p className="mt-1">
        Podés armar el pedido y enviarlo cuando abra. Horario: {openingHours}
      </p>
    </div>
  );
}
