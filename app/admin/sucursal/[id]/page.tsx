import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { AdminOrderWithItems } from '@/types';
import { requireAdminSession } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import BranchOrdersPanel from '@/components/admin/BranchOrdersPanel';
import { getBranchByIdOrSlugAdmin } from '@/lib/branches';
import { getOperationalBranchIdsForSession } from '@/lib/adminOperationalScope';

// ── Helpers ──

async function getBranchOrders(branchIds: string[]): Promise<AdminOrderWithItems[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, branches(name), order_items(*, products(name))')
    .in('branch_id', branchIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error.message);
    return [];
  }
  return data ?? [];
}

// ── Page ──

export default async function BranchAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminSession();
  const { id } = await params;

  const branch = await getBranchByIdOrSlugAdmin(id);
  if (!branch) notFound();
  if (branch.slug === 'nueva-cordoba') {
    redirect('/admin/sucursal/alta-cordoba');
  }

  let branchIds = [branch.id];
  let branchPanelTitle = branch.name;
  let showOrderBranchName = false;

  if (branch.slug === 'alta-cordoba') {
    const operationalIds = await getOperationalBranchIdsForSession({
      role: 'branch_admin',
      username: branch.name,
      branchId: branch.id,
      branchSlug: branch.slug,
    });
    branchIds = operationalIds;
    if (operationalIds.length > 1) {
      branchPanelTitle = `${branch.name} + Nueva Córdoba`;
      showOrderBranchName = true;
    }
  }

  if (session.role === 'branch_admin') {
    const canAccessAltaMerged =
      branch.slug === 'alta-cordoba' &&
      (session.branchId === branch.id || session.branchSlug === 'nueva-cordoba');
    if (!canAccessAltaMerged && session.branchId !== branch.id) {
      notFound();
    }
  }

  const orders = await getBranchOrders(branchIds);

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
            📊 <span className="text-brand-500">{branchPanelTitle}</span>
          </h1>
          <p className="text-sm text-stone-500">Panel de administración</p>
        </div>
        <Link
          href={`/admin/sucursal/${branch.slug}/estadisticas`}
          className="rounded-lg border border-brand-600 bg-brand-900/30 px-3 py-2 text-xs font-semibold text-brand-300 hover:bg-brand-900/50"
        >
          Ver estadísticas
        </Link>
      </div>

      {/* Lista de pedidos */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Pedidos</h2>
        <BranchOrdersPanel orders={orders} showBranchName={showOrderBranchName} />
      </div>
    </section>
  );
}


