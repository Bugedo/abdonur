export default function HomePage() {
  return (
    <section className="flex flex-col items-center gap-6 py-12 text-center">
      <h1 className="text-4xl font-extrabold text-stone-900">
        🥟 Empanadas Abdonur
      </h1>
      <p className="max-w-md text-lg text-stone-600">
        Elegí tu sucursal y hacé tu pedido. Te lo preparamos al toque.
      </p>

      {/* PASO 3: Acá va el listado de sucursales */}
      <div className="mt-8 w-full max-w-2xl rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-stone-400">
        <p className="text-sm">📍 Selector de sucursales (próximo paso)</p>
      </div>
    </section>
  );
}
