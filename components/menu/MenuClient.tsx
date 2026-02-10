'use client';

import { Product } from '@/types';
import { CartProvider } from '@/components/cart/CartProvider';
import CartSummary from '@/components/cart/CartSummary';
import ProductCard from '@/components/ui/ProductCard';

interface MenuClientProps {
  products: Product[];
  branchId: string;
}

export default function MenuClient({ products, branchId }: MenuClientProps) {
  return (
    <CartProvider>
      {/* Listado de productos */}
      {products.length > 0 ? (
        <div className="mt-6 space-y-3 pb-32">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center text-stone-400">
          <p>No hay productos disponibles en este momento.</p>
        </div>
      )}

      {/* Barra fija del carrito */}
      <CartSummary branchId={branchId} />
    </CartProvider>
  );
}

