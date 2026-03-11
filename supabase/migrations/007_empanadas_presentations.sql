-- Add per-flavor empanada presentations (docena/media/unidad) for menu ordering.
-- Idempotent updates/inserts. Products are global for all branches.

-- Normalize legacy unit names so UI can classify "Unidad" explicitly.
UPDATE products
SET
  name = 'FATAY - Árabes (Unidad)',
  description = 'Empanada árabe tradicional por unidad',
  price = 1800.00,
  image_url = '/images/menu/empanadas/fatay-arabe.jpeg',
  category = 'empanadas',
  is_active = true
WHERE name = 'FATAY - Árabes';

UPDATE products
SET
  name = 'SFIHAS - jamón y queso (Unidad)',
  description = 'Empanada sfihas de jamón y queso por unidad',
  price = 1800.00,
  image_url = '/images/menu/empanadas/sfihas-jamon-queso.jpeg',
  category = 'empanadas',
  is_active = true
WHERE name = 'SFIHAS - jamón y queso';

UPDATE products
SET
  name = 'SFIHAS - cebolla y queso (Unidad)',
  description = 'Empanada sfihas de cebolla y queso por unidad',
  price = 1800.00,
  image_url = '/images/menu/empanadas/sfihas-queso-cebolla.jpeg',
  category = 'empanadas',
  is_active = true
WHERE name = 'SFIHAS - cebolla y queso';

UPDATE products
SET
  name = 'SFIHAS - Bondiola al Disco (Unidad)',
  description = 'Empanada sfihas de bondiola al disco por unidad',
  price = 1800.00,
  image_url = '/images/menu/empanadas/sfihas-bondiola-disco.jpeg',
  category = 'empanadas',
  is_active = true
WHERE name = 'SFIHAS - Bondiola al Disco';

-- Keep canonical unit rows aligned if already renamed.
UPDATE products
SET price = 1800.00, is_active = true
WHERE name IN (
  'FATAY - Árabes (Unidad)',
  'SFIHAS - jamón y queso (Unidad)',
  'SFIHAS - cebolla y queso (Unidad)',
  'SFIHAS - Bondiola al Disco (Unidad)'
);

-- FATAY - Árabes variants.
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'FATAY - Árabes (Docena)',
  'Docena de empanadas árabes tradicionales',
  20000.00,
  'empanadas',
  '/images/menu/empanadas/fatay-arabe.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'FATAY - Árabes (Docena)'
);

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'FATAY - Árabes (Media docena)',
  'Media docena de empanadas árabes tradicionales',
  10000.00,
  'empanadas',
  '/images/menu/empanadas/fatay-arabe.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'FATAY - Árabes (Media docena)'
);

-- SFIHAS - jamón y queso variants.
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - jamón y queso (Docena)',
  'Docena de sfihas de jamón y queso',
  20000.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-jamon-queso.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - jamón y queso (Docena)'
);

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - jamón y queso (Media docena)',
  'Media docena de sfihas de jamón y queso',
  10000.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-jamon-queso.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - jamón y queso (Media docena)'
);

-- SFIHAS - cebolla y queso variants.
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - cebolla y queso (Docena)',
  'Docena de sfihas de cebolla y queso',
  20000.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-queso-cebolla.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - cebolla y queso (Docena)'
);

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - cebolla y queso (Media docena)',
  'Media docena de sfihas de cebolla y queso',
  10000.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-queso-cebolla.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - cebolla y queso (Media docena)'
);

-- SFIHAS - Bondiola al Disco variants.
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - Bondiola al Disco (Docena)',
  'Docena de sfihas de bondiola al disco',
  20000.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-bondiola-disco.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - Bondiola al Disco (Docena)'
);

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - Bondiola al Disco (Media docena)',
  'Media docena de sfihas de bondiola al disco',
  10000.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-bondiola-disco.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - Bondiola al Disco (Media docena)'
);

-- Ensure Arma tu combos remain active and priced.
UPDATE products
SET price = 10000.00, is_active = true
WHERE name = 'Arma tu x6 de empanadas';

UPDATE products
SET price = 20000.00, is_active = true
WHERE name = 'Arma tu x12 de empanadas';
