import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AdminCreateOrderForm from '@/components/admin/AdminCreateOrderForm';
import { requireAdminSession } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import { getBranchByIdOrSlugAdmin } from '@/lib/branches';
import { getActiveProducts, getBranchOptionsForSession } from '@/lib/adminCreateOrderPage';
import {
  canAccessMergedOperatorPanel,
  getNuevaCordobaOperatorSlug,
  NUEVA_CORDOBA_SLUG,
} from '@/lib/adminOperationalScope';

export default async function BranchCreateOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminSession();
  const { id } = await params;

  const branch = await getBranchByIdOrSlugAdmin(id);
  if (!branch) notFound();
  if (branch.slug === NUEVA_CORDOBA_SLUG) {
    redirect(`/admin/sucursal/${getNuevaCordobaOperatorSlug()}/crear-pedido`);
  }

  if (session.role === 'branch_admin' && !canAccessMergedOperatorPanel(session, branch.slug)) {
    notFound();
  }

  const [products, branchOptions] = await Promise.all([
    getActiveProducts(),
    getBranchOptionsForSession(session, branch),
  ]);

  const defaultBranchId =
    branchOptions.find((option) => option.id === branch.id)?.id ?? branchOptions[0]?.id ?? branch.id;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/sucursal/${branch.slug}`}
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

      <div className="mt-4">
        <h1 className="text-2xl font-extrabold text-white">
          + <span className="text-brand-500">Crear pedido manual</span>
        </h1>
        <p className="text-sm text-stone-500">
          Registrá pedidos por teléfono o mostrador en {branch.name}
        </p>
      </div>

      <AdminCreateOrderForm
        products={products}
        branchOptions={branchOptions}
        defaultBranchId={defaultBranchId}
        panelSlug={branch.slug}
        cancelHref={`/admin/sucursal/${branch.slug}`}
      />
    </section>
  );
}
