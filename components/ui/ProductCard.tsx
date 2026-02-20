'use client';

import { Product } from '@/types';
import { useCart } from '@/components/cart/CartProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem, getQuantity } = useCart();
  const quantity = getQuantity(product.id);

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-stone-100 bg-white px-5 py-4 shadow-sm transition-all hover:border-brand-200">
      {/* Info del producto */}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-stone-900">{product.name}</h3>
        {product.description && (
          <p className="mt-0.5 text-sm text-stone-500">{product.description}</p>
        )}
        <p className="mt-1 text-lg font-bold text-accent-600">{formattedPrice}</p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex shrink-0 items-center gap-2">
        {quantity > 0 ? (
          <>
            <button
              onClick={() => removeItem(product.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-lg font-bold text-stone-600 transition-colors hover:border-accent-400 hover:bg-red-50 hover:text-accent-600"
              aria-label={`Quitar ${product.name}`}
            >
              −
            </button>
            <span className="w-6 text-center text-lg font-bold text-stone-900">
              {quantity}
            </span>
          </>
        ) : null}
        <button
          onClick={() => addItem(product)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white transition-colors hover:bg-brand-600"
          aria-label={`Agregar ${product.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
