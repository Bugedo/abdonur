import Link from 'next/link';
import Image from 'next/image';
import GoldDivider from '@/components/ui/GoldDivider';

export default function Header() {
  return (
    <header className="border-b border-metallic-500/25 bg-surface-900/90 shadow-[0_4px_24px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-3">
        <Link href="/" className="transition-opacity hover:opacity-95">
          <Image
            src="/images/branding/abdonur-logo-horizontal.png"
            alt="Empanadas Árabes Abdonur"
            width={300}
            height={90}
            className="h-14 w-auto object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.15)] sm:h-[4.25rem]"
            priority
          />
        </Link>
      </div>
      <GoldDivider />
    </header>
  );
}
