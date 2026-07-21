'use client';

import { useEffect, useState } from 'react';
import { Product, ProductCategory } from '@/types';
import CartSummary from '@/components/cart/CartSummary';
import ProductCard from '@/components/ui/ProductCard';
import ComboProductCard from '@/components/menu/ComboProductCard';
import BranchClosedNotice from '@/components/ui/BranchClosedNotice';
import { buildEmpanadaMenuSections, canonicalComboDisplayName, withDisplayName } from '@/lib/empanadaMenu';
import { isBranchOpenNow } from '@/lib/branchOpenStatus';

interface MenuClientProps {
  products: Product[];
  branchId: string;
  branchSlug: string;
  openingHours: string;
}

const categoryTitles: Record<ProductCategory, string> = {
  empanadas: 'Empanadas Árabes',
  comidas: 'Comidas y Platos',
  postres: 'Postres Árabes',
};

const categoryOrder: ProductCategory[] = ['empanadas', 'comidas', 'postres'];

export default function MenuClient({ products, branchId, branchSlug, openingHours }: MenuClientProps) {
  const [branchOpen, setBranchOpen] = useState<boolean | null>(null);
  const { fatayRows, sfihasFlavorSections, comboProducts, comboFlavorProducts } =
    buildEmpanadaMenuSections(products);

  useEffect(() => {
    setBranchOpen(isBranchOpenNow(openingHours));
    const interval = setInterval(() => {
      setBranchOpen(isBranchOpenNow(openingHours));
    }, 60_000);
    return () => clearInterval(interval);
  }, [openingHours]);

  const productsByCategory = products.reduce(
    (acc, product) => {
      (acc[product.category] = acc[product.category] || []).push(product);
      return acc;
    },
    {} as Record<ProductCategory, Product[]>
  );

  return (
    <>
      {branchOpen === false && (
        <BranchClosedNotice openingHours={openingHours} className="mt-6" />
      )}

      {products.length > 0 ? (
        <div className="menu-category-stack mt-6 space-y-10 pb-44">
          {categoryOrder
            .filter((cat) => productsByCategory[cat]?.length)
            .map((category) => (
              <div key={category} className="animate-menu-section">
                <h2 className="font-display mb-4 border-b border-metallic-500/35 pb-2 text-2xl font-semibold text-metallic-300 transition-[color,border-color] duration-200 ease-out hover:border-metallic-400/55 hover:text-metallic-200">
                  {categoryTitles[category]}
                </h2>
                {category === 'empanadas' ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-display text-base font-semibold tracking-[0.12em] text-brand-500">Árabes</h3>
                      {fatayRows.map((product) => (
                        <ProductCard key={`${product.id}-${product.name}`} product={product} />
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display text-base font-semibold tracking-[0.12em] text-brand-500">Sfihas</h3>
                      {sfihasFlavorSections.map((section, index) => (
                        <div key={section.flavorKey} className="space-y-3">
                          {index > 0 && (
                            <div className="mx-1 h-px bg-gradient-to-r from-transparent via-metallic-500/40 to-transparent" />
                          )}
                          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                            {section.flavorLabel}
                          </p>
                          {section.rows.map((product) => (
                            <ProductCard key={`${product.id}-${product.name}`} product={product} />
                          ))}
                        </div>
                      ))}
                    </div>

                    {comboProducts.length > 0 && (
                      <div className="pt-2">
                        <h3 className="font-display mb-3 border-t border-metallic-500/30 pt-4 text-base font-semibold tracking-wide text-brand-500">
                          Armá tu Docena
                        </h3>
                        <div className="space-y-3">
                          {comboProducts.map((product) => (
                            <ComboProductCard
                              key={product.id}
                              product={withDisplayName(product, canonicalComboDisplayName())}
                              flavorProducts={comboFlavorProducts}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productsByCategory[category].map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-metallic-500/35 bg-surface-800/90 p-12 text-center text-stone-500 backdrop-blur-sm">
          <p>No hay productos disponibles en este momento.</p>
        </div>
      )}

      <CartSummary branchId={branchId} branchSlug={branchSlug} openingHours={openingHours} />
    </>
  );
}
