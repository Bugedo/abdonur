import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Branch } from '@/types';
import BranchCard from '@/components/ui/BranchCard';

export const revalidate = 60;

const branchDisplayConfig = [
  { slug: 'san-vicente', label: 'San Vicente' },
  { slug: 'alta-cordoba', label: 'Alta Córdoba' },
  { slug: 'nueva-cordoba', label: 'Nueva Córdoba' },
  { slug: 'alberdi', label: 'Alberdi' },
  { slug: 'marques', label: 'Marques' },
  { slug: 'pueyrredon', label: 'Pueyrredón' },
] as const;

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
  const orderedBranches = branchDisplayConfig.flatMap((config) => {
    const branch = branches.find((item) => item.slug === config.slug);
    return branch ? [{ branch, displayName: config.label }] : [];
  });

  return (
    <section className="relative">
      {/* Fondo fijo del home */}
      <div className="fixed inset-0 -z-10 bg-black">
        <Image
          src="/images/familia/familia-abdonur.jpg"
          alt="Familia Abdonur preparando empanadas árabes"
          fill
          priority
          className="object-contain opacity-95"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Hero visible al abrir */}
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-4 text-center">
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

      {/* Contenido que scrollea sobre la imagen */}
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 px-4 pb-16">
        {/* Título sucursales */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Elegí tu sucursal
          </h2>
          <p className="mt-2 text-stone-300">
            Seleccioná la más cercana y hacé tu pedido
          </p>
        </div>

        {/* Lista de sucursales */}
        {orderedBranches.length > 0 ? (
          <div className="flex w-full max-w-2xl flex-col gap-4">
            {orderedBranches.map(({ branch, displayName }) => (
              <BranchCard key={branch.id} branch={branch} displayName={displayName} />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md rounded-xl border border-dashed border-surface-500 bg-surface-800/95 p-12 text-center text-stone-500 backdrop-blur-sm">
            <p>No hay sucursales disponibles en este momento.</p>
          </div>
        )}

        {/* Info adicional */}
        <div className="max-w-md rounded-xl border border-surface-600 bg-surface-800/95 p-4 text-center text-sm backdrop-blur-sm">
          <p className="font-medium text-gold-400">📞 Venta por mayor y franquicia: 3513224810</p>
          <p className="mt-1 text-xs text-stone-400">@abdonurcomidasarabes</p>
        </div>
      </div>
    </section>
  );
}
