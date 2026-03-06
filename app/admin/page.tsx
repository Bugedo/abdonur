import Image from 'next/image';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { getAdminSession } from '@/lib/adminSession';

export default async function AdminHubPage() {
  const session = await getAdminSession();

  if (session?.role === 'super_admin') {
    redirect('/admin/admin');
  }
  if (session?.role === 'branch_admin') {
    redirect(`/admin/sucursal/${session.branchSlug}`);
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-surface-600 bg-surface-800 p-8">
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/logo/abdonur-logo.jpg"
            alt="Abdonur"
            width={200}
            height={60}
            className="h-10 w-auto"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Panel de Administración</h1>
        <p className="mt-1 text-sm text-stone-500">
          Ingresá con tu usuario de sucursal o con superadmin.
        </p>
        <AdminLoginForm />
      </div>
    </section>
  );
}
