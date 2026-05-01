-- Envío por distancia geodésica (Haversine) desde coordenadas de sucursal.

ALTER TABLE branches ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC(8, 3);

COMMENT ON COLUMN branches.latitude IS 'WGS84 origen para cálculo de envío';
COMMENT ON COLUMN branches.longitude IS 'WGS84 origen para cálculo de envío';
COMMENT ON COLUMN orders.delivery_fee IS 'Cargo envío ARS cuando delivery_method=delivery';
COMMENT ON COLUMN orders.delivery_distance_km IS 'Distancia geodésica sucursal-destino (km) solo delivery';

UPDATE branches SET latitude = -31.4047, longitude = -64.2061 WHERE slug = 'san-vicente';
UPDATE branches SET latitude = -31.3894, longitude = -64.1732 WHERE slug = 'alta-cordoba';
UPDATE branches SET latitude = -31.4279, longitude = -64.1825 WHERE slug = 'nueva-cordoba';
UPDATE branches SET latitude = -31.4124, longitude = -64.2078 WHERE slug = 'alberdi';
UPDATE branches SET latitude = -31.3755, longitude = -64.1732 WHERE slug = 'marques';
UPDATE branches SET latitude = -31.3952, longitude = -64.2395 WHERE slug = 'pueyrredon';
