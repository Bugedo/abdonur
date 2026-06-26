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
      className="group relative block overflow-hidden rounded-2xl border border-metallic-500/25 bg-surface-800/90 p-6 shadow-[inset_0_1px_0_rgba(212,175,55,0.06)] backdrop-blur-sm transition-all hover:border-metallic-400/55 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_24px_rgba(212,175,55,0.08)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(212, 175, 55, 0.22), transparent 38%), radial-gradient(circle at 82% 78%, rgba(192, 32, 38, 0.14), transparent 42%), repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 4px)',
        }}
      />
      <div className="relative z-10">
        {/* Name */}
        <h2 className="font-display text-3xl font-semibold text-white group-hover:text-metallic-300 sm:text-4xl">
          {displayName ?? branch.name}
        </h2>

        {/* Address */}
        <p className="mt-2 flex items-start gap-2 text-sm text-stone-400">
          <span className="mt-0.5">📍</span>
          <span>{branch.address}</span>
        </p>

        {/* Hours */}
        <p className="mt-1 flex items-start gap-2 text-sm text-stone-500">
          <span className="mt-0.5">🕐</span>
          <span>{branch.opening_hours}</span>
        </p>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-between">
          <OpenStatusBadge openingHours={branch.opening_hours} />
          <span className="text-sm font-bold text-metallic-400 group-hover:text-metallic-300">
            Ver menú →
          </span>
        </div>
      </div>
    </Link>
  );
}
