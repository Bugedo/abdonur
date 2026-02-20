'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="text-6xl">😵</span>
      <h1 className="text-2xl font-extrabold text-stone-900">Algo salió mal</h1>
      <p className="max-w-sm text-stone-500">
        Ocurrió un error inesperado. Por favor intentá de nuevo.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-xl bg-accent-600 px-6 py-3 font-bold text-white hover:bg-accent-700"
      >
        Reintentar
      </button>
    </section>
  );
}
