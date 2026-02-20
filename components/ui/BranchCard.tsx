import Link from 'next/link';
import { Branch } from '@/types';
import OpenStatusBadge from '@/components/ui/OpenStatusBadge';

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({ branch }: BranchCardProps) {
  return (
    <Link
      href={`/sucursal/${branch.slug}`}
      className="group block rounded-2xl border border-surface-600 bg-surface-800 p-6 transition-all hover:border-brand-600 hover:shadow-lg hover:shadow-brand-900/30"
    >
      {/* Nombre */}
      <h2 className="text-xl font-bold text-white group-hover:text-brand-400">
        {branch.name}
      </h2>

      {/* Dirección */}
      <p className="mt-2 flex items-start gap-2 text-sm text-stone-400">
        <span className="mt-0.5">📍</span>
        <span>{branch.address}</span>
      </p>

      {/* Horarios */}
      <p className="mt-1 flex items-start gap-2 text-sm text-stone-500">
        <span className="mt-0.5">🕐</span>
        <span>{branch.opening_hours}</span>
      </p>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between">
        <OpenStatusBadge openingHours={branch.opening_hours} />
        <span className="text-sm font-bold text-brand-500 group-hover:text-brand-400">
          Ver menú →
        </span>
      </div>
    </Link>
  );
}
