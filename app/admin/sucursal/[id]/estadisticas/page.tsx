import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdminSession } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import { getBranchByIdOrSlugAdmin } from '@/lib/branches';
import { getAdminStatsData, parseAdminStatsFilters } from '@/lib/adminStats';
import AdminStatsDashboard from '@/components/admin/AdminStatsDashboard';
import { getOperationalBranchIdsForSession } from '@/lib/adminOperationalScope';

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
  if (branch.slug === 'nueva-cordoba') {
    redirect('/admin/sucursal/alta-cordoba/estadisticas');
  }

  let statsBranchIds = [branch.id];
  let branchPanelTitle = branch.name;

  if (branch.slug === 'alta-cordoba') {
    const operationalIds = await getOperationalBranchIdsForSession({
      role: 'branch_admin',
      username: branch.name,
      branchId: branch.id,
      branchSlug: branch.slug,
    });
    statsBranchIds = operationalIds;
    if (operationalIds.length > 1) {
      branchPanelTitle = `${branch.name} + Nueva Córdoba`;
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
          📈 Estadísticas - <span className="text-brand-500">{branchPanelTitle}</span>
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
