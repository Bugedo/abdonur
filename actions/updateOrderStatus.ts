'use server';

import { createSupabaseServerClient } from '@/lib/supabaseAuthServer';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { OrderStatus } from '@/types';
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

  // Verificar que el admin pertenece a la sucursal del pedido
  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('branch_id')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    return { success: false, error: 'No tenés permisos de admin.' };
  }

  // Verificar que el pedido pertenece a la sucursal del admin
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('branch_id')
    .eq('id', orderId)
    .single();

  if (!order || order.branch_id !== adminUser.branch_id) {
    return { success: false, error: 'No podés modificar pedidos de otra sucursal.' };
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

  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/pedido/${orderId}`);

  return { success: true };
}

