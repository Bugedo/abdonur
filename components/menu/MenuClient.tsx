'use client';

import { Product, ProductCategory } from '@/types';
import CartSummary from '@/components/cart/CartSummary';
import ProductCard from '@/components/ui/ProductCard';

interface MenuClientProps {
  products: Product[];
  branchId: string;
}

const categoryLabels: Record<ProductCategory, string> = {
  empanadas: '🥟 Empanadas Árabes',
  comidas: '🍽️ Comidas',
  postres: '🍮 Postres',
};

const categoryOrder: ProductCategory[] = ['empanadas', 'comidas', 'postres'];

export default function MenuClient({ products, branchId }: MenuClientProps) {
  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat],
      items: products.filter((p) => p.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      {grouped.length > 0 ? (
        <div className="mt-6 space-y-8 pb-32">
          {grouped.map((group) => (
            <div key={group.category}>
              <h2 className="border-b-2 border-brand-200 pb-2 text-lg font-extrabold text-accent-600">
                {group.label}
              </h2>
              <div className="mt-3 space-y-3">
                {group.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}

          {/* Aviso */}
          <div className="rounded-lg border border-stone-100 bg-stone-50 p-3 text-center text-xs text-stone-500">
            <p>Nuestros productos <strong>NO</strong> son aptos para Celíacos.</p>
            <p>Todos nuestros productos <strong>SÍ</strong> son aptos para APLV, excepto los postres.</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-12 text-center text-stone-400">
          <p>No hay productos disponibles en este momento.</p>
        </div>
      )}

      <CartSummary branchId={branchId} />
    </>
  );
}
