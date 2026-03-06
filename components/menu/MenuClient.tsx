'use client';

import { Product, ProductCategory } from '@/types';
import CartSummary from '@/components/cart/CartSummary';
import ProductCard from '@/components/ui/ProductCard';

interface MenuClientProps {
  products: Product[];
  branchId: string;
  branchSlug: string;
}

const categoryTitles: Record<ProductCategory, string> = {
  empanadas: '🥟 Empanadas Árabes',
  comidas: '🍽️ Comidas y Platos',
  postres: '🍰 Postres Árabes',
};

const categoryOrder: ProductCategory[] = ['empanadas', 'comidas', 'postres'];

export default function MenuClient({ products, branchId, branchSlug }: MenuClientProps) {
  const productsByCategory = products.reduce((acc, product) => {
    (acc[product.category] = acc[product.category] || []).push(product);
    return acc;
  }, {} as Record<ProductCategory, Product[]>);

  return (
    <>
      {products.length > 0 ? (
        <div className="mt-6 space-y-10 pb-32">
          {categoryOrder
            .filter((cat) => productsByCategory[cat]?.length)
            .map((category) => (
              <div key={category}>
                <h2 className="mb-4 border-b border-surface-600 pb-2 text-2xl font-bold text-brand-500">
                  {categoryTitles[category]}
                </h2>
                <div className="space-y-3">
                  {productsByCategory[category].map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-surface-500 bg-surface-800 p-12 text-center text-stone-500">
          <p>No hay productos disponibles en este momento.</p>
        </div>
      )}

      <CartSummary branchId={branchId} branchSlug={branchSlug} />
    </>
  );
}
