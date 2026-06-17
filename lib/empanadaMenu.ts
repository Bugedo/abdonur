import { Product } from '@/types';

export type EmpanadaFlavorKey = 'arabes' | 'jyq' | 'cyq' | 'bondiola';
export type EmpanadaPresentation = 'docena' | 'docena_y_media' | 'dos_docenas' | 'unidad';

export const empanadaFlavorOrder: EmpanadaFlavorKey[] = ['arabes', 'jyq', 'cyq', 'bondiola'];

export const flavorDisplayNames: Record<EmpanadaFlavorKey, string> = {
  arabes: 'Árabes',
  jyq: 'Jamón y Queso',
  cyq: 'Cebolla y Queso',
  bondiola: 'Bondiola al Disco',
};

export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function isComboBuilderProduct(name: string) {
  const normalized = normalizeText(name);
  return normalized.includes('arma tu x8') || normalized.includes('arma tu x12') || normalized.includes('arma tu docena');
}

export function getEmpanadaFlavorKey(name: string): EmpanadaFlavorKey | null {
  const normalized = normalizeText(name);
  if (normalized.includes('fatay') || normalized.includes('arabes') || normalized.includes('arabe')) return 'arabes';
  if (normalized.includes('jamon y queso')) return 'jyq';
  if (normalized.includes('cebolla y queso')) return 'cyq';
  if (normalized.includes('bondiola al disco')) return 'bondiola';
  return null;
}

export function getEmpanadaPresentation(name: string): EmpanadaPresentation | null {
  const normalized = normalizeText(name);
  if (normalized.includes('docena y media')) return 'docena_y_media';
  if (normalized.includes('2 docenas') || normalized.includes('dos docenas')) return 'dos_docenas';
  if (normalized.includes('docena')) return 'docena';
  if (normalized.includes('unidad')) return 'unidad';
  return 'unidad';
}

export function withDisplayName(product: Product, displayName: string): Product {
  return { ...product, name: displayName };
}

export function canonicalComboDisplayName(product: Product): string {
  const normalized = normalizeText(product.name);
  if (normalized.includes('docena') || normalized.includes('x12')) return 'Armá tu Docena';
  return 'Armá tu x8';
}

export function buildFlavorRows(
  flavorKeys: EmpanadaFlavorKey[],
  flavorMatrix: Record<EmpanadaFlavorKey, Partial<Record<EmpanadaPresentation, Product>>>
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

export interface EmpanadaMenuSections {
  fatayRows: Product[];
  sfihasFlavorSections: Array<{
    flavorKey: EmpanadaFlavorKey;
    flavorLabel: string;
    rows: Product[];
  }>;
  comboProducts: Product[];
  comboFlavorProducts: Product[];
}

export function buildEmpanadaMenuSections(products: Product[]): EmpanadaMenuSections {
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

  const fatayRows = buildFlavorRows(['arabes'], flavorMatrix);
  const sfihasFlavorSections = (['jyq', 'cyq', 'bondiola'] as const)
    .map((flavorKey) => ({
      flavorKey,
      flavorLabel: flavorDisplayNames[flavorKey],
      rows: buildFlavorRows([flavorKey], flavorMatrix),
    }))
    .filter((section) => section.rows.length > 0);

  return {
    fatayRows,
    sfihasFlavorSections,
    comboProducts,
    comboFlavorProducts,
  };
}
