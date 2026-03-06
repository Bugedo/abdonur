'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';

interface CartSummaryProps {
  branchId: string;
  branchSlug: string;
}

export default function CartSummary({ branchSlug }: CartSummaryProps) {
  const { items, totalItems, totalPrice, isMinimumMet, removeLineItem } = useCart();
  const [showItems, setShowItems] = useState(false);

  if (items.length === 0) return null;

  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(totalPrice);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-600 bg-surface-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <button
          type="button"
          onClick={() => setShowItems((prev) => !prev)}
          className="mb-3 text-xs font-semibold text-brand-400 hover:underline"
        >
          {showItems ? 'Ocultar carrito' : 'Ver carrito'}
        </button>

        {showItems && (
          <div className="mb-3 max-h-36 space-y-1 overflow-y-auto rounded-lg border border-surface-600 bg-surface-900/50 p-2">
            {items.map((item) => (
              <div key={item.cartKey ?? item.product.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 flex-1 truncate text-stone-300">
                  {item.quantity}x {item.displayName ?? item.product.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeLineItem({ productId: item.product.id, cartKey: item.cartKey })}
                  className="rounded-md border border-red-700/70 px-2 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-900/30"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
        {/* Info del carrito */}
        <div>
          <p className="text-sm font-medium text-stone-400">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </p>
          <p className="text-xl font-extrabold text-white">{formattedTotal}</p>
        </div>

        {/* Botón confirmar */}
        {isMinimumMet ? (
          <Link
            href={`/sucursal/${branchSlug}/confirmar`}
            className="rounded-xl bg-whatsapp px-6 py-3 text-base font-bold text-white transition-colors hover:bg-whatsapp-dark"
          >
            Confirmar pedido →
          </Link>
        ) : (
          <button
            disabled
            className="cursor-not-allowed rounded-xl bg-surface-600 px-6 py-3 text-base font-bold text-stone-500"
          >
            Agregá productos
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
