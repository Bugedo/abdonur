import { supabase } from '@/lib/supabaseClient';
import { Branch } from '@/types';
import BranchCard from '@/components/ui/BranchCard';

export const revalidate = 60; // Revalidar cada 60 segundos

async function getBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching branches:', error.message);
    return [];
  }

  return data ?? [];
}

export default async function HomePage() {
  const branches = await getBranches();

  return (
    <section className="flex flex-col items-center gap-8 py-8">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-stone-900">
          🥟 Hacé tu pedido
        </h1>
        <p className="mt-3 max-w-md text-lg text-stone-600">
          Elegí tu sucursal más cercana y armá tu pedido. Te lo preparamos al toque.
        </p>
      </div>

      {/* Grid de sucursales */}
      {branches.length > 0 ? (
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      ) : (
        <div className="w-full max-w-md rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center text-stone-400">
          <p>No hay sucursales disponibles en este momento.</p>
        </div>
      )}
    </section>
  );
}
