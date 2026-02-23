'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { CartItem, DeliveryMethod, PaymentMethod } from '@/types';
import { revalidatePath } from 'next/cache';

interface CreateOrderInput {
  branchId: string;
  customerName: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
}

interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { branchId, customerName, notes, deliveryMethod, address, paymentMethod, items } = input;

  // Validaciones del servidor
  if (!customerName.trim()) {
    return { success: false, error: 'El nombre es obligatorio.' };
  }

  if (deliveryMethod === 'delivery' && !address.trim()) {
    return { success: false, error: 'La dirección es obligatoria para envío a domicilio.' };
  }

  if (items.length === 0) {
    return { success: false, error: 'El carrito está vacío.' };
  }

  // Calcular total
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  // Crear el pedido
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      branch_id: branchId,
      customer_name: customerName.trim(),
      notes: notes.trim(),
      delivery_method: deliveryMethod,
      address: deliveryMethod === 'delivery' ? address.trim() : '',
      payment_method: paymentMethod,
      total_price: totalPrice,
      status: 'new',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Error creating order:', orderError?.message);
    return { success: false, error: 'Error al crear el pedido. Intentá de nuevo.' };
  }

  // Crear los items del pedido
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError.message);
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    return { success: false, error: 'Error al crear el pedido. Intentá de nuevo.' };
  }

  // Refresca paneles admin para que entren pedidos nuevos sin esperar al cache.
  revalidatePath('/admin');
  revalidatePath('/admin/admin');
  revalidatePath('/admin/sucursal/[id]', 'page');

  return { success: true, orderId: order.id };
}
