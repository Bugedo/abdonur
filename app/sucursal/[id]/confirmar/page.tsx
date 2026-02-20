import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Branch } from '@/types';
import ConfirmClient from '@/components/confirm/ConfirmClient';

interface ConfirmPageProps {
  params: Promise<{ id: string }>;
}

// Supports both slug (e.g. "san-vicente") and UUID lookups
async function getBranch(idOrSlug: string): Promise<Branch | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const column = isUuid ? 'id' : 'slug';

  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq(column, idOrSlug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const { id } = await params;
  const branch = await getBranch(id);

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
