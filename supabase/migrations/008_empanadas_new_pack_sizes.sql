-- Reconfigure empanadas pack sizes for all flavors.
-- Target menu structure:
-- 1 Docena, 1 Docena y Media, 2 Docenas, Por Unidad
-- for FATAY + 3 SFIHAS flavors.
-- Also replace combo x6 with x8 and keep docena builder.

-- ─────────────────────────────────────
-- Normalize legacy unit rows
-- ─────────────────────────────────────
UPDATE products
SET name = 'Árabe por Unidad'
WHERE name IN ('FATAY - Árabes', 'FATAY - Árabes (Unidad)');

UPDATE products
SET name = 'Jamón y Queso por Unidad'
WHERE name IN ('SFIHAS - jamón y queso', 'SFIHAS - jamón y queso (Unidad)');

UPDATE products
SET name = 'Cebolla y Queso por Unidad'
WHERE name IN ('SFIHAS - cebolla y queso', 'SFIHAS - cebolla y queso (Unidad)');

UPDATE products
SET name = 'Bondiola al Disco por Unidad'
WHERE name IN ('SFIHAS - Bondiola al Disco', 'SFIHAS - Bondiola al Disco (Unidad)');

-- Normalize legacy docena/media rows from previous migrations.
UPDATE products SET name = '1 Docena de Árabes' WHERE name IN ('FATAY - Árabes (Docena)', 'Docena de Árabes');
UPDATE products SET name = '1 Docena y Media de Árabes' WHERE name IN ('FATAY - Árabes (Media docena)', 'Media Docena de Árabes');

UPDATE products SET name = '1 Docena de Jamón y Queso' WHERE name IN ('SFIHAS - jamón y queso (Docena)', 'Docena de Jamón y Queso');
UPDATE products SET name = '1 Docena y Media de Jamón y Queso' WHERE name IN ('SFIHAS - jamón y queso (Media docena)', 'Media Docena de Jamón y Queso');

UPDATE products SET name = '1 Docena de Cebolla y Queso' WHERE name IN ('SFIHAS - cebolla y queso (Docena)', 'Docena de Cebolla y Queso');
UPDATE products SET name = '1 Docena y Media de Cebolla y Queso' WHERE name IN ('SFIHAS - cebolla y queso (Media docena)', 'Media Docena de Cebolla y Queso');

UPDATE products SET name = '1 Docena de Bondiola al Disco' WHERE name IN ('SFIHAS - Bondiola al Disco (Docena)', 'Docena de Bondiola al Disco');
UPDATE products SET name = '1 Docena y Media de Bondiola al Disco' WHERE name IN ('SFIHAS - Bondiola al Disco (Media docena)', 'Media Docena de Bondiola al Disco');

-- ─────────────────────────────────────
-- Keep canonical rows aligned (price/image/category/active)
-- ─────────────────────────────────────
UPDATE products
SET
  description = 'Empanada árabe tradicional por unidad',
  price = 1800.00,
  category = 'empanadas',
  image_url = '/images/menu/empanadas/fatay-arabe.jpeg',
  is_active = true
WHERE name = 'Árabe por Unidad';

UPDATE products
SET
  description = 'Empanada de jamón y queso por unidad',
  price = 1800.00,
  category = 'empanadas',
  image_url = '/images/menu/empanadas/sfihas-jamon-queso.jpeg',
  is_active = true
WHERE name = 'Jamón y Queso por Unidad';

UPDATE products
SET
  description = 'Empanada de cebolla y queso por unidad',
  price = 1800.00,
  category = 'empanadas',
  image_url = '/images/menu/empanadas/sfihas-queso-cebolla.jpeg',
  is_active = true
WHERE name = 'Cebolla y Queso por Unidad';

UPDATE products
SET
  description = 'Empanada de bondiola al disco por unidad',
  price = 1800.00,
  category = 'empanadas',
  image_url = '/images/menu/empanadas/sfihas-bondiola-disco.jpeg',
  is_active = true
WHERE name = 'Bondiola al Disco por Unidad';

UPDATE products
SET description = 'Docena de empanadas árabes', price = 20000.00, category = 'empanadas', image_url = '/images/menu/empanadas/fatay-arabe.jpeg', is_active = true
WHERE name = '1 Docena de Árabes';
UPDATE products
SET description = 'Docena y media de empanadas árabes', price = 30000.00, category = 'empanadas', image_url = '/images/menu/empanadas/fatay-arabe.jpeg', is_active = true
WHERE name = '1 Docena y Media de Árabes';
UPDATE products
SET description = 'Dos docenas de empanadas árabes', price = 40000.00, category = 'empanadas', image_url = '/images/menu/empanadas/fatay-arabe.jpeg', is_active = true
WHERE name = '2 Docenas de Árabes';

