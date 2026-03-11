import Link from 'next/link';
import { Branch } from '@/types';
import OpenStatusBadge from '@/components/ui/OpenStatusBadge';

interface BranchCardProps {
  branch: Branch;
  displayName?: string;
}

export default function BranchCard({ branch, displayName }: BranchCardProps) {
  return (
    <Link
      href={`/sucursal/${branch.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-surface-600 bg-surface-800 p-6 transition-all hover:border-brand-600 hover:shadow-lg hover:shadow-brand-900/30"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(244, 196, 48, 0.25), transparent 35%), radial-gradient(circle at 80% 75%, rgba(204, 64, 32, 0.2), transparent 40%), repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 4px)',
        }}
      />
      <div className="relative z-10">
        {/* Nombre */}
        <h2 className="text-3xl font-extrabold text-white group-hover:text-brand-400 sm:text-4xl">
          {displayName ?? branch.name}
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
      </div>
    </Link>
  );
}
