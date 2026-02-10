import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabaseAuthServer';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Order } from '@/types';
import { logout } from '@/actions/auth';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';

async function getAdminBranch(userId: string) {
  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('branch_id, branches(id, name)')
    .eq('user_id', userId)
    .single();
  return data;
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

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const adminData = await getAdminBranch(user.id);

  if (!adminData) {
    return (
      <section className="py-12 text-center">
        <p className="text-stone-500">Tu cuenta no está vinculada a ninguna sucursal.</p>
        <form action={logout} className="mt-4">
          <button className="text-sm text-brand-600 hover:underline">Cerrar sesión</button>
        </form>
      </section>
    );
  }

  const branch = adminData.branches as unknown as { id: string; name: string };
  const orders = await getBranchOrders(adminData.branch_id);

  const newOrders = orders.filter((o) => o.status === 'new');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled');

  const formattedDate = (date: string) =>
    new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">📊 Panel Admin</h1>
          <p className="text-sm text-stone-500">{branch.name}</p>
        </div>
        <form action={logout}>
          <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100">
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-2xl font-extrabold text-yellow-700">{newOrders.length}</p>
          <p className="text-xs font-medium text-yellow-600">Nuevos</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-2xl font-extrabold text-blue-700">{confirmedOrders.length}</p>
          <p className="text-xs font-medium text-blue-600">Confirmados</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-extrabold text-green-700">{completedOrders.length}</p>
          <p className="text-xs font-medium text-green-600">Finalizados</p>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-stone-900">Pedidos</h2>

        {orders.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center text-stone-400">
            <p>No hay pedidos todavía.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedido/${order.id}`}
                className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {order.customer_name}
                    </p>
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
                    <p className="mt-1 text-sm font-bold text-stone-900">
                      {formatPrice(order.total_price)}
                    </p>
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
