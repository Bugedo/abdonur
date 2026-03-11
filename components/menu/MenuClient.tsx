'use client';

import { Product, ProductCategory } from '@/types';
import CartSummary from '@/components/cart/CartSummary';
import ProductCard from '@/components/ui/ProductCard';
import ComboProductCard from '@/components/menu/ComboProductCard';

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

type EmpanadaFlavorKey = 'arabes' | 'jyq' | 'cyq' | 'bondiola';
type EmpanadaPresentation = 'docena' | 'media' | 'unidad';

const empanadaFlavorOrder: EmpanadaFlavorKey[] = ['arabes', 'jyq', 'cyq', 'bondiola'];

const empanadaPresentationOrder: Array<{ key: EmpanadaPresentation; label: string }> = [
  { key: 'docena', label: 'Docena' },
  { key: 'media', label: 'Media docena' },
  { key: 'unidad', label: 'Unidad' },
];

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isComboBuilderProduct(name: string) {
  const normalized = normalizeText(name);
  return normalized.includes('arma tu x6') || normalized.includes('arma tu x12');
}

function getEmpanadaFlavorKey(name: string): EmpanadaFlavorKey | null {
  const normalized = normalizeText(name);
  if (normalized.includes('fatay') || normalized.includes('arabes')) return 'arabes';
  if (normalized.includes('jamon y queso')) return 'jyq';
  if (normalized.includes('cebolla y queso')) return 'cyq';
  if (normalized.includes('bondiola al disco')) return 'bondiola';
  return null;
}

function getEmpanadaPresentation(name: string): EmpanadaPresentation | null {
  const normalized = normalizeText(name);
  if (normalized.includes('media docena')) return 'media';
  if (normalized.includes('docena')) return 'docena';
  if (normalized.includes('unidad')) return 'unidad';
  return 'unidad';
}

export default function MenuClient({ products, branchId, branchSlug }: MenuClientProps) {
  const empanadaProducts = products.filter((product) => product.category === 'empanadas');
  const comboProducts = empanadaProducts
    .filter((product) => isComboBuilderProduct(product.name))
    .sort((a, b) => {
      const aNorm = normalizeText(a.name);
      const bNorm = normalizeText(b.name);
      if (aNorm.includes('x12')) return -1;
      if (bNorm.includes('x12')) return 1;
      return a.name.localeCompare(b.name);
    });

  const flavorMatrix: Record<EmpanadaFlavorKey, Partial<Record<EmpanadaPresentation, Product>>> = {
    arabes: {},
    jyq: {},
    cyq: {},
    bondiola: {},
  };

  for (const product of empanadaProducts) {
    if (isComboBuilderProduct(product.name)) continue;
    const flavorKey = getEmpanadaFlavorKey(product.name);
    const presentation = getEmpanadaPresentation(product.name);
    if (!flavorKey || !presentation) continue;
    flavorMatrix[flavorKey][presentation] = product;
  }

  const comboFlavorProducts = empanadaFlavorOrder
    .map((flavorKey) => flavorMatrix[flavorKey].unidad)
    .filter((product): product is Product => Boolean(product));

  const productsByCategory = products.reduce((acc, product) => {
    (acc[product.category] = acc[product.category] || []).push(product);
    return acc;
  }, {} as Record<ProductCategory, Product[]>);

  return (
    <>
      {products.length > 0 ? (
        <div className="mt-6 space-y-10 pb-44">
          {categoryOrder
            .filter((cat) => productsByCategory[cat]?.length)
            .map((category) => (
              <div key={category}>
                <h2 className="mb-4 border-b border-surface-600 pb-2 text-2xl font-bold text-brand-500">
                  {categoryTitles[category]}
                </h2>
                {category === 'empanadas' ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      {empanadaFlavorOrder.flatMap((flavorKey) =>
                        empanadaPresentationOrder
                          .map((presentation) => flavorMatrix[flavorKey][presentation.key])
                          .filter((product): product is Product => Boolean(product))
                      ).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {comboProducts.length > 0 && (
                      <div className="pt-2">
                        <h3 className="mb-3 border-t border-surface-600 pt-4 text-base font-bold text-brand-400">
                          Arma tu docena / Arma tu media docena
                        </h3>
                        <div className="space-y-3">
                          {comboProducts.map((product) => (
                            <ComboProductCard key={product.id} product={product} flavorProducts={comboFlavorProducts} />
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
        <div className="mt-8 rounded-xl border border-dashed border-surface-500 bg-surface-800 p-12 text-center text-stone-500">
          <p>No hay productos disponibles en este momento.</p>
        </div>
      )}

      <CartSummary branchId={branchId} branchSlug={branchSlug} />
    </>
  );
}
