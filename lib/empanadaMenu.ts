import type { Product } from '../types/index.ts';

export type EmpanadaFlavorKey = 'arabes' | 'jyq' | 'cyq' | 'bondiola';
export type EmpanadaPresentation = 'unidad' | 'docena' | 'docena_y_media' | 'dos_docenas';

const presentationOrder: EmpanadaPresentation[] = ['unidad', 'docena', 'docena_y_media'];

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
  if (normalized.includes('arma tu x8')) return false;
  return normalized.includes('arma tu x12') || normalized.includes('arma tu docena');
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

export function canonicalComboDisplayName(): string {
  return 'Armá tu Docena';
}

export function flavorPresentationLabel(
  flavorKey: EmpanadaFlavorKey,
  presentation: Exclude<EmpanadaPresentation, 'dos_docenas'>
): string {
  const flavorName = flavorDisplayNames[flavorKey];
  if (presentation === 'unidad') {
    return flavorKey === 'arabes' ? 'Árabe x Unidad' : `${flavorName} x Unidad`;
  }
  if (presentation === 'docena') {
    return flavorKey === 'arabes' ? 'Árabe x 1 Docena' : `${flavorName} x 1 Docena`;
  }
  return flavorKey === 'arabes'
    ? 'Árabe por 1 Docena y Media'
    : `${flavorName} por 1 Docena y Media`;
}

export function buildFlavorRows(
  flavorKeys: EmpanadaFlavorKey[],
  flavorMatrix: Record<EmpanadaFlavorKey, Partial<Record<EmpanadaPresentation, Product>>>
): Product[] {
  return flavorKeys
    .map((flavorKey) =>
      presentationOrder
        .map((presentation) => {
          const product = flavorMatrix[flavorKey][presentation];
          if (!product) return null;
          return withDisplayName(product, flavorPresentationLabel(flavorKey, presentation));
        })
        .filter((product): product is Product => product !== null)
    )
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
    .sort((a, b) => a.name.localeCompare(b.name));

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
    if (!flavorKey || !presentation || presentation === 'dos_docenas') continue;
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
