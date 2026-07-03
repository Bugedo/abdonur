import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import { Branch } from '@/types';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminStatsData, parseAdminStatsFilters } from '@/lib/adminStats';
import AdminStatsDashboard from '@/components/admin/AdminStatsDashboard';
import {
  getMergedPanelTitle,
  isNuevaCordobaMergedOperator,
  NUEVA_CORDOBA_SLUG,
} from '@/lib/adminOperationalScope';

async function getAllBranches(): Promise<Branch[]> {
  const { data } = await supabaseAdmin
    .from('branches')
    .select('*')
    .order('name', { ascending: true });
  return (data ?? []) as Branch[];
}

export default async function SuperAdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSuperAdmin();
  const query = await searchParams;
  const parsedFilters = parseAdminStatsFilters(query);

  const branches = await getAllBranches();
  const sanVicente = branches.find((b) => isNuevaCordobaMergedOperator(b.slug));
  const nuevaCordoba = branches.find((b) => b.slug === NUEVA_CORDOBA_SLUG);
  const visibleBranches = branches.filter((b) => b.slug !== NUEVA_CORDOBA_SLUG);

  const statsBranchIds =
    parsedFilters.branchId &&
    sanVicente &&
    nuevaCordoba &&
    (parsedFilters.branchId === sanVicente.id || parsedFilters.branchId === nuevaCordoba.id)
      ? [sanVicente.id, nuevaCordoba.id]
      : undefined;

  const filtersForView =
    parsedFilters.branchId &&
    sanVicente &&
    nuevaCordoba &&
    parsedFilters.branchId === nuevaCordoba.id
      ? { ...parsedFilters, branchId: sanVicente.id }
      : parsedFilters;

  const stats = await getAdminStatsData(filtersForView, {
    includeBranchRows: true,
    branchIds: statsBranchIds,
  });

  const mergedBranchRows = stats.branchRows
    ? (() => {
        if (!sanVicente || !nuevaCordoba) return stats.branchRows;
        const operator = stats.branchRows.find((r) => r.branchId === sanVicente.id);
        const nueva = stats.branchRows.find((r) => r.branchId === nuevaCordoba.id);
        const others = stats.branchRows.filter(
          (r) => r.branchId !== sanVicente.id && r.branchId !== nuevaCordoba.id
        );
        const merged = {
          branchId: sanVicente.id,
          branchName: getMergedPanelTitle(sanVicente.name),
          orders: (operator?.orders ?? 0) + (nueva?.orders ?? 0),
          sales: (operator?.sales ?? 0) + (nueva?.sales ?? 0),
        };
        return [merged, ...others];
      })()
    : undefined;

  const statsForView = { ...stats, branchRows: mergedBranchRows };

  return (
    <section className="py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/admin"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand-400"
        >
          ← Volver al panel de pedidos
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

      <div className="mt-4">
        <h1 className="text-2xl font-extrabold text-white">
          Estadísticas Generales <span className="text-brand-500">ABDONUR</span>
        </h1>
        <p className="text-sm text-stone-500">Visión consolidada separada por sucursal</p>
      </div>

      <AdminStatsDashboard
        title="Estadísticas globales"
        stats={statsForView}
        filters={filtersForView}
        branches={visibleBranches}
        showBranchFilter
      />
    </section>
  );
}
