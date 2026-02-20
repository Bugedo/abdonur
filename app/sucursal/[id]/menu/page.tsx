import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Branch, Product } from '@/types';
import MenuClient from '@/components/menu/MenuClient';

interface MenuPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { id } = await params;
  const branch = await getBranch(id);
  if (!branch) return { title: 'Menú no encontrado' };
  return {
    title: `Menú — ${branch.name} — Empanadas Árabes Abdonur`,
    description: `Elegí tus empanadas y comidas árabes en ${branch.name}.`,
  };
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
  const [branch, products] = await Promise.all([getBranch(id), getProducts()]);

  if (!branch) notFound();

  return (
    <section className="mx-auto max-w-2xl py-8">
      {/* Volver */}
      <Link
        href={`/sucursal/${branch.slug}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand-400"
      >
        ← Volver a {branch.name}
      </Link>

      {/* Título */}
      <div className="mt-6">
        <h1 className="text-3xl font-extrabold text-white">Menú</h1>
        <p className="mt-1 text-stone-400">{branch.name} — Elegí tus productos</p>
      </div>

      {/* Parte interactiva */}
      <MenuClient products={products} branchId={branch.id} branchSlug={branch.slug} />
    </section>
  );
}
