import Link from 'next/link';
import { Branch } from '@/types';

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({ branch }: BranchCardProps) {
  return (
    <Link
      href={`/sucursal/${branch.id}`}
      className="group block rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-brand-400 hover:shadow-md"
    >
      {/* Nombre */}
      <h2 className="text-xl font-bold text-stone-900 group-hover:text-brand-700">
        {branch.name}
      </h2>

      {/* Dirección */}
      <p className="mt-2 flex items-start gap-2 text-sm text-stone-600">
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
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Abierto
        </span>
        <span className="text-sm font-semibold text-brand-600 group-hover:text-brand-800">
          Ver menú →
        </span>
      </div>
    </Link>
  );
}

