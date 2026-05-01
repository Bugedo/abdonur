-- Global price update from April 2026 menu sheet.
-- Keeps product logic and naming untouched; only updates prices.

-- ─────────────────────────────────────
-- Empanadas por unidad (all flavors)
-- ─────────────────────────────────────
UPDATE products
SET price = 2000.00
WHERE name IN (
  'Árabe por Unidad',
  'Jamón y Queso por Unidad',
  'Cebolla y Queso por Unidad',
  'Bondiola al Disco por Unidad',
  'FATAY - Árabes',
  'FATAY - Árabes (Unidad)',
  'SFIHAS - jamón y queso',
  'SFIHAS - jamón y queso (Unidad)',
  'SFIHAS - cebolla y queso',
  'SFIHAS - cebolla y queso (Unidad)',
  'SFIHAS - Bondiola al Disco',
  'SFIHAS - Bondiola al Disco (Unidad)'
);

-- ─────────────────────────────────────
-- Empanadas por docena / presentaciones proporcionales
-- ─────────────────────────────────────
UPDATE products
SET price = 22000.00
WHERE name IN (
  '1 Docena de Árabes',
  '1 Docena de Jamón y Queso',
  '1 Docena de Cebolla y Queso',
  '1 Docena de Bondiola al Disco',
  'Docena de Árabes',
  'Docena de Jamón y Queso',
  'Docena de Cebolla y Queso',
  'Docena de Bondiola al Disco',
  'FATAY - Árabes (Docena)',
  'SFIHAS - jamón y queso (Docena)',
  'SFIHAS - cebolla y queso (Docena)',
  'SFIHAS - Bondiola al Disco (Docena)'
);

UPDATE products
SET price = 33000.00
WHERE name IN (
  '1 Docena y Media de Árabes',
  '1 Docena y Media de Jamón y Queso',
  '1 Docena y Media de Cebolla y Queso',
  '1 Docena y Media de Bondiola al Disco',
  'Media Docena de Árabes',
  'Media Docena de Jamón y Queso',
  'Media Docena de Cebolla y Queso',
  'Media Docena de Bondiola al Disco'
);

UPDATE products
SET price = 44000.00
WHERE name IN (
  '2 Docenas de Árabes',
  '2 Docenas de Jamón y Queso',
  '2 Docenas de Cebolla y Queso',
  '2 Docenas de Bondiola al Disco',
  'Dos Docenas de Árabes',
  'Dos Docenas de Jamón y Queso',
  'Dos Docenas de Cebolla y Queso',
  'Dos Docenas de Bondiola al Disco'
);

-- Combo builders (confirmed + proportional)
UPDATE products
SET price = 22000.00
WHERE name IN ('Armá tu Docena', 'Arma tu x12 de empanadas', 'Arma tu x12');

UPDATE products
SET price = 16000.00
WHERE name IN ('Armá tu x8', 'Arma tu x8 de empanadas', 'Arma tu x6 de empanadas', 'Arma tu x6');

-- ─────────────────────────────────────
-- Comidas y postres
-- ─────────────────────────────────────
UPDATE products
SET price = 24000.00
WHERE name IN (
  'Picada p 2 (comen 2, pican 3)',
  'Almuerzo o cena para 2',
  'Almuerzo/Cena para 2'
);

UPDATE products
SET price = 22400.00
WHERE name IN ('Quebbe - 1 Kg', 'Quebbe 1kg', 'Quebbe - 1kg');

UPDATE products
SET price = 5600.00
WHERE name IN ('Quebbe - Porción', 'Quebbe - Porc.', 'Quebbe porción');

UPDATE products
SET price = 32700.00
WHERE name IN ('Niños Envueltos - 1 Kg', 'Niños envueltos 1kg', 'Niños Envueltos - 1kg');

UPDATE products
SET price = 8200.00
WHERE name IN ('Niños Envueltos - Porción', 'Niños envueltos porción', 'Niños Envueltos - Porc.');

UPDATE products
SET price = 14200.00
WHERE name IN ('Puré de Garbanzos - 1 Kg', 'Puré de Garbanzos - 1kg', 'Puré de garbanzos 1kg');

UPDATE products
SET price = 2600.00
WHERE name IN ('Puré de Garbanzos - Porción', 'Puré de Garbanzos - Porc.', 'Puré de garbanzos porción');

UPDATE products
SET price = 2400.00
WHERE name IN ('Laben - 250 cm3', 'Laben - 250cm3', 'Laben 250 cm3');

UPDATE products
SET price = 25900.00
WHERE name IN ('Aceitunas a la Árabe - 1 Kg', 'Aceitunas a la Árabe - 1kg', 'Aceitunas a la Árabe 1kg');

UPDATE products
SET price = 4400.00
WHERE name IN ('Aceitunas a la Árabe - Porción', 'Aceitunas a la Árabe - Porc.', 'Aceitunas a la Árabe porción');

UPDATE products
SET price = 1950.00
WHERE name IN ('Namura - Porción', 'Namura - Porc.', 'Namura porción');

UPDATE products
SET price = 2500.00
WHERE name IN ('Backlawa - Porción', 'Backlawa - Porc.', 'Backlawa porción');
