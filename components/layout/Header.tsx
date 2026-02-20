import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-surface-600 bg-surface-900">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-3">
        <Link href="/">
          <Image
            src="/images/logo/abdonur-logo.jpg"
            alt="Empanadas Árabes Abdonur"
            width={280}
            height={80}
            className="h-14 w-auto object-contain sm:h-16"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
