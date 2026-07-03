import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdminSession } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import { getBranchByIdOrSlugAdmin } from '@/lib/branches';
import { getAdminStatsData, parseAdminStatsFilters } from '@/lib/adminStats';
import AdminStatsDashboard from '@/components/admin/AdminStatsDashboard';
import {
  canAccessMergedOperatorPanel,
  getMergedPanelTitle,
  getNuevaCordobaOperatorSlug,
  getOperationalBranchIdsForSession,
  isNuevaCordobaMergedOperator,
  NUEVA_CORDOBA_SLUG,
} from '@/lib/adminOperationalScope';

export default async function BranchAdminStatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const { id } = await params;
  const query = await searchParams;

  const branch = await getBranchByIdOrSlugAdmin(id);
  if (!branch) notFound();
  if (branch.slug === NUEVA_CORDOBA_SLUG) {
    redirect(`/admin/sucursal/${getNuevaCordobaOperatorSlug()}/estadisticas`);
  }

  let statsBranchIds = [branch.id];
  let branchPanelTitle = branch.name;

  if (isNuevaCordobaMergedOperator(branch.slug)) {
    const operationalIds = await getOperationalBranchIdsForSession({
      role: 'branch_admin',
      username: branch.name,
      branchId: branch.id,
      branchSlug: branch.slug,
    });
    statsBranchIds = operationalIds;
    if (operationalIds.length > 1) {
      branchPanelTitle = getMergedPanelTitle(branch.name);
    }
  }

  if (session.role === 'branch_admin' && !canAccessMergedOperatorPanel(session, branch.slug)) {
    notFound();
  }

  const filters = parseAdminStatsFilters(query, { branchId: branch.id });
  const stats = await getAdminStatsData(filters, { branchIds: statsBranchIds });

  return (
    <section className="py-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/sucursal/${branch.slug}`}
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
          Estadísticas - <span className="text-brand-500">{branchPanelTitle}</span>
        </h1>
        <p className="text-sm text-stone-500">Análisis de ventas y operación de la sucursal</p>
      </div>

      <AdminStatsDashboard
        title={`Estadísticas de ${branchPanelTitle}`}
        stats={stats}
        filters={filters}
      />
    </section>
  );
}
