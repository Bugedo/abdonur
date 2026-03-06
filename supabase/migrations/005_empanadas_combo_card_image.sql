-- Show x6/x12 combo cards with empanada image in menu.

UPDATE products
SET image_url = '/images/menu/empanadas/fatay-arabe.jpeg'
WHERE name IN ('Arma tu x6 de empanadas', 'Arma tu x12 de empanadas');
