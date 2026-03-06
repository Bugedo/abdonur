import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { AdminOrderWithItems } from '@/types';
import { requireAdminSession } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import BranchOrdersPanel from '@/components/admin/BranchOrdersPanel';
import { getBranchByIdOrSlugAdmin } from '@/lib/branches';

// ── Helpers ──

async function getBranchOrders(branchId: string): Promise<AdminOrderWithItems[]> {
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

  const branch = await getBranchByIdOrSlugAdmin(id);
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

      {/* Lista de pedidos */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Pedidos</h2>
        <BranchOrdersPanel orders={orders} />
      </div>
    </section>
  );
}


