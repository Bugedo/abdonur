-- Price corrections from June 2026 menu sheet (prices only).

UPDATE products
SET price = 3000.00
WHERE name IN (
  'Puré de Garbanzos - Porción',
  'Puré de Garbanzos - Porc.',
  'Puré de garbanzos porción'
);

UPDATE products
SET price = 3000.00
WHERE name IN (
  'Backlawa - Porción',
  'Backlawa - Porc.',
  'Backlawa porción'
);
