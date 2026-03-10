import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import { Branch } from '@/types';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminStatsData, parseAdminStatsFilters } from '@/lib/adminStats';
import AdminStatsDashboard from '@/components/admin/AdminStatsDashboard';

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
  const filters = parseAdminStatsFilters(query);

  const [branches, stats] = await Promise.all([
    getAllBranches(),
    getAdminStatsData(filters, { includeBranchRows: true }),
  ]);

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
          👑 Estadísticas Generales <span className="text-brand-500">ABDONUR</span>
        </h1>
        <p className="text-sm text-stone-500">Visión consolidada separada por sucursal</p>
      </div>

      <AdminStatsDashboard
        title="Estadísticas globales"
        stats={stats}
        filters={filters}
        branches={branches}
        showBranchFilter
      />
    </section>
  );
}
