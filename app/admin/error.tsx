'use client';

import Link from 'next/link';

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="text-6xl">⚠️</span>
      <h1 className="text-2xl font-extrabold text-white">Error en el panel</h1>
      <p className="max-w-sm text-stone-400">
        Ocurrió un error. Probá reintentar o volvé al login.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
        <Link
          href="/admin/login"
          className="rounded-xl border border-surface-500 px-6 py-3 font-bold text-stone-300 hover:bg-surface-700"
        >
          Ir al login
        </Link>
      </div>
    </section>
  );
}
