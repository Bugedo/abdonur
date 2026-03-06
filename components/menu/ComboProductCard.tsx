'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/components/cart/CartProvider';

interface ComboProductCardProps {
  product: Product;
  flavorProducts: Product[];
}

export default function ComboProductCard({ product, flavorProducts }: ComboProductCardProps) {
  const { addConfiguredCombo, getQuantity, removeItem } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [selection, setSelection] = useState<Record<string, number>>({});

  const targetCount = product.name.toLowerCase().includes('x12') ? 12 : 6;
  const quantityInCart = getQuantity(product.id);
  const selectedCount = useMemo(
    () => Object.values(selection).reduce((sum, qty) => sum + qty, 0),
    [selection]
  );
  const remaining = Math.max(targetCount - selectedCount, 0);

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(product.price);

  function openBuilder() {
    setExpanded(true);
    const next: Record<string, number> = {};
    for (const flavor of flavorProducts) next[flavor.id] = 0;
    setSelection(next);
  }

  function updateFlavorQty(flavorId: string, delta: number) {
    setSelection((prev) => {
      const current = prev[flavorId] ?? 0;
      const nextQty = Math.max(0, current + delta);
      const next = { ...prev, [flavorId]: nextQty };
      const total = Object.values(next).reduce((sum, qty) => sum + qty, 0);
      if (total > targetCount) return prev;
      return next;
    });
  }

  function addComboToCart() {
    if (selectedCount !== targetCount) return;
    const detail = flavorProducts
      .map((flavor) => ({ name: flavor.name, qty: selection[flavor.id] ?? 0 }))
      .filter((entry) => entry.qty > 0)
      .map((entry) => `${entry.qty}x ${entry.name}`)
      .join(', ');

    addConfiguredCombo({
      product,
      displayName: `${product.name} (${detail})`,
      comboDetail: detail,
    });
    setExpanded(false);
    setSelection({});
  }

  return (
    <div className="rounded-xl border border-surface-600 bg-surface-800 px-4 py-3 transition-colors hover:border-surface-500">
      <div className="flex items-center gap-4">
        {product.image_url && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={product.image_url}
              alt={product.name}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white">{product.name}</h3>
          {product.description && <p className="mt-0.5 text-sm text-stone-500">{product.description}</p>}
          <p className="mt-1 text-lg font-bold text-brand-500">{formattedPrice}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {quantityInCart > 0 ? (
            <>
              <button
                onClick={() => removeItem(product.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-500 bg-surface-700 text-lg font-bold text-stone-300 transition-colors hover:border-red-500 hover:bg-red-900/30 hover:text-red-400"
                aria-label={`Quitar ${product.name}`}
              >
                -
              </button>
              <span className="w-6 text-center text-lg font-bold text-white">{quantityInCart}</span>
            </>
          ) : null}
          <button
            onClick={() => (expanded ? setExpanded(false) : openBuilder())}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white transition-colors hover:bg-brand-700"
            aria-label={`Configurar ${product.name}`}
          >
            +
          </button>
        </div>
      </div>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="rounded-lg border border-brand-700/40 bg-brand-900/20 p-3">
            <p className="text-sm text-stone-300">
              Armá tu combo: faltan <span className="font-bold text-brand-400">{remaining}</span> para completar x
              {targetCount}.
            </p>
            <div className="mt-3 space-y-2">
              {flavorProducts.map((flavor) => (
                <div key={flavor.id} className="flex items-center justify-between rounded-md bg-surface-700 px-3 py-2">
                  <span className="text-sm text-stone-200">{flavor.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateFlavorQty(flavor.id, -1)}
                      className="h-7 w-7 rounded-full border border-surface-500 text-white hover:bg-surface-600"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-white">
                      {selection[flavor.id] ?? 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateFlavorQty(flavor.id, 1)}
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
              disabled={selectedCount !== targetCount}
              onClick={addComboToCart}
              className="mt-3 w-full rounded-lg bg-whatsapp py-2 text-sm font-bold text-white transition-colors hover:bg-whatsapp-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agregar combo al pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
