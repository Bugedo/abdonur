'use client';

import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/components/cart/CartProvider';
import {
  parseProductIncludes,
  shouldRenderIncludesList,
} from '@/lib/formatProductIncludes';

export interface ProductCartActions {
  getQuantity: (productId: string) => number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
}

interface ProductCardInnerProps {
  product: Product;
  cartActions: ProductCartActions;
}

export function ProductCardInner({ product, cartActions }: ProductCardInnerProps) {
  const { addItem, removeItem, getQuantity } = cartActions;
  const quantity = getQuantity(product.id);
  const normalizedName = product.name.trim().toLowerCase();
  const normalizedDescription = product.description?.trim().toLowerCase() ?? '';
  const shouldShowDescription = Boolean(product.description) && normalizedDescription !== normalizedName;
  const includesList = shouldShowDescription ? parseProductIncludes(product.description) : [];
  const showIncludesList = shouldShowDescription && shouldRenderIncludesList(product.description);

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-metallic-500/22 bg-surface-800/88 px-4 py-3 shadow-sm shadow-black/25 ring-1 ring-inset ring-metallic-400/[0.07] backdrop-blur-sm transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-metallic-400/40 hover:bg-surface-800/96 hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)] motion-reduce:transition-colors motion-reduce:hover:translate-y-0">
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

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-white">{product.name}</h3>
        {showIncludesList ? (
          <div className="mt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Incluye:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-stone-400">
              {includesList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          shouldShowDescription && (
            <p className="mt-0.5 text-sm text-stone-500">{product.description}</p>
          )
        )}
        <p className="mt-1 text-lg font-bold text-metallic-400">{formattedPrice}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {quantity > 0 ? (
          <>
            <button
              type="button"
              onClick={() => removeItem(product.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-500 bg-surface-700 text-lg font-bold text-stone-300 transition-[transform,colors] duration-150 ease-out hover:border-red-500 hover:bg-red-900/30 hover:text-red-400 active:scale-95 motion-reduce:active:scale-100"
              aria-label={`Quitar ${product.name}`}
            >
              −
            </button>
            <span className="w-6 text-center text-lg font-bold text-white">{quantity}</span>
          </>
        ) : null}
        <button
          type="button"
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

interface ProductCardProps {
  product: Product;
  cartActions?: ProductCartActions;
}

export default function ProductCard({ product, cartActions }: ProductCardProps) {
  const cart = useCart();
  return <ProductCardInner product={product} cartActions={cartActions ?? cart} />;
}
