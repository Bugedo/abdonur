import { notFound } from 'next/navigation';
import Link from 'next/link';
import ConfirmClient from '@/components/confirm/ConfirmClient';
import { getActiveBranchByIdOrSlug } from '@/lib/branches';

interface ConfirmPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const { id } = await params;
  const branch = await getActiveBranchByIdOrSlug(id);

  if (!branch) notFound();

  return (
    <section className="mx-auto max-w-2xl py-8">
      {/* Volver */}
      <Link
        href={`/sucursal/${branch.slug}/menu`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand-400"
      >
        ← Volver al menú
      </Link>

      {/* Título */}
      <div className="mt-6">
        <h1 className="text-3xl font-extrabold text-white">Confirmar pedido</h1>
        <p className="mt-1 text-stone-400">{branch.name} — Últimos detalles</p>
      </div>

      {/* Parte interactiva */}
      <ConfirmClient branch={branch} />
    </section>
  );
}
