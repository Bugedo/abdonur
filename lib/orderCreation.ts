import { supabaseAdmin } from '@/lib/supabaseServer';
import { quoteDeliveryForBranch } from '@/lib/deliveryQuoteServer';
import { CartItem, DeliveryMethod, PaymentMethod } from '@/types';

export interface BaseCreateOrderInput {
  branchId: string;
  customerName: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  /** Cotización ya validada (flujo público) */
  deliveryFee?: number;
  deliveryDistanceKm?: number | null;
  /** Si no hay cotización previa y hay coords, se calcula (ej. admin) */
  deliveryDestinationLat?: number | null;
  deliveryDestinationLng?: number | null;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  itemsSubtotal?: number;
  deliveryFee?: number;
  totalPrice?: number;
  deliveryDistanceKm?: number | null;
}

export function validateCreateOrderInput(input: BaseCreateOrderInput): CreateOrderResult | null {
  if (!input.customerName.trim()) {
    return { success: false, error: 'El nombre es obligatorio.' };
  }

  if (input.deliveryMethod === 'delivery' && !input.address.trim()) {
    return { success: false, error: 'La dirección es obligatoria para envío a domicilio.' };
  }

  if (input.items.length === 0) {
    return { success: false, error: 'El carrito está vacío.' };
  }

  return null;
}

async function resolveDeliveryPricing(input: BaseCreateOrderInput): Promise<
  | { ok: true; fee: number; distanceKm: number | null }
  | { ok: false; error: string }
> {
  if (input.deliveryMethod !== 'delivery') {
    return { ok: true, fee: 0, distanceKm: null };
  }

  if (input.deliveryFee !== undefined) {
    return {
      ok: true,
      fee: input.deliveryFee,
      distanceKm: input.deliveryDistanceKm ?? null,
    };
  }

  const lat = input.deliveryDestinationLat;
  const lng = input.deliveryDestinationLng;
  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    const q = await quoteDeliveryForBranch(input.branchId, lat, lng);
    if (!q.ok) return { ok: false, error: q.error };
    return { ok: true, fee: q.feeARS, distanceKm: q.distanceKm };
  }

  return { ok: true, fee: 0, distanceKm: null };
}

export async function createOrderRecord(input: BaseCreateOrderInput): Promise<CreateOrderResult> {
  const itemsSubtotal = input.items.reduce(
    (sum, i) => sum + (i.unitPrice ?? i.product.price) * i.quantity,
    0
  );

  const delivery = await resolveDeliveryPricing(input);
  if (!delivery.ok) {
    return { success: false, error: delivery.error };
  }

  const totalPrice = itemsSubtotal + delivery.fee;

  const comboLines = input.items
    .filter((item) => item.comboDetail)
    .map((item) => `${item.product.name}: ${item.comboDetail}`);
  const mergedNotes = [input.notes.trim(), comboLines.length ? `Detalle combos: ${comboLines.join(' | ')}` : '']
    .filter(Boolean)
    .join('\n');

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      branch_id: input.branchId,
      customer_name: input.customerName.trim(),
      notes: mergedNotes,
      delivery_method: input.deliveryMethod,
      address: input.deliveryMethod === 'delivery' ? input.address.trim() : '',
      payment_method: input.paymentMethod,
      total_price: totalPrice,
      delivery_fee: delivery.fee,
      delivery_distance_km: delivery.distanceKm,
      status: 'new',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Error creating order:', orderError?.message);
    return { success: false, error: 'Error al crear el pedido. Intentá de nuevo.' };
  }

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.unitPrice ?? item.product.price,
  }));

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError.message);
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    return { success: false, error: 'Error al crear el pedido. Intentá de nuevo.' };
  }

  return {
    success: true,
    orderId: order.id,
    itemsSubtotal,
    deliveryFee: delivery.fee,
    totalPrice,
    deliveryDistanceKm: delivery.distanceKm,
  };
}
