import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Branch, AdminOrderWithItems } from '@/types';
import { requireSuperAdmin } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import BranchOrdersPanel from '@/components/admin/BranchOrdersPanel';

// ── Helpers ──

async function getAllBranches(): Promise<Branch[]> {
  const { data } = await supabaseAdmin
    .from('branches')
    .select('*')
    .order('name', { ascending: true });
  return (data ?? []) as Branch[];
}

async function getAllOrders(): Promise<AdminOrderWithItems[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, branches(name), order_items(*, products(name))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error.message);
    return [];
  }
  return data ?? [];
}

// ── Page ──

export default async function SuperAdminPage() {
  await requireSuperAdmin();

  const [allOrders, allBranches] = await Promise.all([
    getAllOrders(),
    getAllBranches(),
  ]);

  const altaCordoba = allBranches.find((b) => b.slug === 'alta-cordoba');
  const nuevaCordoba = allBranches.find((b) => b.slug === 'nueva-cordoba');
  const visibleBranches = allBranches.filter((b) => b.slug !== 'nueva-cordoba');

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
            👑 Panel General <span className="text-brand-500">ABDONUR</span>
          </h1>
          <p className="text-sm text-stone-500">Todas las sucursales</p>
        </div>
        <Link
          href="/admin/admin/estadisticas"
          className="rounded-lg border border-brand-600 bg-brand-900/30 px-3 py-2 text-xs font-semibold text-brand-300 hover:bg-brand-900/50"
        >
          Ver estadísticas
        </Link>
      </div>

      {/* Resumen por sucursal */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Sucursales</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleBranches.map((branch) => {
            const isAltaMergedCard = branch.slug === 'alta-cordoba' && altaCordoba && nuevaCordoba;
            const branchOrders = isAltaMergedCard
              ? allOrders.filter((o) => o.branch_id === altaCordoba.id || o.branch_id === nuevaCordoba.id)
              : allOrders.filter((o) => o.branch_id === branch.id);
            const newCount = branchOrders.filter((o) => o.status === 'new').length;
            return (
              <Link
                key={branch.id}
                href={`/admin/sucursal/${branch.slug}`}
                className="rounded-xl border border-surface-600 bg-surface-800 p-5 transition-all hover:border-brand-600"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">
                      {isAltaMergedCard ? `${branch.name} + Nueva Córdoba` : branch.name}
                    </h3>
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
              </Link>
            );
          })}
        </div>
      </div>

      {/* Todos los pedidos */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white">Todos los pedidos</h2>
        <BranchOrdersPanel orders={allOrders} showBranchName />
      </div>
    </section>
  );
}


