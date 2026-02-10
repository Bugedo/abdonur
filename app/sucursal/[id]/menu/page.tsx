import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Branch, Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

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

      {/* Listado de productos */}
      {products.length > 0 ? (
        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center text-stone-400">
          <p>No hay productos disponibles en este momento.</p>
        </div>
      )}

      {/* Nota: el carrito se implementa en el Paso 6 */}
      <div className="mt-8 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-6 text-center text-sm text-brand-700">
        🛒 El carrito para agregar productos se implementa en el próximo paso.
      </div>
    </section>
  );
}
