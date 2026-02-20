import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Branch } from '@/types';

interface BranchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BranchPageProps): Promise<Metadata> {
  const { id } = await params;
  const branch = await getBranch(id);
  if (!branch) return { title: 'Sucursal no encontrada' };
  return {
    title: `${branch.name} — Empanadas Árabes Abdonur`,
    description: `Pedí empanadas árabes en ${branch.name}. ${branch.address}. Horarios: ${branch.opening_hours}`,
  };
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

export default async function BranchPage({ params }: BranchPageProps) {
  const { id } = await params;
  const branch = await getBranch(id);

  if (!branch) notFound();

  const displayPhone = branch.whatsapp_number.replace(/^54/, '+54 ');

  return (
    <section className="mx-auto max-w-2xl py-8">
      {/* Volver */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-accent-600"
      >
        ← Volver a sucursales
      </Link>

      {/* Card principal */}
      <div className="mt-6 rounded-2xl border border-stone-100 bg-white p-8 shadow-sm">
        {/* Nombre */}
        <h1 className="text-3xl font-extrabold text-stone-900">{branch.name}</h1>
        <p className="mt-1 text-sm font-medium italic text-brand-500">Simplemente excepcionales</p>

        {/* Info */}
        <div className="mt-6 space-y-4">
          {/* Dirección */}
          <div className="flex items-start gap-3">
            <span className="text-2xl text-brand-500">📍</span>
            <div>
              <p className="text-sm font-medium text-stone-500">Dirección</p>
              <p className="text-stone-800">{branch.address}</p>
            </div>
          </div>

          {/* Horarios */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">🕐</span>
            <div>
              <p className="text-sm font-medium text-stone-500">Horarios</p>
              <p className="text-stone-800">{branch.opening_hours}</p>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm font-medium text-stone-500">WhatsApp</p>
              <a
                href={`https://wa.me/${branch.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-whatsapp-dark hover:underline"
              >
                {displayPhone}
              </a>
            </div>
          </div>
        </div>

        {/* CTA — Pedir ahora */}
        <Link
          href={`/sucursal/${branch.id}/menu`}
          className="mt-8 block w-full rounded-xl bg-accent-600 py-4 text-center text-lg font-bold text-white transition-colors hover:bg-accent-700"
        >
          🛒 Pedir ahora
        </Link>
      </div>
    </section>
  );
}
