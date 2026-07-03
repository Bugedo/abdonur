-- Route Nueva Córdoba customer WhatsApp to San Vicente (same line as operator panel).
-- Orders still save branch_id = nueva-cordoba; only the contact number changes.

UPDATE branches
SET whatsapp_number = (
  SELECT whatsapp_number FROM branches WHERE slug = 'san-vicente' LIMIT 1
)
WHERE slug = 'nueva-cordoba';
