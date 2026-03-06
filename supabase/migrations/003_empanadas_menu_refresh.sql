-- Refresh empanadas menu with new flavors, prices and combo options
-- Applies to all branches because products are global.

-- Rename/update legacy rows if they still exist.
UPDATE products
SET
  name = 'FATAY - Árabes',
  description = 'Empanada árabe tradicional',
  price = 1800.00,
  image_url = '/images/menu/empanadas/fatay-arabe.jpeg',
  category = 'empanadas',
  is_active = true
WHERE name = 'Empanada Árabe (unidad)';

UPDATE products
SET
  name = 'Arma tu x12 de empanadas',
  description = 'Elegí cualquier combinación entre los 4 gustos disponibles',
  price = 20000.00,
  image_url = '/images/menu/combos/empanadas-docena.jpg',
  category = 'empanadas',
  is_active = true
WHERE name = 'Docena de Empanadas Árabes';

-- Keep these records normalized in case they already exist with stale values.
UPDATE products
SET price = 1800.00, image_url = '/images/menu/empanadas/fatay-arabe.jpeg', is_active = true
WHERE name = 'FATAY - Árabes';

UPDATE products
SET price = 1800.00, image_url = '/images/menu/empanadas/sfihas-jamon-queso.jpeg', is_active = true
WHERE name = 'SFIHAS - jamón y queso';

UPDATE products
SET price = 1800.00, image_url = '/images/menu/empanadas/sfihas-queso-cebolla.jpeg', is_active = true
WHERE name = 'SFIHAS - cebolla y queso';

UPDATE products
SET price = 1800.00, image_url = '/images/menu/empanadas/sfihas-bondiola-disco.jpeg', is_active = true
WHERE name = 'SFIHAS - Bondiola al Disco';

UPDATE products
SET price = 10000.00, is_active = true
WHERE name = 'Arma tu x6 de empanadas';

UPDATE products
SET price = 20000.00, is_active = true
WHERE name = 'Arma tu x12 de empanadas';

-- Insert missing new rows.
INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - jamón y queso',
  'Empanada sfihas de jamón y queso',
  1800.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-jamon-queso.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - jamón y queso'
);

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - cebolla y queso',
  'Empanada sfihas de cebolla y queso',
  1800.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-queso-cebolla.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - cebolla y queso'
);

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'SFIHAS - Bondiola al Disco',
  'Empanada sfihas de bondiola al disco',
  1800.00,
  'empanadas',
  '/images/menu/empanadas/sfihas-bondiola-disco.jpeg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'SFIHAS - Bondiola al Disco'
);

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'Arma tu x6 de empanadas',
  'Elegí cualquier combinación entre los 4 gustos disponibles',
  10000.00,
  'empanadas',
  '/images/menu/combos/empanadas-docena.jpg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Arma tu x6 de empanadas'
);

INSERT INTO products (name, description, price, category, image_url, is_active)
SELECT
  'Arma tu x12 de empanadas',
  'Elegí cualquier combinación entre los 4 gustos disponibles',
  20000.00,
  'empanadas',
  '/images/menu/combos/empanadas-docena.jpg',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Arma tu x12 de empanadas'
);
