import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseProductIncludes,
  shouldRenderIncludesList,
} from '../../lib/formatProductIncludes.ts';

const PICADA_DESCRIPTION =
  '2 empanadas, 4 niños envueltos, 2 porc de quebbe, 1 porc puré de garbanzos, 1 porc de aceitunas y 6 pancitos';

test('parseProductIncludes splits Picada seed description into five items', () => {
  const items = parseProductIncludes(PICADA_DESCRIPTION);
  assert.equal(items.length, 5);
  assert.equal(items[0], '2 empanadas');
  assert.equal(items[4], '1 porc de aceitunas y 6 pancitos');
});

test('shouldRenderIncludesList is true for Picada-style multi-item descriptions', () => {
  assert.equal(shouldRenderIncludesList(PICADA_DESCRIPTION), true);
});

test('shouldRenderIncludesList is false for short single-line descriptions', () => {
  assert.equal(shouldRenderIncludesList('Quebbe por kilo'), false);
  assert.equal(shouldRenderIncludesList('Empanada árabe tradicional'), false);
});

test('parseProductIncludes handles empty and whitespace input', () => {
  assert.deepEqual(parseProductIncludes(''), []);
  assert.deepEqual(parseProductIncludes('   '), []);
  assert.deepEqual(parseProductIncludes('  solo un item  '), ['solo un item']);
});
