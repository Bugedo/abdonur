export default function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-600 bg-surface-900 py-6 text-center">
      <p className="text-sm font-bold text-brand-500">Empanadas Árabes Abdonur®</p>
      <p className="mt-1 text-xs italic text-gold-400">Simplemente excepcionales</p>
      <p className="mt-3 text-xs text-stone-500">
        © {new Date().getFullYear()} Todos los derechos reservados
      </p>
      <p className="mt-1 text-xs text-stone-500">
        📞 Venta por mayor y franquicia: 3513224810 · @abdonurcomidasarabes
      </p>
    </footer>
  );
}
