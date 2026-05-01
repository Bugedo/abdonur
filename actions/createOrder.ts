'use server';

import { validateCreateOrderInput, createOrderRecord, type BaseCreateOrderInput } from '@/lib/orderCreation';
import { quoteDeliveryForBranch } from '@/lib/deliveryQuoteServer';
import { CartItem, DeliveryMethod, PaymentMethod } from '@/types';
import { revalidatePath } from 'next/cache';

export interface CreateOrderInput {
  branchId: string;
  customerName: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  deliveryDestinationLat?: number;
  deliveryDestinationLng?: number;
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

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const {
    branchId,
    customerName,
    notes,
    deliveryMethod,
    address,
    paymentMethod,
    items,
    deliveryDestinationLat,
    deliveryDestinationLng,
  } = input;

  let deliveryFee: number | undefined;
  let deliveryDistanceKm: number | null | undefined;

  if (deliveryMethod === 'delivery') {
    const lat = deliveryDestinationLat;
    const lng = deliveryDestinationLng;
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { success: false, error: 'Elegí una dirección del buscador para calcular el envío.' };
    }
    const q = await quoteDeliveryForBranch(branchId, lat, lng);
    if (!q.ok) {
      return { success: false, error: q.error };
    }
    deliveryFee = q.feeARS;
    deliveryDistanceKm = q.distanceKm;
  }

  const base: BaseCreateOrderInput = {
    branchId,
    customerName,
    notes,
    deliveryMethod,
    address,
    paymentMethod,
    items,
    deliveryFee,
    deliveryDistanceKm,
  };

  const validationError = validateCreateOrderInput(base);
  if (validationError) return validationError;

  const result = await createOrderRecord(base);
  if (!result.success) return result;

  revalidatePath('/admin');
  revalidatePath('/admin/admin');
  revalidatePath('/admin/sucursal/[id]', 'page');

  return result;
}
