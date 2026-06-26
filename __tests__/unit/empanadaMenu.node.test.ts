import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEmpanadaMenuSections,
  buildFlavorRows,
  isComboBuilderProduct,
} from '../../lib/empanadaMenu.ts';
import type { Product } from '../../types/index.ts';

function product(overrides: Partial<Product> & Pick<Product, 'name'>): Product {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    description: '',
    price: overrides.price ?? 1000,
    category: 'empanadas',
    image_url: '',
    is_active: true,
    ...overrides,
  };
}

test('buildFlavorRows orders unidad and docena, skips docena y media and dos docenas', () => {
  const rows = buildFlavorRows(['arabes'], {
    arabes: {
      docena: product({ id: 'd', name: 'FATAY - Árabes (Docena)', price: 20000 }),
      docena_y_media: product({ id: 'dm', name: 'FATAY - Árabes (Docena y Media)', price: 30000 }),
      dos_docenas: product({ id: 'dd', name: 'FATAY - Árabes (2 Docenas)', price: 40000 }),
      unidad: product({ id: 'u', name: 'FATAY - Árabes (Unidad)', price: 2000 }),
    },
    jyq: {},
    cyq: {},
    bondiola: {},
  });

  assert.deepEqual(rows.map((row) => row.name), ['Árabe x Unidad', 'Árabe x 1 Docena']);
});

test('buildEmpanadaMenuSections excludes x8 combo, docena y media, and dos docenas rows', () => {
  const sections = buildEmpanadaMenuSections([
    product({ id: 'u', name: 'FATAY - Árabes (Unidad)' }),
    product({ id: 'd', name: 'FATAY - Árabes (Docena)' }),
    product({ id: 'dm', name: 'FATAY - Árabes (Docena y Media)' }),
    product({ id: 'dd', name: 'FATAY - Árabes (2 Docenas)' }),
    product({ id: 'x8', name: 'Armá tu x8', price: 15000 }),
    product({ id: 'doc', name: 'Armá tu Docena', price: 22000 }),
  ]);

  assert.equal(sections.fatayRows.length, 2);
  assert.equal(sections.comboProducts.length, 1);
  assert.equal(sections.comboProducts[0]?.name, 'Armá tu Docena');
  assert.equal(isComboBuilderProduct('Armá tu x8'), false);
});
