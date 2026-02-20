import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Branch } from '@/types';
import ConfirmClient from '@/components/confirm/ConfirmClient';

interface ConfirmPageProps {
  params: Promise<{ id: string }>;
}

async function getBranch(id: string): Promise<Branch | null> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('id', id)
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
        href={`/sucursal/${branch.id}/menu`}
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
