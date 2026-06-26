-- Deactivate 1.5-dozen empanada packs no longer sold on the customer menu.
-- Keeps rows for order_items FK history; menu queries filter is_active = true.

UPDATE products
SET is_active = false
WHERE is_active = true
  AND category = 'empanadas'
  AND (
    name IN (
      '1 Docena y Media de Árabes',
      '1 Docena y Media de Jamón y Queso',
      '1 Docena y Media de Cebolla y Queso',
      '1 Docena y Media de Bondiola al Disco'
    )
    OR name ILIKE '%docena y media%'
    OR name ILIKE '%media docena%'
  );
