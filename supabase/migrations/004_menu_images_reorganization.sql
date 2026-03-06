-- Normalize menu image paths after public/images/menu reorganization.

UPDATE products
SET image_url = '/images/menu/empanadas/fatay-arabe.jpeg'
WHERE name = 'FATAY - Árabes';

UPDATE products
SET image_url = '/images/menu/empanadas/sfihas-jamon-queso.jpeg'
WHERE name = 'SFIHAS - jamón y queso';

UPDATE products
SET image_url = '/images/menu/empanadas/sfihas-queso-cebolla.jpeg'
WHERE name = 'SFIHAS - cebolla y queso';

UPDATE products
SET image_url = '/images/menu/empanadas/sfihas-bondiola-disco.jpeg'
WHERE name = 'SFIHAS - Bondiola al Disco';

UPDATE products
SET image_url = '/images/menu/combos/empanadas-docena.jpg'
WHERE name IN ('Arma tu x6 de empanadas', 'Arma tu x12 de empanadas', 'Docena de Empanadas Árabes');

UPDATE products
SET image_url = '/images/menu/combos/combo-para-dos.jpg'
WHERE name = 'Picada p 2 (comen 2, pican 3)';

UPDATE products
SET image_url = '/images/menu/comidas/quebbe.jpg'
WHERE name IN ('Quebbe - 1 Kg', 'Quebbe - Porción');

UPDATE products
SET image_url = '/images/menu/comidas/ninos-envueltos.jpg'
WHERE name IN ('Niños Envueltos - 1 Kg', 'Niños Envueltos - Porción');

UPDATE products
SET image_url = '/images/menu/comidas/pure-garbanzos.jpg'
WHERE name IN ('Puré de Garbanzos - 1 Kg', 'Puré de Garbanzos - Porción');

UPDATE products
SET image_url = '/images/menu/comidas/laben.jpg'
WHERE name = 'Laben - 250 cm3';

UPDATE products
SET image_url = '/images/menu/comidas/aceitunas-arabes.jpg'
WHERE name IN ('Aceitunas a la Árabe - 1 Kg', 'Aceitunas a la Árabe - Porción');

UPDATE products
SET image_url = '/images/menu/postres/namura.jpg'
WHERE name = 'Namura - Porción';

UPDATE products
SET image_url = '/images/menu/postres/backlawa.jpg'
WHERE name = 'Backlawa - Porción';
