'use client';

import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/components/cart/CartProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem, getQuantity } = useCart();
  const quantity = getQuantity(product.id);
  const normalizedName = product.name.trim().toLowerCase();
  const normalizedDescription = product.description?.trim().toLowerCase() ?? '';
  const shouldShowDescription = Boolean(product.description) && normalizedDescription !== normalizedName;

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-surface-600/75 bg-surface-800/85 px-4 py-3 shadow-sm shadow-black/20 ring-1 ring-inset ring-white/[0.04] backdrop-blur-sm transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-surface-500/90 hover:bg-surface-800/95 hover:shadow-lg hover:shadow-black/30 motion-reduce:transition-colors motion-reduce:hover:translate-y-0">
      {/* Imagen del producto */}
      {product.image_url && (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={product.image_url}
            alt={product.name}
            width={80}
            height={80}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        </div>
      )}

      {/* Info del producto */}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-white">{product.name}</h3>
        {shouldShowDescription && (
          <p className="mt-0.5 truncate text-sm text-stone-500">{product.description}</p>
        )}
        <p className="mt-1 text-lg font-bold text-brand-500">{formattedPrice}</p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex shrink-0 items-center gap-2">
        {quantity > 0 ? (
          <>
            <button
              onClick={() => removeItem(product.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-500 bg-surface-700 text-lg font-bold text-stone-300 transition-[transform,colors] duration-150 ease-out hover:border-red-500 hover:bg-red-900/30 hover:text-red-400 active:scale-95 motion-reduce:active:scale-100"
              aria-label={`Quitar ${product.name}`}
            >
              −
            </button>
            <span className="w-6 text-center text-lg font-bold text-white">
              {quantity}
            </span>
          </>
        ) : null}
        <button
          onClick={() => addItem(product)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white transition-[transform,colors] duration-150 ease-out hover:bg-brand-700 active:scale-95 motion-reduce:active:scale-100"
          aria-label={`Agregar ${product.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
