// ─────────────────────────────────────
// Tipos globales — Empanadas Árabes Abdonur
// ─────────────────────────────────────

// ── Sucursales ──
export interface Branch {
  id: string;
  slug: string;
  name: string;
  address: string;
  whatsapp_number: string;
  opening_hours: string;
  is_active: boolean;
}

// ── Productos ──
export type ProductCategory = 'empanadas' | 'comidas' | 'postres';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image_url: string;
  is_active: boolean;
}

// ── Pedidos ──
export type OrderStatus = 'new' | 'confirmed' | 'on_the_way' | 'ready' | 'completed' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'transfer';

export interface Order {
  id: string;
  branch_id: string;
  customer_name: string;
  notes: string | null;
  delivery_method: DeliveryMethod;
  address: string | null;
  payment_method: PaymentMethod;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  branch?: Branch;
  branches?: { name: string };
  order_items?: OrderItem[];
}

// ── Items del pedido ──
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

// ── Carrito (estado local, no se guarda en DB) ──
export interface CartItem {
  cartKey?: string;
  product: Product;
  quantity: number;
  unitPrice?: number;
  displayName?: string;
  comboDetail?: string;
}

// ── Admin ──
export type AdminRole = 'branch_admin' | 'super_admin';

export interface AdminUser {
  id: string;
  user_id: string;
  branch_id: string | null;
  role: AdminRole;
}

export type AdminOrderWithItems = Omit<Order, 'order_items'> & {
  order_items?: (OrderItem & { products?: { name: string } })[];
  branches?: { name: string };
};

// ── Formulario de pedido ──
export interface OrderFormData {
  customer_name: string;
  notes: string;
  delivery_method: DeliveryMethod;
  address: string;
  payment_method: PaymentMethod;
}

// ── Admin Stats ──
export type AdminStatsRangePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'month' | 'custom';

export interface AdminStatsFilters {
  preset: AdminStatsRangePreset;
  fromIso: string;
  toIso: string;
  fromInput: string;
  toInput: string;
  branchId?: string;
}

export interface AdminStatsKpis {
  netSales: number;
  createdOrders: number;
  completedOrders: number;
  activeOrders: number;
  averageOrderValue: number;
  cancellationRate: number;
  averageActiveMinutes: number;
  activeSlaRate: number;
}

export interface AdminStatsPoint {
  label: string;
  sales: number;
  orders: number;
  cancelled: number;
}

export interface AdminStatsStatusRow {
  status: OrderStatus;
  orders: number;
  sales: number;
}

export interface AdminStatsTopProductRow {
  productName: string;
  quantity: number;
  sales: number;
}

export interface AdminStatsBranchRow {
  branchId: string;
  branchName: string;
  orders: number;
  sales: number;
}

export interface AdminStatsBreakdownRow {
  label: string;
  orders: number;
}

export interface AdminStatsData {
  current: AdminStatsKpis;
  previous: AdminStatsKpis;
  timeSeries: AdminStatsPoint[];
  statusRows: AdminStatsStatusRow[];
  topProducts: AdminStatsTopProductRow[];
  paymentRows: AdminStatsBreakdownRow[];
  deliveryRows: AdminStatsBreakdownRow[];
  branchRows?: AdminStatsBranchRow[];
}
