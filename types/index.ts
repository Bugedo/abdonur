// ─────────────────────────────────────
// Tipos globales — Empanadas Abdonur
// ─────────────────────────────────────

// ── Sucursales ──
export interface Branch {
  id: string;
  name: string;
  address: string;
  whatsapp_number: string;
  opening_hours: string;
  is_active: boolean;
}

// ── Productos ──
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
}

// ── Pedidos ──
export type OrderStatus = 'new' | 'confirmed' | 'completed' | 'cancelled';
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
  // Relaciones opcionales (cuando se hace join)
  branch?: Branch;
  order_items?: OrderItem[];
}

// ── Items del pedido ──
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  // Relación opcional (cuando se hace join)
  product?: Product;
}

// ── Carrito (estado local, no se guarda en DB) ──
export interface CartItem {
  product: Product;
  quantity: number;
}

// ── Formulario de pedido ──
export interface OrderFormData {
  customer_name: string;
  notes: string;
  delivery_method: DeliveryMethod;
  address: string;
  payment_method: PaymentMethod;
}

