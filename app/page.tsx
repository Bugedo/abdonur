import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Branch } from '@/types';
import BranchCard from '@/components/ui/BranchCard';
import GoldDivider from '@/components/ui/GoldDivider';

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
      {/* Fixed home background */}
      <div className="fixed inset-0 -z-10 bg-black">
        <Image
          src="/images/familia/familia-abdonur.jpeg"
          alt="Familia Abdonur preparando empanadas árabes"
          fill
          priority
          className="object-contain opacity-95"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Hero on first paint */}
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-3xl font-bold tracking-[0.02em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)] sm:text-4xl md:text-5xl md:tracking-[0.04em]">
          Empanadas Árabes <span className="text-brand-500 drop-shadow-[0_0_20px_rgba(192,32,38,0.35)]">Abdonur</span>
        </h1>
        <p className="mt-3 max-w-md text-metallic-300 italic drop-shadow sm:text-lg">Simplemente excepcionales</p>
        <GoldDivider className="my-6 max-w-xs sm:max-w-md" />
        <p className="text-sm font-medium italic text-metallic-200 drop-shadow sm:text-base">Lejos... la mejor!!!</p>
        <p className="mt-4 max-w-lg text-sm text-[#e0e0e0]/95 drop-shadow sm:text-base">
          Más de 30 años de tradición familiar. La receta de la abuela Juana, hecha con amor.
        </p>
      </div>

      {/* Scrollable content over hero image */}
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 px-4 pb-16">
        {/* Branch list title */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-white sm:text-3xl">Elegí tu sucursal</h2>
          <GoldDivider className="mx-auto mt-4 max-w-xs" />
          <p className="mt-3 text-sm text-stone-400">Seleccioná la más cercana y hacé tu pedido</p>
        </div>

        {/* Branch list */}
        {orderedBranches.length > 0 ? (
          <div className="flex w-full max-w-2xl flex-col gap-4">
            {orderedBranches.map(({ branch, displayName }) => (
              <BranchCard key={branch.id} branch={branch} displayName={displayName} />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md rounded-xl border border-dashed border-metallic-500/35 bg-surface-800/90 p-12 text-center text-stone-500 backdrop-blur-md">
            <p>No hay sucursales disponibles en este momento.</p>
          </div>
        )}

        {/* Extra info */}
        <div className="max-w-md rounded-xl border border-metallic-500/30 bg-surface-800/90 p-5 text-center text-sm shadow-[inset_0_1px_0_rgba(212,175,55,0.08)] backdrop-blur-md">
          <p className="font-medium text-metallic-300">
            Venta por mayor y franquicia:{' '}
            <a href="tel:+543513224810" className="text-metallic-200 underline-offset-2 hover:underline">
              351 322 4810
            </a>
          </p>
          <p className="mt-2 text-xs text-stone-500">
            <a
              href="https://www.instagram.com/abdonurempanadasarabes/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-metallic-400 hover:text-metallic-300"
            >
              @abdonurempanadasarabes
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
