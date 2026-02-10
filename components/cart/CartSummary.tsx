'use client';

import Link from 'next/link';
import { useCart, MIN_ITEMS } from '@/components/cart/CartProvider';

interface CartSummaryProps {
  branchId: string;
}

export default function CartSummary({ branchId }: CartSummaryProps) {
  const { items, totalItems, totalPrice, isMinimumMet } = useCart();

  // No mostrar si el carrito está vacío
  if (items.length === 0) return null;

  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(totalPrice);

  const remaining = MIN_ITEMS - totalItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        {/* Info del carrito */}
        <div>
          <p className="text-sm font-medium text-stone-600">
            {totalItems} {totalItems === 1 ? 'empanada' : 'empanadas'}
          </p>
          <p className="text-xl font-extrabold text-stone-900">{formattedTotal}</p>
          {!isMinimumMet && (
            <p className="text-xs text-red-500">
              Faltan {remaining} más (mínimo {MIN_ITEMS})
            </p>
          )}
        </div>

        {/* Botón confirmar */}
        {isMinimumMet ? (
          <Link
            href={`/sucursal/${branchId}/confirmar`}
            className="rounded-xl bg-whatsapp px-6 py-3 text-base font-bold text-white transition-colors hover:bg-whatsapp-dark"
          >
            Confirmar pedido →
          </Link>
        ) : (
          <button
            disabled
            className="cursor-not-allowed rounded-xl bg-stone-300 px-6 py-3 text-base font-bold text-stone-500"
          >
            Mínimo {MIN_ITEMS} empanadas
          </button>
        )}
      </div>
    </div>
  );
}

