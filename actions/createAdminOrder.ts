'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/adminSession';
import { getOperationalBranchIdsForSession } from '@/lib/adminOperationalScope';
import { BaseCreateOrderInput, createOrderRecord, CreateOrderResult, validateCreateOrderInput } from '@/lib/orderCreation';

export interface CreateAdminOrderInput extends BaseCreateOrderInput {}

export async function createAdminOrder(input: CreateAdminOrderInput): Promise<CreateOrderResult> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: 'No autorizado.' };
  }

  if (session.role === 'branch_admin') {
    const operationalBranchIds = await getOperationalBranchIdsForSession(session);
    if (!operationalBranchIds.includes(input.branchId)) {
      return { success: false, error: 'No podés crear pedidos para otra sucursal.' };
    }
  }

  const validationError = validateCreateOrderInput(input);
  if (validationError) return validationError;

  const result = await createOrderRecord(input);
  if (!result.success) return result;

  revalidatePath('/admin');
  revalidatePath('/admin/admin');
  revalidatePath('/admin/sucursal/[id]', 'page');
  revalidatePath('/admin/sucursal/[id]/crear-pedido', 'page');
  revalidatePath('/admin/admin/crear-pedido', 'page');
  revalidatePath('/admin/pedido/[id]', 'page');

  return result;
}
