-- ═══════════════════════════════════════════════════════════════
-- EMPANADAS ÁRABES ABDONUR — Migración inicial
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
  category    TEXT NOT NULL DEFAULT 'empanadas',
  image_url   TEXT DEFAULT '',
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
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ─────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- BRANCHES: cualquiera puede leer las activas
CREATE POLICY "branches_public_read" ON branches
  FOR SELECT USING (is_active = true);

-- BRANCHES: admins pueden ver todas
CREATE POLICY "branches_admin_read" ON branches
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- PRODUCTS: cualquiera puede leer los activos
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

-- PRODUCTS: admins pueden ver todos
CREATE POLICY "products_admin_read" ON products
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- ORDERS: cualquiera puede crear pedidos (anon insert)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- ORDERS: admins ven pedidos de SU sucursal o todos si es super_admin
CREATE POLICY "orders_admin_read" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin')
    OR
    branch_id IN (
      SELECT branch_id FROM admin_users WHERE user_id = auth.uid() AND role = 'branch_admin'
    )
  );

-- ORDERS: admins pueden actualizar pedidos de SU sucursal o todos si es super_admin
CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin')
    OR
    branch_id IN (
      SELECT branch_id FROM admin_users WHERE user_id = auth.uid() AND role = 'branch_admin'
    )
  );

-- ORDER_ITEMS: cualquiera puede insertar
CREATE POLICY "order_items_public_insert" ON order_items
  FOR INSERT WITH CHECK (true);

-- ORDER_ITEMS: solo admins de la sucursal o super_admin pueden leer
CREATE POLICY "order_items_admin_read" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin')
    OR
    order_id IN (
      SELECT o.id FROM orders o
      JOIN admin_users au ON au.branch_id = o.branch_id
      WHERE au.user_id = auth.uid() AND au.role = 'branch_admin'
    )
  );

-- ADMIN_USERS: solo el propio admin puede leer su registro, y super_admin puede leer todos
CREATE POLICY "admin_users_self_read" ON admin_users
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- ─────────────────────────────────────
-- 4. SEEDS — Datos iniciales
-- ─────────────────────────────────────

-- 6 Sucursales reales de Córdoba
INSERT INTO branches (name, address, whatsapp_number, opening_hours, is_active) VALUES
  ('Abdonur San Vicente',       'Ambrosio Funes 1241, San Vicente, Córdoba',                  '543517061970',  'Lun a Dom 10:00 - 23:00', true),
  ('Abdonur Alta Córdoba',      'Fragueiro 2118, Alta Córdoba',                               '543517619358',  'Lun a Dom 10:00 - 23:00', true),
  ('Abdonur Alberdi',           'Av. Colón 3228, Alberdi, Córdoba',                           '543512052055',  'Lun a Dom 10:00 - 23:00', true),
  ('Abdonur Nueva Córdoba',     'Nueva Córdoba (Solo Delivery)',                               '543517619358',  'Lun a Dom 10:00 - 23:00', true),
  ('Abdonur Marqués',           'Luciano de Figueroa 305, esq Pimentel, Marqués, Córdoba',    '543517539009',  'Lun a Dom 10:00 - 23:00', true),
  ('Abdonur Gral. Pueyrredón',  'Av. Patria 920, esquina Armenia, Gral. Pueyrredón, Córdoba', '543518176818',  'Lun a Dom 10:00 - 23:00', true);

-- Productos reales
INSERT INTO products (name, description, price, category, image_url, is_active) VALUES
  -- Empanadas
  ('Empanada Árabe (unidad)',     'Empanada árabe tradicional',                                                                    1600.00, 'empanadas', '/images/menu/empanadas-arabes.jpg', true),
  ('Docena de Empanadas Árabes',  '12 empanadas árabes tradicionales',                                                            18000.00, 'empanadas', '/images/menu/empanadas-docena.jpg', true),

  -- Comidas
  ('Almuerzo o Cena para 2',      '2 empanadas, 4 niños envueltos, 2 porc de quebbe, 1 porc puré de garbanzos, 1 porc de aceitunas y 6 pancitos', 19500.00, 'comidas', '/images/menu/combo-para-dos.jpg', true),
  ('Quebbe - 1 Kg',               'Quebbe por kilo',                                                                              18400.00, 'comidas', '/images/menu/quebbe.jpg', true),
  ('Quebbe - Porción',            'Porción aproximada de quebbe',                                                                  4500.00, 'comidas', '/images/menu/quebbe.jpg', true),
  ('Niños Envueltos - 1 Kg',      'Niños envueltos por kilo',                                                                     27000.00, 'comidas', '/images/menu/ninos-envueltos.jpg', true),
  ('Niños Envueltos - Porción',   'Porción aproximada de niños envueltos',                                                         7000.00, 'comidas', '/images/menu/ninos-envueltos.jpg', true),
  ('Puré de Garbanzos - 1 Kg',    'Puré de garbanzos por kilo',                                                                   11900.00, 'comidas', '/images/menu/pure-garbanzos.jpg', true),
  ('Puré de Garbanzos - Porción', 'Porción aproximada de puré de garbanzos',                                                       2600.00, 'comidas', '/images/menu/pure-garbanzos.jpg', true),
  ('Laben - 250 cm3',             'Laben en porción de 250 cm3',                                                                   2400.00, 'comidas', '/images/menu/laben.jpg', true),
  ('Aceitunas a la Árabe - 1 Kg', 'Aceitunas a la árabe por kilo',                                                                21000.00, 'comidas', '/images/menu/aceitunas-arabes.jpg', true),
  ('Aceitunas a la Árabe - Porción','Porción aproximada de aceitunas a la árabe',                                                   4000.00, 'comidas', '/images/menu/aceitunas-arabes.jpg', true),

  -- Postres
  ('Namura - Porción',            'Postre árabe Namura',                                                                           1600.00, 'postres', '/images/menu/namura.jpg', true),
  ('Backlawa - Porción',          'Postre árabe Backlawa',                                                                         2500.00, 'postres', '/images/menu/backlawa.jpg', true);