UPDATE products
SET description = 'Docena de empanadas de jamón y queso', price = 20000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-jamon-queso.jpeg', is_active = true
WHERE name = '1 Docena de Jamón y Queso';
UPDATE products
SET description = 'Docena y media de empanadas de jamón y queso', price = 30000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-jamon-queso.jpeg', is_active = true
WHERE name = '1 Docena y Media de Jamón y Queso';
UPDATE products
SET description = 'Dos docenas de empanadas de jamón y queso', price = 40000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-jamon-queso.jpeg', is_active = true
WHERE name = '2 Docenas de Jamón y Queso';

UPDATE products
SET description = 'Docena de empanadas de cebolla y queso', price = 20000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-queso-cebolla.jpeg', is_active = true
WHERE name = '1 Docena de Cebolla y Queso';
UPDATE products
SET description = 'Docena y media de empanadas de cebolla y queso', price = 30000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-queso-cebolla.jpeg', is_active = true
WHERE name = '1 Docena y Media de Cebolla y Queso';
UPDATE products
SET description = 'Dos docenas de empanadas de cebolla y queso', price = 40000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-queso-cebolla.jpeg', is_active = true
WHERE name = '2 Docenas de Cebolla y Queso';

UPDATE products
SET description = 'Docena de empanadas de bondiola al disco', price = 20000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-bondiola-disco.jpeg', is_active = true
WHERE name = '1 Docena de Bondiola al Disco';
UPDATE products
SET description = 'Docena y media de empanadas de bondiola al disco', price = 30000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-bondiola-disco.jpeg', is_active = true
WHERE name = '1 Docena y Media de Bondiola al Disco';
UPDATE products
SET description = 'Dos docenas de empanadas de bondiola al disco', price = 40000.00, category = 'empanadas', image_url = '/images/menu/empanadas/sfihas-bondiola-disco.jpeg', is_active = true
WHERE name = '2 Docenas de Bondiola al Disco';

-- ─────────────────────────────────────
-- Insert missing canonical rows
-- ─────────────────────────────────────
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT 'Árabe por Unidad', 'Empanada árabe tradicional por unidad', 1800.00, 'empanadas', '/images/menu/empanadas/fatay-arabe.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Árabe por Unidad');

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT 'Jamón y Queso por Unidad', 'Empanada de jamón y queso por unidad', 1800.00, 'empanadas', '/images/menu/empanadas/sfihas-jamon-queso.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Jamón y Queso por Unidad');

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT 'Cebolla y Queso por Unidad', 'Empanada de cebolla y queso por unidad', 1800.00, 'empanadas', '/images/menu/empanadas/sfihas-queso-cebolla.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cebolla y Queso por Unidad');

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT 'Bondiola al Disco por Unidad', 'Empanada de bondiola al disco por unidad', 1800.00, 'empanadas', '/images/menu/empanadas/sfihas-bondiola-disco.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bondiola al Disco por Unidad');

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '1 Docena de Árabes', 'Docena de empanadas árabes', 20000.00, 'empanadas', '/images/menu/empanadas/fatay-arabe.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '1 Docena de Árabes');
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '1 Docena y Media de Árabes', 'Docena y media de empanadas árabes', 30000.00, 'empanadas', '/images/menu/empanadas/fatay-arabe.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '1 Docena y Media de Árabes');
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '2 Docenas de Árabes', 'Dos docenas de empanadas árabes', 40000.00, 'empanadas', '/images/menu/empanadas/fatay-arabe.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '2 Docenas de Árabes');

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '1 Docena de Jamón y Queso', 'Docena de empanadas de jamón y queso', 20000.00, 'empanadas', '/images/menu/empanadas/sfihas-jamon-queso.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '1 Docena de Jamón y Queso');
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '1 Docena y Media de Jamón y Queso', 'Docena y media de empanadas de jamón y queso', 30000.00, 'empanadas', '/images/menu/empanadas/sfihas-jamon-queso.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '1 Docena y Media de Jamón y Queso');
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '2 Docenas de Jamón y Queso', 'Dos docenas de empanadas de jamón y queso', 40000.00, 'empanadas', '/images/menu/empanadas/sfihas-jamon-queso.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '2 Docenas de Jamón y Queso');

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '1 Docena de Cebolla y Queso', 'Docena de empanadas de cebolla y queso', 20000.00, 'empanadas', '/images/menu/empanadas/sfihas-queso-cebolla.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '1 Docena de Cebolla y Queso');
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '1 Docena y Media de Cebolla y Queso', 'Docena y media de empanadas de cebolla y queso', 30000.00, 'empanadas', '/images/menu/empanadas/sfihas-queso-cebolla.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '1 Docena y Media de Cebolla y Queso');
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '2 Docenas de Cebolla y Queso', 'Dos docenas de empanadas de cebolla y queso', 40000.00, 'empanadas', '/images/menu/empanadas/sfihas-queso-cebolla.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '2 Docenas de Cebolla y Queso');

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '1 Docena de Bondiola al Disco', 'Docena de empanadas de bondiola al disco', 20000.00, 'empanadas', '/images/menu/empanadas/sfihas-bondiola-disco.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '1 Docena de Bondiola al Disco');
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '1 Docena y Media de Bondiola al Disco', 'Docena y media de empanadas de bondiola al disco', 30000.00, 'empanadas', '/images/menu/empanadas/sfihas-bondiola-disco.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '1 Docena y Media de Bondiola al Disco');
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT '2 Docenas de Bondiola al Disco', 'Dos docenas de empanadas de bondiola al disco', 40000.00, 'empanadas', '/images/menu/empanadas/sfihas-bondiola-disco.jpeg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '2 Docenas de Bondiola al Disco');

