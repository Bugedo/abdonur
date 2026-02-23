import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Order, Branch } from '@/types';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';

// ── Helpers ──

// Supports both slug (e.g. "san-vicente") and UUID lookups
async function getBranch(idOrSlug: string): Promise<Branch | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const column = isUuid ? 'id' : 'slug';

  const { data } = await supabaseAdmin
    .from('branches')
    .select('*')
    .eq(column, idOrSlug)
    .single();
  return data as Branch | null;
}

async function getBranchOrders(branchId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error.message);
    return [];
  }
  return data ?? [];
}

// ── Formatters ──

const formattedDate = (date: string) =>
  new Date(date).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

// ── Components ──

function StatsCards({ orders }: { orders: Order[] }) {
  const newOrders = orders.filter((o) => o.status === 'new');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="mt-6 grid grid-cols-3 gap-4">
      <div className="rounded-xl border border-yellow-800/40 bg-yellow-900/20 p-4 text-center">
        <p className="text-2xl font-extrabold text-yellow-400">{newOrders.length}</p>
        <p className="text-xs font-medium text-yellow-500">Nuevos</p>
      </div>
      <div className="rounded-xl border border-blue-800/40 bg-blue-900/20 p-4 text-center">
        <p className="text-2xl font-extrabold text-blue-400">{confirmedOrders.length}</p>
        <p className="text-xs font-medium text-blue-500">Confirmados</p>
      </div>
      <div className="rounded-xl border border-green-800/40 bg-green-900/20 p-4 text-center">
        <p className="text-2xl font-extrabold text-green-400">{completedOrders.length}</p>
        <p className="text-xs font-medium text-green-500">Finalizados</p>
      </div>
    </div>
  );
}

// ── Page ──

export default async function BranchAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const branch = await getBranch(id);
  if (!branch) notFound();

  const orders = await getBranchOrders(branch.id);

  return (
    <section className="py-4">
      {/* Volver */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand-400"
      >
        ← Volver al panel
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            📊 <span className="text-brand-500">{branch.name}</span>
          </h1>
          <p className="text-sm text-stone-500">Panel de administración</p>
        </div>
        <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-xs font-bold text-yellow-400">
          🧪 TESTING
        </span>
      </div>

      {/* Info sucursal */}
      <div className="mt-4 rounded-xl border border-surface-600 bg-surface-800 p-4">
        <div className="flex flex-wrap gap-4 text-sm text-stone-400">
          <span>📍 {branch.address}</span>
          <span>🕐 {branch.opening_hours}</span>
          <span>💬 {branch.whatsapp_number}</span>
        </div>
      </div>

      {/* Stats */}
      <StatsCards orders={orders} />

      {/* Lista de pedidos */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Pedidos</h2>

        {orders.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-surface-500 bg-surface-800 p-12 text-center text-stone-500">
            <p>No hay pedidos todavía.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedido/${order.id}`}
                className="block rounded-xl border border-surface-600 bg-surface-800 p-4 transition-all hover:border-brand-600 hover:shadow-lg hover:shadow-brand-900/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{order.customer_name}</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      #{order.id.slice(0, 8).toUpperCase()} · {formattedDate(order.created_at)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {order.delivery_method === 'delivery' ? '🛵 Envío' : '🏪 Retiro'}
                      {' · '}
                      {order.payment_method === 'cash' ? '💵 Efectivo' : '📱 Transferencia'}
                    </p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="mt-1 text-sm font-bold text-white">{formatPrice(order.total_price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


