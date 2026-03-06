'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { OrderStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { TESTING_MODE } from '@/lib/adminTestingMode';
import { getAdminSession } from '@/lib/adminSession';

interface UpdateResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateResult> {
  if (!TESTING_MODE) {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'No autorizado.' };
    }

    if (session.role === 'branch_admin') {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('branch_id')
        .eq('id', orderId)
        .single();

      if (!order || order.branch_id !== session.branchId) {
        return { success: false, error: 'No podés modificar pedidos de otra sucursal.' };
      }
    }
  }

  if (TESTING_MODE) {
    const { data: exists } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single();

    if (!exists) {
      return { success: false, error: 'Pedido no encontrado.' };
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
