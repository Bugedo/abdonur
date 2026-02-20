import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabaseAuthServer';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Order, AdminRole, Branch } from '@/types';
import { logout } from '@/actions/auth';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';

// ── Helpers ──

async function getAdminInfo(userId: string) {
  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('branch_id, role')
    .eq('user_id', userId)
    .single();
  return data as { branch_id: string | null; role: AdminRole } | null;
}

async function getBranch(branchId: string) {
  const { data } = await supabaseAdmin
    .from('branches')
    .select('id, name')
    .eq('id', branchId)
    .single();
  return data as { id: string; name: string } | null;
}

async function getAllBranches(): Promise<Branch[]> {
  const { data } = await supabaseAdmin
    .from('branches')
    .select('*')
    .order('name', { ascending: true });
  return (data ?? []) as Branch[];
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

async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, branches(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error.message);
    return [];
  }
  return data ?? [];
}

// ── Shared formatters ──

const formattedDate = (date: string) =>
  new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

// ── Shared components ──

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

function OrderCard({ order, showBranch = false }: { order: Order & { branches?: { name: string } }; showBranch?: boolean }) {
  return (
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
          {showBranch && order.branches?.name && (
            <p className="mt-0.5 text-xs font-medium text-brand-400">
              🏪 {order.branches.name}
            </p>
          )}
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
  );
}

function OrderList({ orders, showBranch = false }: { orders: Order[]; showBranch?: boolean }) {
  if (orders.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-surface-500 bg-surface-800 p-12 text-center text-stone-500">
        <p>No hay pedidos todavía.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} showBranch={showBranch} />
      ))}
    </div>
  );
}

// ── Main page ──

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const adminInfo = await getAdminInfo(user.id);

  if (!adminInfo) {
    return (
      <section className="py-12 text-center">
        <p className="text-stone-500">Tu cuenta no está vinculada a ninguna sucursal.</p>
        <form action={logout} className="mt-4">
          <button className="text-sm text-brand-400 hover:underline">Cerrar sesión</button>
        </form>
      </section>
    );
  }

  // ─── SUPER ADMIN ───
  if (adminInfo.role === 'super_admin') {
    const [allOrders, allBranches] = await Promise.all([
      getAllOrders(),
      getAllBranches(),
    ]);

    return (
      <section className="py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              👑 Panel General <span className="text-brand-500">ABDONUR</span>
            </h1>
            <p className="text-sm text-stone-500">Todas las sucursales</p>
          </div>
          <form action={logout}>
            <button className="rounded-lg border border-surface-500 px-4 py-2 text-sm font-medium text-stone-400 hover:bg-surface-700">
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Stats globales */}
        <StatsCards orders={allOrders} />

        {/* Resumen por sucursal */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white">Sucursales</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allBranches.map((branch) => {
              const branchOrders = allOrders.filter((o) => o.branch_id === branch.id);
              const newCount = branchOrders.filter((o) => o.status === 'new').length;
              return (
                <div
                  key={branch.id}
                  className="rounded-xl border border-surface-600 bg-surface-800 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white">{branch.name}</h3>
                      <p className="mt-1 text-xs text-stone-500">{branch.address}</p>
                    </div>
                    {newCount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-yellow-900/40 px-2.5 py-0.5 text-xs font-bold text-yellow-400">
                        {newCount} nuevo{newCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-stone-400">
                    {branchOrders.length} pedido{branchOrders.length !== 1 ? 's' : ''} totales
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Todos los pedidos */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white">Todos los pedidos</h2>
          <OrderList orders={allOrders} showBranch />
        </div>
      </section>
    );
  }

  // ─── BRANCH ADMIN ───
  const branch = await getBranch(adminInfo.branch_id!);
  if (!branch) {
    return (
      <section className="py-12 text-center">
        <p className="text-stone-500">Sucursal no encontrada.</p>
        <form action={logout} className="mt-4">
          <button className="text-sm text-brand-400 hover:underline">Cerrar sesión</button>
        </form>
      </section>
    );
  }

  const orders = await getBranchOrders(adminInfo.branch_id!);

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            📊 <span className="text-brand-500">{branch.name}</span>
          </h1>
          <p className="text-sm text-stone-500">Panel de administración</p>
        </div>
        <form action={logout}>
          <button className="rounded-lg border border-surface-500 px-4 py-2 text-sm font-medium text-stone-400 hover:bg-surface-700">
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Stats */}
      <StatsCards orders={orders} />

      {/* Lista de pedidos */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Pedidos</h2>
        <OrderList orders={orders} />
      </div>
    </section>
  );
}
