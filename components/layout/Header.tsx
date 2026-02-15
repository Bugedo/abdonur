import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-brand-800 text-white shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          🥟 Empanadas <span className="text-brand-300">Abdonur</span>
        </Link>
      </div>
    </header>
  );
}


