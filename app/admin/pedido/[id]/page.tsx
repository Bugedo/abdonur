import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabaseAuthServer';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Order, OrderItem, AdminRole } from '@/types';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import OrderActions from '@/components/admin/OrderActions';

async function getAdminInfo(userId: string) {
  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('branch_id, role')
    .eq('user_id', userId)
    .single();
  return data as { branch_id: string | null; role: AdminRole } | null;
}

async function getOrderWithItems(orderId: string, branchId: string | null) {
  let query = supabaseAdmin
    .from('orders')
    .select('*, branches(name)')
    .eq('id', orderId);

  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  const { data: order, error: orderError } = await query.single();

  if (orderError || !order) return null;

  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('*, products(name)')
    .eq('order_id', orderId);

  return {
    order: order as Order & { branches?: { name: string } },
    items: (items ?? []) as (OrderItem & { products: { name: string } })[],
  };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const adminInfo = await getAdminInfo(user.id);
  if (!adminInfo) redirect('/admin/login');

  const isSuperAdmin = adminInfo.role === 'super_admin';

  const result = await getOrderWithItems(id, isSuperAdmin ? null : adminInfo.branch_id);
  if (!result) notFound();

  const { order, items } = result;

  const formattedDate = new Date(order.created_at).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  return (
    <section className="mx-auto max-w-2xl py-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-accent-600"
      >
        ← Volver al panel
      </Link>

      <div className="mt-6 space-y-6">
        {/* Header del pedido */}
        <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900">{order.customer_name}</h1>
              <p className="mt-1 text-sm text-stone-500">
                #{order.id.slice(0, 8).toUpperCase()} · {formattedDate}
              </p>
              {isSuperAdmin && order.branches?.name && (
                <p className="mt-1 text-sm font-medium text-brand-600">
                  🏪 {order.branches.name}
                </p>
              )}
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Info de entrega y pago */}
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-stone-700">
              <span className="font-medium">Entrega:</span>{' '}
              {order.delivery_method === 'delivery' ? '🛵 Envío a domicilio' : '🏪 Retiro en local'}
            </p>
            {order.delivery_method === 'delivery' && order.address && (
              <p className="text-stone-700">
                <span className="font-medium">Dirección:</span> 📍 {order.address}
              </p>
            )}
            <p className="text-stone-700">
              <span className="font-medium">Pago:</span>{' '}
              {order.payment_method === 'cash' ? '💵 Efectivo' : '📱 Transferencia / MP'}
            </p>
            {order.notes && (
              <p className="text-stone-700">
                <span className="font-medium">Observaciones:</span> 📝 {order.notes}
              </p>
            )}
          </div>
        </div>

        {/* Items del pedido */}
        <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">Detalle del pedido</h2>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-stone-700">
                  {item.quantity}x {item.products?.name ?? 'Producto'}
                </span>
                <span className="font-medium text-stone-900">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-stone-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-stone-900">Total</span>
              <span className="text-xl font-extrabold text-accent-600">
                {formatPrice(order.total_price)}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <OrderActions orderId={order.id} currentStatus={order.status} />
      </div>
    </section>
  );
}
