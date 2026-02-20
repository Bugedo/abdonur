export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-100 bg-stone-50 py-6 text-center text-sm text-stone-500">
      <p className="font-medium text-accent-600">Empanadas Árabes Abdonur®</p>
      <p className="mt-1 text-xs italic text-stone-400">Simplemente excepcionales</p>
      <p className="mt-2 text-xs text-stone-400">
        © {new Date().getFullYear()} Todos los derechos reservados · @abdonurcomidasarabes
      </p>
    </footer>
  );
}
