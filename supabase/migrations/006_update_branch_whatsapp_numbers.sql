-- Update branch WhatsApp numbers for real-world testing.
-- Numbers are stored in wa.me compatible format: 549xxxxxxxxxx

UPDATE branches
SET whatsapp_number = '5493517189630'
WHERE slug IN ('nueva-cordoba', 'alta-cordoba');

UPDATE branches
SET whatsapp_number = '5493517017209'
WHERE slug = 'marques';

UPDATE branches
SET whatsapp_number = '5493516519006'
WHERE slug = 'pueyrredon';

UPDATE branches
SET whatsapp_number = '5493512705825'
WHERE slug = 'san-vicente';

UPDATE branches
SET whatsapp_number = '5493513224810'
WHERE slug = 'alberdi';
