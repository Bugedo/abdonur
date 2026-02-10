import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Formatear precio argentino
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-stone-900">{product.name}</h3>
        {product.description && (
          <p className="mt-0.5 truncate text-sm text-stone-500">{product.description}</p>
        )}
      </div>
      <span className="ml-4 shrink-0 text-lg font-bold text-brand-700">
        {formattedPrice}
      </span>
    </div>
  );
}

