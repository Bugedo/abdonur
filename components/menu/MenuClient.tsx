'use client';

import { Product, ProductCategory } from '@/types';
import CartSummary from '@/components/cart/CartSummary';
import ProductCard from '@/components/ui/ProductCard';
import EmpanadaBundlesBuilder from '@/components/menu/EmpanadaBundlesBuilder';

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
  const bundle6Product =
    products.find((p) => p.category === 'empanadas' && p.name.toLowerCase().includes('arma tu x6')) ?? null;
  const bundle12Product =
    products.find((p) => p.category === 'empanadas' && p.name.toLowerCase().includes('arma tu x12')) ?? null;

  const flavorProducts = products.filter(
    (p) =>
      p.category === 'empanadas' &&
      !p.name.toLowerCase().includes('arma tu x6') &&
      !p.name.toLowerCase().includes('arma tu x12')
  );

  const visibleProducts = products.filter(
    (p) => !p.name.toLowerCase().includes('arma tu x6') && !p.name.toLowerCase().includes('arma tu x12')
  );

  const productsByCategory = visibleProducts.reduce((acc, product) => {
    (acc[product.category] = acc[product.category] || []).push(product);
    return acc;
  }, {} as Record<ProductCategory, Product[]>);

  return (
    <>
      {visibleProducts.length > 0 ? (
        <div className="mt-6 space-y-10 pb-32">
          {categoryOrder
            .filter((cat) => productsByCategory[cat]?.length)
            .map((category) => (
              <div key={category}>
                <h2 className="mb-4 border-b border-surface-600 pb-2 text-2xl font-bold text-brand-500">
                  {categoryTitles[category]}
                </h2>
                {category === 'empanadas' && (
                  <EmpanadaBundlesBuilder
                    flavorProducts={flavorProducts}
                    bundle6Product={bundle6Product}
                    bundle12Product={bundle12Product}
                  />
                )}
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
