import { supabase } from '@/lib/supabaseClient';
import { Branch } from '@/types';
import BranchCard from '@/components/ui/BranchCard';

export const revalidate = 60;

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
    <section className="flex flex-col items-center gap-10 py-8">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">
          Empanadas Árabes <span className="text-accent-600">Abdonur</span>
        </h1>
        <p className="mt-2 text-sm font-medium italic text-brand-500">
          Simplemente excepcionales
        </p>
        <p className="mt-4 max-w-md text-lg text-stone-600">
          Elegí tu sucursal más cercana y hacé tu pedido. Te lo preparamos al toque.
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
        <div className="w-full max-w-md rounded-xl border border-dashed border-stone-200 bg-stone-50 p-12 text-center text-stone-400">
          <p>No hay sucursales disponibles en este momento.</p>
        </div>
      )}

      {/* Info adicional */}
      <div className="max-w-md rounded-xl border border-brand-100 bg-brand-50 p-4 text-center text-sm text-brand-800">
        <p className="font-medium">📞 Venta por mayor y franquicia: 3513224810</p>
        <p className="mt-1 text-xs text-brand-600">@abdonurcomidasarabes</p>
      </div>
    </section>
  );
}
