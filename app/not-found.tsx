import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="text-6xl">🤷</span>
      <h1 className="text-2xl font-extrabold text-stone-900">Página no encontrada</h1>
      <p className="max-w-sm text-stone-500">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-accent-600 px-6 py-3 font-bold text-white hover:bg-accent-700"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
