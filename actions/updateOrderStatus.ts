'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { OrderStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { TESTING_MODE } from '@/lib/adminTestingMode';
import { getAdminSession } from '@/lib/adminSession';
import { canTransitionStatus } from '@/lib/orderStatusWorkflow';
import { canOperateOrderBranch } from '@/lib/adminOperationalScope';

interface UpdateResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateResult> {
  const { data: targetOrder } = await supabaseAdmin
    .from('orders')
    .select('id, branch_id, status')
    .eq('id', orderId)
    .single();

  if (!targetOrder) {
    return { success: false, error: 'Pedido no encontrado.' };
  }

  if (!canTransitionStatus(targetOrder.status as OrderStatus, newStatus)) {
    return { success: false, error: 'Cambio de estado no permitido para este pedido.' };
  }

  if (!TESTING_MODE) {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'No autorizado.' };
    }

    if (session.role === 'branch_admin') {
      const allowed = await canOperateOrderBranch(session, targetOrder.branch_id);
      if (!allowed) {
        return { success: false, error: 'No podés modificar pedidos de otra sucursal.' };
      }
    }
  }

  // Actualizar estado
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error.message);
    return { success: false, error: 'Error al actualizar el pedido.' };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/admin');
  revalidatePath('/admin/sucursal');
  revalidatePath(`/admin/pedido/${orderId}`);

  return { success: true };
}
