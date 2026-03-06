'use client';

import { useMemo, useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/components/cart/CartProvider';

interface EmpanadaBundlesBuilderProps {
  flavorProducts: Product[];
  bundle6Product: Product | null;
  bundle12Product: Product | null;
}

type BundleSize = 6 | 12;

const bundlePriceBySize: Record<BundleSize, number> = {
  6: 10000,
  12: 20000,
};

export default function EmpanadaBundlesBuilder({
  flavorProducts,
  bundle6Product,
  bundle12Product,
}: EmpanadaBundlesBuilderProps) {
  const { addBundleItem } = useCart();
  const [activeSize, setActiveSize] = useState<BundleSize | null>(null);
  const [selection, setSelection] = useState<Record<string, number>>({});

  const target = activeSize ?? 0;
  const selectedCount = useMemo(
    () => Object.values(selection).reduce((sum, qty) => sum + qty, 0),
    [selection]
  );
  const remaining = Math.max(target - selectedCount, 0);

  if (!bundle6Product || !bundle12Product || flavorProducts.length === 0) {
    return null;
  }

  const currentBundleProduct = activeSize === 6 ? bundle6Product : bundle12Product;

  function resetSelection(size: BundleSize) {
    setActiveSize(size);
    const base: Record<string, number> = {};
    for (const product of flavorProducts) base[product.id] = 0;
    setSelection(base);
  }

  function changeQty(productId: string, delta: number) {
    setSelection((prev) => {
      const current = prev[productId] ?? 0;
      const next = Math.max(0, current + delta);
      const nextSelection = { ...prev, [productId]: next };
      const total = Object.values(nextSelection).reduce((sum, qty) => sum + qty, 0);
      if (activeSize && total > activeSize) return prev;
      return nextSelection;
    });
  }

  function handleAddBundle() {
    if (!activeSize || selectedCount !== activeSize) return;

    const detail = flavorProducts
      .map((p) => ({ name: p.name, qty: selection[p.id] ?? 0 }))
      .filter((x) => x.qty > 0)
      .map((x) => `${x.qty}x ${x.name}`)
      .join(', ');

    addBundleItem({
      product: currentBundleProduct,
      quantity: 1,
      unitPrice: bundlePriceBySize[activeSize],
      displayName: `Arma tu x${activeSize}: ${detail}`,
      bundleLabel: `x${activeSize}`,
    });

    setActiveSize(null);
    setSelection({});
  }

  const formatted6 = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(bundlePriceBySize[6]);
  const formatted12 = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(bundlePriceBySize[12]);

  return (
    <div className="mb-4 rounded-xl border border-brand-700/40 bg-brand-900/20 p-4">
      <h3 className="text-base font-bold text-brand-400">🧩 Armá tus empanadas</h3>
      <p className="mt-1 text-sm text-stone-300">
        Elegí cualquier combinación de los 4 gustos disponibles.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => resetSelection(6)}
          className="rounded-lg border border-surface-500 px-3 py-2 text-sm font-semibold text-stone-200 hover:bg-surface-700"
        >
          Armar x6 ({formatted6})
        </button>
        <button
          type="button"
          onClick={() => resetSelection(12)}
          className="rounded-lg border border-surface-500 px-3 py-2 text-sm font-semibold text-stone-200 hover:bg-surface-700"
        >
          Armar x12 ({formatted12})
        </button>
      </div>

      {activeSize && (
        <div className="mt-4 rounded-lg border border-surface-600 bg-surface-800 p-3">
          <p className="text-sm text-stone-300">
            Armando <span className="font-bold text-white">x{activeSize}</span> — faltan{' '}
            <span className="font-bold text-brand-400">{remaining}</span>
          </p>
          <div className="mt-3 space-y-2">
            {flavorProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-md bg-surface-700 px-3 py-2">
                <span className="text-sm text-stone-200">{product.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeQty(product.id, -1)}
                    className="h-7 w-7 rounded-full border border-surface-500 text-white hover:bg-surface-600"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">
                    {selection[product.id] ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQty(product.id, 1)}
                    className="h-7 w-7 rounded-full bg-brand-600 text-white hover:bg-brand-700"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={selectedCount !== activeSize}
            onClick={handleAddBundle}
            className="mt-3 w-full rounded-lg bg-whatsapp py-2 text-sm font-bold text-white hover:bg-whatsapp-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar armado al carrito
          </button>
        </div>
      )}
    </div>
  );
}
