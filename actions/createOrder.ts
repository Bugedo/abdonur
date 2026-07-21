'use server';

import { validateCreateOrderInput, createOrderRecord, type BaseCreateOrderInput } from '@/lib/orderCreation';
import { CartItem, DeliveryMethod, PaymentMethod } from '@/types';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseServer';
import {
  getBranchClosedCustomerMessage,
  isBranchOpenNow,
} from '@/lib/branchOpenStatus';

export interface CreateOrderInput {
  branchId: string;
  customerName: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
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
  const { branchId, customerName, notes, deliveryMethod, address, paymentMethod, items } = input;

  const { data: branch, error: branchError } = await supabaseAdmin
    .from('branches')
    .select('opening_hours')
    .eq('id', branchId)
    .single();

  if (branchError || !branch) {
    return { success: false, error: 'Sucursal no encontrada.' };
  }

  if (!isBranchOpenNow(branch.opening_hours)) {
    return {
      success: false,
      error: getBranchClosedCustomerMessage(branch.opening_hours),
    };
  }

  const base: BaseCreateOrderInput = {
    branchId,
    customerName,
    notes,
    deliveryMethod,
    address,
    paymentMethod,
    items,
    deliveryFee: deliveryMethod === 'delivery' ? 0 : undefined,
    deliveryDistanceKm: deliveryMethod === 'delivery' ? null : undefined,
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
