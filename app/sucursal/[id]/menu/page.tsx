import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';
import MenuClient from '@/components/menu/MenuClient';
import { getActiveBranchByIdOrSlug } from '@/lib/branches';

interface MenuPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { id } = await params;
  const branch = await getActiveBranchByIdOrSlug(id);
  if (!branch) return { title: 'Menú no encontrado' };
  return {
    title: `Menú — ${branch.name} — Empanadas Árabes Abdonur`,
    description: `Elegí tus empanadas y comidas árabes en ${branch.name}.`,
  };
}

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name');

  if (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
  return data ?? [];
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { id } = await params;
  const [branch, products] = await Promise.all([getActiveBranchByIdOrSlug(id), getProducts()]);

  if (!branch) notFound();

  return (
    <section className="mx-auto max-w-2xl py-8">
      {/* Back link */}
      <Link
        href={`/sucursal/${branch.slug}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-metallic-400"
      >
        ← Volver a {branch.name}
      </Link>

      {/* Title */}
      <div className="mt-6">
        <h1 className="font-display text-3xl font-semibold tracking-wide text-white">Menú</h1>
        <p className="mt-2 text-sm text-stone-400">{branch.name} — Elegí tus productos</p>
      </div>

      {/* Interactive section */}
      <MenuClient products={products} branchId={branch.id} branchSlug={branch.slug} />
    </section>
  );
}
