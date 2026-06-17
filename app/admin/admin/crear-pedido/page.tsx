import Link from 'next/link';
import AdminCreateOrderForm from '@/components/admin/AdminCreateOrderForm';
import { requireSuperAdmin } from '@/lib/adminSession';
import { logout } from '@/actions/auth';
import { getActiveProducts, getAllActiveBranchOptions } from '@/lib/adminCreateOrderPage';

export default async function SuperAdminCreateOrderPage() {
  await requireSuperAdmin();

  const [products, branchOptions] = await Promise.all([
    getActiveProducts(),
    getAllActiveBranchOptions(),
  ]);

  const defaultBranchId = branchOptions[0]?.id ?? '';

  return (
    <section className="py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/admin"
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
        <p className="text-sm text-stone-500">Registrá un pedido para cualquier sucursal</p>
      </div>

      <AdminCreateOrderForm
        products={products}
        branchOptions={branchOptions}
        defaultBranchId={defaultBranchId}
        panelSlug="admin"
        cancelHref="/admin/admin"
      />
    </section>
  );
}
