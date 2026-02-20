import Link from 'next/link';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { Branch } from '@/types';

async function getAllBranches(): Promise<Branch[]> {
  const { data } = await supabaseAdmin
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  return (data ?? []) as Branch[];
}

export default async function AdminHubPage() {
  const branches = await getAllBranches();

  return (
    <section className="mx-auto max-w-3xl py-8">
      {/* Logo + título */}
      <div className="text-center">
        <Image
          src="/images/logo/abdonur-logo.jpg"
          alt="Abdonur"
          width={200}
          height={60}
          className="mx-auto h-12 w-auto"
        />
        <h1 className="mt-4 text-2xl font-extrabold text-white">Panel de Administración</h1>
        <p className="mt-1 text-sm text-stone-500">Seleccioná tu sucursal o accedé al panel general</p>
        <span className="mt-2 inline-block rounded-full bg-yellow-900/40 px-3 py-1 text-xs font-bold text-yellow-400">
          🧪 MODO TESTING — Sin autenticación
        </span>
      </div>

      {/* Super Admin */}
      <Link
        href="/admin/admin"
        className="mt-8 block rounded-2xl border border-brand-600 bg-brand-900/30 p-6 transition-all hover:bg-brand-900/50 hover:shadow-lg hover:shadow-brand-900/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-400">👑 Super Admin</h2>
            <p className="mt-1 text-sm text-stone-400">Ver todas las sucursales y pedidos</p>
          </div>
          <span className="text-sm font-bold text-brand-500">Acceder →</span>
        </div>
      </Link>

      {/* Sucursales */}
      <h2 className="mt-10 text-lg font-bold text-white">Sucursales</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            href={`/admin/sucursal/${branch.slug}`}
            className="block rounded-xl border border-surface-600 bg-surface-800 p-5 transition-all hover:border-brand-600 hover:shadow-lg hover:shadow-brand-900/20"
          >
            <h3 className="font-bold text-white">{branch.name}</h3>
            <p className="mt-1 text-xs text-stone-500">{branch.address}</p>
            <p className="mt-3 text-sm font-semibold text-brand-500">Ver pedidos →</p>
          </Link>
        ))}
      </div>

      {/* Login link (oculto pero disponible) */}
      <div className="mt-10 text-center">
        <Link
          href="/admin/login"
          className="text-xs text-stone-600 hover:text-stone-400"
        >
          Ir al login con credenciales →
        </Link>
      </div>
    </section>
  );
}
