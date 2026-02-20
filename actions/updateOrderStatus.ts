'use server';

import { createSupabaseServerClient } from '@/lib/supabaseAuthServer';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { OrderStatus, AdminRole } from '@/types';
import { revalidatePath } from 'next/cache';

interface UpdateResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateResult> {
  // Verificar que el usuario está autenticado
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autorizado.' };
  }

  // Obtener info del admin
  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('branch_id, role')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    return { success: false, error: 'No tenés permisos de admin.' };
  }

  const { role, branch_id } = adminUser as { branch_id: string | null; role: AdminRole };

  // Super admin puede actualizar cualquier pedido
  // Branch admin solo puede actualizar pedidos de su sucursal
  if (role === 'branch_admin') {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('branch_id')
      .eq('id', orderId)
      .single();

    if (!order || order.branch_id !== branch_id) {
      return { success: false, error: 'No podés modificar pedidos de otra sucursal.' };
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
  revalidatePath(`/admin/pedido/${orderId}`);

  return { success: true };
}
