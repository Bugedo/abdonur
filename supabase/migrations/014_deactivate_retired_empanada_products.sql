-- Deactivate empanada products no longer sold (2 dozen packs, x8/x6 combo builders).
-- Keeps rows for order_items FK history; menu queries filter is_active = true.

UPDATE products
SET is_active = false
WHERE is_active = true
  AND category = 'empanadas'
  AND (
    name IN (
      '2 Docenas de Árabes',
      '2 Docenas de Jamón y Queso',
      '2 Docenas de Cebolla y Queso',
      '2 Docenas de Bondiola al Disco',
      'Dos Docenas de Árabes',
      'Dos Docenas de Jamón y Queso',
      'Dos Docenas de Cebolla y Queso',
      'Dos Docenas de Bondiola al Disco',
      'Armá tu x8',
      'Arma tu x8 de empanadas',
      'Arma tu x6 de empanadas',
      'Arma tu x6'
    )
    OR name ILIKE '%2 docenas%'
    OR name ILIKE '%dos docenas%'
    OR name ILIKE '%arma tu x8%'
    OR name ILIKE '%arma tu x6%'
  );
