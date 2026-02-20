import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-red-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <span className="text-accent-600">ABDONUR</span>
          <span className="hidden text-sm font-medium text-stone-500 sm:inline">
            Empanadas Árabes
          </span>
        </Link>
        <span className="text-xs font-medium italic text-brand-500">Lejos... la mejor!!!</span>
      </div>
    </header>
  );
}
