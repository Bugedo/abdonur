import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Order, Branch, OrderItem } from '@/types';
import { requireAdminSession } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import BranchOrdersPanel from '@/components/admin/BranchOrdersPanel';

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

type OrderWithItems = Omit<Order, 'order_items'> & {
  order_items?: (OrderItem & { products?: { name: string } })[];
};

async function getBranchOrders(branchId: string): Promise<OrderWithItems[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error.message);
    return [];
  }
  return data ?? [];
}

// ── Page ──

export default async function BranchAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  const { id } = await params;

  const branch = await getBranch(id);
  if (!branch) notFound();

  if (session.role === 'branch_admin' && session.branchId !== branch.id) {
    notFound();
  }

  const orders = await getBranchOrders(branch.id);

  return (
    <section className="py-4">
      {/* Volver */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand-400"
        >
          ← Volver al panel
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-surface-500 px-3 py-1 text-xs font-semibold text-stone-300 hover:bg-surface-700"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Header */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            📊 <span className="text-brand-500">{branch.name}</span>
          </h1>
          <p className="text-sm text-stone-500">Panel de administración</p>
        </div>
      </div>

      {/* Info sucursal */}
      <div className="mt-4 rounded-xl border border-surface-600 bg-surface-800 p-4">
        <div className="flex flex-wrap gap-4 text-sm text-stone-400">
          <span>📍 {branch.address}</span>
          <span>🕐 {branch.opening_hours}</span>
          <span>💬 {branch.whatsapp_number}</span>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Pedidos</h2>
        <BranchOrdersPanel orders={orders} />
      </div>
    </section>
  );
}


