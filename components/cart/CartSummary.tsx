'use client';

import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';

interface CartSummaryProps {
  branchId: string;
}

export default function CartSummary({ branchId }: CartSummaryProps) {
  const { items, totalItems, totalPrice, isMinimumMet } = useCart();

  if (items.length === 0) return null;

  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(totalPrice);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        {/* Info del carrito */}
        <div>
          <p className="text-sm font-medium text-stone-600">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </p>
          <p className="text-xl font-extrabold text-stone-900">{formattedTotal}</p>
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
            Agregá productos
          </button>
        )}
      </div>
    </div>
  );
}
