import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getCustomerFacingBranch } from '@/lib/branches';
import { formatWhatsappArgentinaDisplay, normalizeWhatsappWaMe } from '@/lib/formatWhatsappDisplay';

interface BranchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BranchPageProps): Promise<Metadata> {
  const { id } = await params;
  const branch = await getCustomerFacingBranch(id);
  if (!branch) return { title: 'Abdonur' };
  return {
    title: 'Abdonur',
    description: `Pedí empanadas árabes en ${branch.name}. ${branch.address}.`,
  };
}

export default async function BranchPage({ params }: BranchPageProps) {
  const { id } = await params;
  const branch = await getCustomerFacingBranch(id);

  if (!branch) notFound();

  const displayPhone = formatWhatsappArgentinaDisplay(branch.whatsapp_number);

  return (
    <section className="mx-auto max-w-2xl py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-metallic-400"
      >
        ← Volver a sucursales
      </Link>

      {/* Main card */}
      <div className="mt-6 rounded-2xl border border-metallic-500/30 bg-surface-800/90 p-8 shadow-[inset_0_1px_0_rgba(212,175,55,0.08)] backdrop-blur-sm">
        <h1 className="font-display text-3xl font-semibold tracking-wide text-white">{branch.name}</h1>
        <p className="mt-2 text-sm italic text-metallic-300">Lejos... la mejor!!!</p>

        {/* Branch info */}
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Dirección</p>
            <p className="text-stone-200">{branch.address}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-500">Horarios</p>
            <p className="text-stone-200">{branch.opening_hours}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-500">WhatsApp</p>
            <a
              href={`https://wa.me/${normalizeWhatsappWaMe(branch.whatsapp_number)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-whatsapp hover:underline"
            >
              {displayPhone}
            </a>
          </div>
        </div>

        {/* CTA — order now */}
        <Link
          href={`/sucursal/${branch.slug}/menu`}
          className="mt-8 block w-full rounded-xl bg-brand-600 py-4 text-center text-lg font-bold text-white shadow-[0_4px_20px_rgba(192,32,38,0.25)] transition-[transform,box-shadow,background-color] hover:bg-brand-500 hover:shadow-[0_6px_28px_rgba(192,32,38,0.35)] active:scale-[0.99] motion-reduce:active:scale-100"
        >
          Pedir ahora
        </Link>
      </div>
    </section>
  );
}