-- ─────────────────────────────────────
-- Canonical combo rows: Armá tu Docena + Armá tu x8
-- ─────────────────────────────────────
DO $$
DECLARE
  keep_docena_id uuid;
BEGIN
  SELECT id INTO keep_docena_id
  FROM products
  WHERE name IN ('Armá tu Docena', 'Arma tu x12 de empanadas', 'Arma tu x12')
  ORDER BY CASE WHEN name = 'Armá tu Docena' THEN 0 ELSE 1 END, created_at NULLS LAST
  LIMIT 1;

  IF keep_docena_id IS NULL THEN
    INSERT INTO products (name, description, price, category, image_url, is_active)
    VALUES (
      'Armá tu Docena',
      'Elegí cualquier combinación entre los 4 gustos disponibles',
      20000.00,
      'empanadas',
      '/images/menu/empanadas/fatay-arabe.jpeg',
      true
    )
    RETURNING id INTO keep_docena_id;
  ELSE
    UPDATE products
    SET
      name = 'Armá tu Docena',
      description = 'Elegí cualquier combinación entre los 4 gustos disponibles',
      price = 20000.00,
      category = 'empanadas',
      image_url = '/images/menu/empanadas/fatay-arabe.jpeg',
      is_active = true
    WHERE id = keep_docena_id;
  END IF;

  UPDATE products
  SET is_active = false
  WHERE id <> keep_docena_id
    AND name IN ('Armá tu Docena', 'Arma tu x12 de empanadas', 'Arma tu x12');
END $$;

DO $$
DECLARE
  keep_x8_id uuid;
BEGIN
  SELECT id INTO keep_x8_id
  FROM products
  WHERE name IN ('Armá tu x8', 'Arma tu x8 de empanadas', 'Arma tu x6 de empanadas', 'Arma tu x6')
  ORDER BY CASE WHEN name = 'Armá tu x8' THEN 0 WHEN name = 'Arma tu x8 de empanadas' THEN 1 ELSE 2 END, created_at NULLS LAST
  LIMIT 1;

  IF keep_x8_id IS NULL THEN
    INSERT INTO products (name, description, price, category, image_url, is_active)
    VALUES (
      'Armá tu x8',
      'Elegí cualquier combinación entre los 4 gustos disponibles',
      10800.00,
      'empanadas',
      '/images/menu/empanadas/fatay-arabe.jpeg',
      true
    )
    RETURNING id INTO keep_x8_id;
  ELSE
    UPDATE products
    SET
      name = 'Armá tu x8',
      description = 'Elegí cualquier combinación entre los 4 gustos disponibles',
      price = 10800.00,
      category = 'empanadas',
      image_url = '/images/menu/empanadas/fatay-arabe.jpeg',
      is_active = true
    WHERE id = keep_x8_id;
  END IF;

  UPDATE products
  SET is_active = false
  WHERE id <> keep_x8_id
    AND name IN ('Armá tu x8', 'Arma tu x8 de empanadas', 'Arma tu x6 de empanadas', 'Arma tu x6');
END $$;
