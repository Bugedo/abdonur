import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Order, OrderItem } from '@/types';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import OrderActions from '@/components/admin/OrderActions';
import { requireAdminSession } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import { canOperateOrderBranch } from '@/lib/adminOperationalScope';

async function getOrderWithItems(orderId: string) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*, branches(name)')
    .eq('id', orderId)
    .single();

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
  const session = await requireAdminSession();
  const { id } = await params;

  const result = await getOrderWithItems(id);
  if (!result) notFound();

  const { order, items } = result;

  if (session.role === 'branch_admin') {
    const allowed = await canOperateOrderBranch(session, order.branch_id);
    if (!allowed) notFound();
  }

  const formattedDate = new Date(order.created_at).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  const itemsSubtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const deliveryFeeNum = Number(order.delivery_fee ?? 0);

  return (
    <section className="mx-auto max-w-2xl py-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand-400"
      >
        ← Volver al panel
      </Link>
      <form action={logout} className="mt-3">
        <button
          type="submit"
          className="rounded-lg border border-surface-500 px-3 py-1 text-xs font-semibold text-stone-300 hover:bg-surface-700"
        >
          Cerrar sesión
        </button>
      </form>

      <div className="mt-6 space-y-6">
        {/* Header del pedido */}
        <div className="rounded-xl border border-surface-600 bg-surface-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white">{order.customer_name}</h1>
              <p className="mt-1 text-sm text-stone-500">
                #{order.id.slice(0, 8).toUpperCase()} · {formattedDate}
              </p>
              {order.branches?.name && (
                <p className="mt-1 text-sm font-medium text-brand-400">
                  🏪 {order.branches.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          {/* Info de entrega y pago */}
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-stone-300">
              <span className="font-medium text-stone-400">Entrega:</span>{' '}
              {order.delivery_method === 'delivery' ? '🛵 Envío a domicilio' : '🏪 Retiro en local'}
            </p>
            {order.delivery_method === 'delivery' && order.address && (
              <p className="text-stone-300">
                <span className="font-medium text-stone-400">Dirección:</span> 📍 {order.address}
              </p>
            )}
            {order.delivery_method === 'delivery' && deliveryFeeNum > 0 && (
              <p className="text-stone-300">
                <span className="font-medium text-stone-400">Envío:</span>{' '}
                {formatPrice(deliveryFeeNum)}
                {order.delivery_distance_km != null && (
                  <span className="text-stone-500">
                    {' '}(~{Number(order.delivery_distance_km).toFixed(1)} km geodésicos)
                  </span>
                )}
              </p>
            )}
            <p className="text-stone-300">
              <span className="font-medium text-stone-400">Pago:</span>{' '}
              {order.payment_method === 'cash' ? '💵 Efectivo' : '📱 Transferencia / MP'}
            </p>
            {order.notes && (
              <p className="text-stone-300">
                <span className="font-medium text-stone-400">Observaciones:</span> 📝 {order.notes}
              </p>
            )}
            {order.status === 'cancelled' && (
              <div className="mt-2 rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-200">
                <p className="font-medium text-red-300">Pedido cancelado</p>
                {order.cancelled_at && (
                  <p className="mt-1 text-red-200/90">
                    {new Date(order.cancelled_at).toLocaleString('es-AR', {
                      timeZone: 'America/Argentina/Buenos_Aires',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                {order.cancellation_reason && (
                  <p className="mt-1">
                    <span className="font-medium text-red-300">Motivo:</span> {order.cancellation_reason}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Items del pedido */}
        <div className="rounded-xl border border-surface-600 bg-surface-800 p-6">
          <h2 className="text-lg font-bold text-white">Detalle del pedido</h2>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-stone-300">
                  {item.quantity}x {item.products?.name ?? 'Producto'}
                </span>
                <span className="font-medium text-white">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-surface-600 pt-4">
            {deliveryFeeNum > 0 && (
              <>
                <div className="flex justify-between text-sm text-stone-400">
                  <span>Subtotal productos</span>
                  <span>{formatPrice(itemsSubtotal)}</span>
                </div>
                {order.delivery_method === 'delivery' && (
                  <div className="flex justify-between text-sm text-stone-400">
                    <span>
                      Envío
                      {order.delivery_distance_km != null && (
                        <span className="text-stone-500">
                          {' '}(~{Number(order.delivery_distance_km).toFixed(1)} km)
                        </span>
                      )}
                    </span>
                    <span>{formatPrice(deliveryFeeNum)}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-xl font-extrabold text-brand-500">
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
