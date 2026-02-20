-- ═══════════════════════════════════════════════════════════════
-- EMPANADAS ABDONUR — Migración inicial
-- Tablas, relaciones, RLS y seeds
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────
-- 1. TABLAS
-- ─────────────────────────────────────

-- Sucursales
CREATE TABLE IF NOT EXISTS branches (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  opening_hours   TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       NUMERIC(10,2) NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id       UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  customer_name   TEXT NOT NULL,
  notes           TEXT DEFAULT '',
  delivery_method TEXT NOT NULL DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'delivery')),
  address         TEXT DEFAULT '',
  payment_method  TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer')),
  total_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Items del pedido
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL
);

-- Admins vinculados a sucursales (usa auth.users de Supabase)
-- role: 'branch_admin' (ve solo su sucursal) | 'super_admin' (ve todo)
-- branch_id es NULL para super_admin
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id  UUID REFERENCES branches(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'branch_admin' CHECK (role IN ('branch_admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────
-- 2. ÍNDICES
-- ─────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- ─────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────

-- Habilitar RLS en todas las tablas
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- BRANCHES: cualquiera puede leer las activas
CREATE POLICY "branches_public_read" ON branches
  FOR SELECT USING (is_active = true);

-- BRANCHES: admins pueden ver todas (incluso inactivas)
CREATE POLICY "branches_admin_read" ON branches
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- PRODUCTS: cualquiera puede leer los activos
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

-- PRODUCTS: admins pueden ver todos (incluso inactivos)
CREATE POLICY "products_admin_read" ON products
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- ORDERS: cualquiera puede crear pedidos (anon insert)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- ORDERS: admins solo ven pedidos de SU sucursal
CREATE POLICY "orders_admin_read" ON orders
  FOR SELECT USING (
    branch_id IN (
      SELECT branch_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- ORDERS: admins pueden actualizar pedidos de SU sucursal
CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (
    branch_id IN (
      SELECT branch_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- ORDER_ITEMS: cualquiera puede insertar (al crear pedido)
CREATE POLICY "order_items_public_insert" ON order_items
  FOR INSERT WITH CHECK (true);

-- ORDER_ITEMS: solo admins de la sucursal pueden leer
CREATE POLICY "order_items_admin_read" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN admin_users au ON au.branch_id = o.branch_id
      WHERE au.user_id = auth.uid()
    )
  );

-- ADMIN_USERS: solo el propio admin puede leer su registro
CREATE POLICY "admin_users_self_read" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

-- ─────────────────────────────────────
-- 4. SEEDS — Datos iniciales
-- ─────────────────────────────────────

-- 5 Sucursales
INSERT INTO branches (name, address, whatsapp_number, opening_hours, is_active) VALUES
  ('Abdonur Centro',     'Av. San Martín 450, Centro',           '5491112345678', 'Lun a Sáb 10:00 - 22:00', true),
  ('Abdonur Norte',      'Av. Libertador 1200, Zona Norte',      '5491112345679', 'Lun a Dom 11:00 - 23:00', true),
  ('Abdonur Sur',        'Calle Belgrano 890, Zona Sur',         '5491112345680', 'Mar a Dom 10:00 - 21:00', true),
  ('Abdonur Oeste',      'Ruta 7 km 34, Zona Oeste',             '5491112345681', 'Lun a Vie 11:00 - 22:00', true),
  ('Abdonur Costanera',  'Costanera Sur 300, Frente al río',     '5491112345682', 'Jue a Dom 12:00 - 00:00', true);

-- Productos (empanadas)
INSERT INTO products (name, description, price, is_active) VALUES
  ('Carne suave',         'Clásica carne cortada a cuchillo con cebolla',   1200.00, true),
  ('Carne picante',       'Carne cortada a cuchillo con ají molido',        1200.00, true),
  ('Jamón y queso',       'Jamón cocido con queso mozzarella',              1100.00, true),
  ('Pollo',               'Pollo desmenuzado con cebolla y morrón',         1200.00, true),
  ('Humita',              'Choclo cremoso con salsa blanca',                1100.00, true),
  ('Caprese',             'Tomate, albahaca y mozzarella',                  1100.00, true),
  ('Roquefort y nuez',    'Queso roquefort con nueces',                     1300.00, true),
  ('Verdura',             'Acelga, cebolla y huevo',                        1000.00, true),
  ('Árabe',               'Carne con limón, especias y piñones',            1400.00, true),
  ('Empanada del mes',    'Sabor especial que cambia cada mes',             1500.00, true);

