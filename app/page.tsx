import Image from 'next/image';
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
    <section className="flex flex-col items-center gap-12">
      {/* Hero con imagen de la familia */}
      <div className="relative w-full overflow-hidden rounded-2xl">
        <Image
          src="/images/familia/familia-abdonur.jpg"
          alt="Familia Abdonur preparando empanadas árabes"
          width={1200}
          height={500}
          className="h-64 w-full object-cover brightness-75 sm:h-80 md:h-96"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 px-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
            Empanadas Árabes <span className="text-brand-500">Abdonur</span>
          </h1>
          <p className="mt-2 text-sm font-medium italic text-gold-400 drop-shadow sm:text-base">
            Lejos... la mejor!!!
          </p>
          <p className="mt-4 max-w-lg text-sm text-stone-200 drop-shadow sm:text-base">
            Más de 30 años de tradición familiar. La receta de la abuela Juana, hecha con amor.
          </p>
        </div>
      </div>

      {/* Título sucursales */}
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          Elegí tu sucursal
        </h2>
        <p className="mt-2 text-stone-400">
          Seleccioná la más cercana y hacé tu pedido
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
        <div className="w-full max-w-md rounded-xl border border-dashed border-surface-500 bg-surface-800 p-12 text-center text-stone-500">
          <p>No hay sucursales disponibles en este momento.</p>
        </div>
      )}

      {/* Info adicional */}
      <div className="max-w-md rounded-xl border border-surface-600 bg-surface-800 p-4 text-center text-sm">
        <p className="font-medium text-gold-400">📞 Venta por mayor y franquicia: 3513224810</p>
        <p className="mt-1 text-xs text-stone-500">@abdonurcomidasarabes</p>
      </div>
    </section>
  );
}
