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
type EmpanadaPresentation = 'docena' | 'docena_y_media' | 'dos_docenas' | 'unidad';

const empanadaFlavorOrder: EmpanadaFlavorKey[] = ['arabes', 'jyq', 'cyq', 'bondiola'];

const flavorDisplayNames: Record<EmpanadaFlavorKey, string> = {
  arabes: 'Árabes',
  jyq: 'Jamón y Queso',
  cyq: 'Cebolla y Queso',
  bondiola: 'Bondiola al Disco',
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isComboBuilderProduct(name: string) {
  const normalized = normalizeText(name);
  return normalized.includes('arma tu x8') || normalized.includes('arma tu x12') || normalized.includes('arma tu docena');
}

function getEmpanadaFlavorKey(name: string): EmpanadaFlavorKey | null {
  const normalized = normalizeText(name);
  if (normalized.includes('fatay') || normalized.includes('arabes') || normalized.includes('arabe')) return 'arabes';
  if (normalized.includes('jamon y queso')) return 'jyq';
  if (normalized.includes('cebolla y queso')) return 'cyq';
  if (normalized.includes('bondiola al disco')) return 'bondiola';
  return null;
}

function getEmpanadaPresentation(name: string): EmpanadaPresentation | null {
  const normalized = normalizeText(name);
  if (normalized.includes('docena y media')) return 'docena_y_media';
  if (normalized.includes('2 docenas') || normalized.includes('dos docenas')) return 'dos_docenas';
  if (normalized.includes('docena')) return 'docena';
  if (normalized.includes('unidad')) return 'unidad';
  return 'unidad';
}

function withDisplayName(product: Product, displayName: string): Product {
  return { ...product, name: displayName };
}

function canonicalComboDisplayName(product: Product): string {
  const normalized = normalizeText(product.name);
  if (normalized.includes('docena') || normalized.includes('x12')) return 'Armá tu Docena';
  return 'Armá tu x8';
}

function buildFlavorRows(
  flavorKeys: EmpanadaFlavorKey[],
  flavorMatrix: Record<EmpanadaFlavorKey, Partial<Record<EmpanadaPresentation, Product>>>,
  flavorDisplayNames: Record<EmpanadaFlavorKey, string>
): Product[] {
  return flavorKeys
    .map((flavorKey) => {
      const flavorName = flavorDisplayNames[flavorKey];
      const rowProducts: Product[] = [];
      const docena = flavorMatrix[flavorKey].docena;
      const docenaYMedia = flavorMatrix[flavorKey].docena_y_media;
      const dosDocenas = flavorMatrix[flavorKey].dos_docenas;
      const unidad = flavorMatrix[flavorKey].unidad;

      if (docena) rowProducts.push(withDisplayName(docena, `1 Docena de ${flavorName}`));
      if (docenaYMedia) rowProducts.push(withDisplayName(docenaYMedia, `1 Docena y Media de ${flavorName}`));
      if (dosDocenas) rowProducts.push(withDisplayName(dosDocenas, `2 Docenas de ${flavorName}`));
      if (unidad) {
        const unidadLabel = flavorKey === 'arabes' ? 'Árabe por Unidad' : `${flavorName} por Unidad`;
        rowProducts.push(withDisplayName(unidad, unidadLabel));
      }

      return rowProducts;
    })
    .flat();
}

export default function MenuClient({ products, branchId, branchSlug }: MenuClientProps) {
  const empanadaProducts = products.filter((product) => product.category === 'empanadas');
  const comboProducts = empanadaProducts
    .filter((product) => isComboBuilderProduct(product.name))
    .sort((a, b) => {
      const aNorm = normalizeText(a.name);
      const bNorm = normalizeText(b.name);
      const aDocena = aNorm.includes('docena') || aNorm.includes('x12');
      const bDocena = bNorm.includes('docena') || bNorm.includes('x12');
      if (aDocena && !bDocena) return -1;
      if (!aDocena && bDocena) return 1;
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
  const fatayRows = buildFlavorRows(['arabes'], flavorMatrix, flavorDisplayNames);
  const sfihasFlavorSections = (['jyq', 'cyq', 'bondiola'] as const)
    .map((flavorKey) => ({
      flavorKey,
      flavorLabel: flavorDisplayNames[flavorKey],
      rows: buildFlavorRows([flavorKey], flavorMatrix, flavorDisplayNames),
    }))
    .filter((section) => section.rows.length > 0);

  const productsByCategory = products.reduce((acc, product) => {
    (acc[product.category] = acc[product.category] || []).push(product);
    return acc;
  }, {} as Record<ProductCategory, Product[]>);

  return (
    <>
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
                      <h3 className="font-display text-base font-semibold tracking-[0.12em] text-brand-500">FATAY</h3>
                      {fatayRows.map((product) => (
                        <ProductCard key={`${product.id}-${product.name}`} product={product} />
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display text-base font-semibold tracking-[0.12em] text-brand-500">SFIHAS</h3>
                      {sfihasFlavorSections.map((section, index) => (
                        <div key={section.flavorKey} className="space-y-3">
                          {index > 0 && <div className="mx-1 h-px bg-gradient-to-r from-transparent via-metallic-500/40 to-transparent" />}
                          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{section.flavorLabel}</p>
                          {section.rows.map((product) => (
                            <ProductCard key={`${product.id}-${product.name}`} product={product} />
                          ))}
                        </div>
                      ))}
                    </div>

                    {comboProducts.length > 0 && (
                      <div className="pt-2">
                        <h3 className="font-display mb-3 border-t border-metallic-500/30 pt-4 text-base font-semibold tracking-wide text-brand-500">
                          Armá tu Docena / Armá tu x8
                        </h3>
                        <div className="space-y-3">
                          {comboProducts.map((product) => (
                            <ComboProductCard
                              key={product.id}
                              product={withDisplayName(product, canonicalComboDisplayName(product))}
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

      <CartSummary branchId={branchId} branchSlug={branchSlug} />
    </>
  );
}
