import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Branch, Product } from '@/types';
import MenuClient from '@/components/menu/MenuClient';

interface MenuPageProps {
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

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
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
        href={`/sucursal/${branch.id}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        ← Volver a {branch.name}
      </Link>

      {/* Título */}
      <div className="mt-6">
        <h1 className="text-3xl font-extrabold text-stone-900">Menú</h1>
        <p className="mt-1 text-stone-500">{branch.name} — Elegí tus empanadas</p>
      </div>

      {/* Parte interactiva: productos + carrito */}
      <MenuClient products={products} branchId={branch.id} />
    </section>
  );
}
