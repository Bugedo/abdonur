import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabaseAuthServer';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Order, OrderItem } from '@/types';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import OrderActions from '@/components/admin/OrderActions';

async function getOrderWithItems(orderId: string, branchId: string) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('branch_id', branchId)
    .single();

  if (orderError || !order) return null;

  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('*, products(name)')
    .eq('order_id', orderId);

  return { order: order as Order, items: (items ?? []) as (OrderItem & { products: { name: string } })[] };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // Verificar admin y obtener branch
  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('branch_id')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) redirect('/admin/login');

  const result = await getOrderWithItems(id, adminUser.branch_id);
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
        href="/admin/dashboard"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        ← Volver al dashboard
      </Link>

      <div className="mt-6 space-y-6">
        {/* Header del pedido */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900">{order.customer_name}</h1>
              <p className="mt-1 text-sm text-stone-500">
                #{order.id.slice(0, 8).toUpperCase()} · {formattedDate}
              </p>
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
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
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
              <span className="text-xl font-extrabold text-brand-700">
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
