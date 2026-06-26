export default function Footer() {
  return (
    <footer className="mt-auto border-t border-metallic-500/30 bg-surface-900/95 py-8 text-center shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <p className="text-xs text-stone-500">
        © {new Date().getFullYear()} Todos los derechos reservados
      </p>
      <p className="mt-2 text-xs text-stone-400">
        Venta por mayor y franquicia:{' '}
        <a href="tel:+543513224810" className="font-medium text-metallic-400 hover:text-metallic-300">
          351 322 4810
        </a>
      </p>
      <p className="mt-1 text-xs text-stone-500">
        <a
          href="https://www.instagram.com/abdonurempanadasarabes/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-metallic-400 transition-colors hover:text-metallic-300"
        >
          @abdonurempanadasarabes
        </a>
      </p>
    </footer>
  );
}
