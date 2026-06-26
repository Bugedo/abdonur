'use client';

import { CartItem, Product, ProductCategory } from '@/types';
import { ProductCardInner } from '@/components/ui/ProductCard';
import { ComboProductCardInner } from '@/components/menu/ComboProductCard';
import { buildEmpanadaMenuSections, canonicalComboDisplayName, withDisplayName } from '@/lib/empanadaMenu';
import { ProductCartActions } from '@/components/ui/ProductCard';
import { ComboCartActions } from '@/components/menu/ComboProductCard';

interface AdminProductPickerProps {
  products: Product[];
  items: CartItem[];
  productCartActions: ProductCartActions;
  comboCartActions: ComboCartActions;
  totalItems: number;
  totalPrice: number;
}

const categoryTitles: Record<ProductCategory, string> = {
  empanadas: 'Empanadas',
  comidas: 'Comidas y Platos',
  postres: 'Postres',
};

const categoryOrder: ProductCategory[] = ['empanadas', 'comidas', 'postres'];

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function AdminProductPicker({
  products,
  items,
  productCartActions,
  comboCartActions,
  totalItems,
  totalPrice,
}: AdminProductPickerProps) {
  const { fatayRows, sfihasFlavorSections, comboProducts, comboFlavorProducts } =
    buildEmpanadaMenuSections(products);

  const productsByCategory = products.reduce(
    (acc, product) => {
      (acc[product.category] = acc[product.category] || []).push(product);
      return acc;
    },
    {} as Record<ProductCategory, Product[]>
  );

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-500 bg-surface-900/40 p-8 text-center text-stone-500">
        No hay productos disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-5">
        <h2 className="text-lg font-bold text-white">Productos</h2>
        <div className="mt-4 space-y-8">
          {categoryOrder
            .filter((cat) => productsByCategory[cat]?.length)
            .map((category) => (
              <div key={category}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-400">
                  {categoryTitles[category]}
                </h3>
                {category === 'empanadas' ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-500">Árabes</h4>
                      {fatayRows.map((product) => (
                        <ProductCardInner
                          key={`${product.id}-${product.name}`}
                          product={product}
                          cartActions={productCartActions}
                        />
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-500">Sfihas</h4>
                      {sfihasFlavorSections.map((section, index) => (
                        <div key={section.flavorKey} className="space-y-3">
                          {index > 0 && <div className="mx-1 h-px bg-surface-600" />}
                          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                            {section.flavorLabel}
                          </p>
                          {section.rows.map((product) => (
                            <ProductCardInner
                              key={`${product.id}-${product.name}`}
                              product={product}
                              cartActions={productCartActions}
                            />
                          ))}
                        </div>
                      ))}
                    </div>

                    {comboProducts.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                          Armá tu Docena
                        </h4>
                        {comboProducts.map((product) => (
                          <ComboProductCardInner
                            key={product.id}
                            product={withDisplayName(product, canonicalComboDisplayName())}
                            flavorProducts={comboFlavorProducts}
                            cartActions={comboCartActions}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productsByCategory[category].map((product) => (
                      <ProductCardInner
                        key={product.id}
                        product={product}
                        cartActions={productCartActions}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-xl border border-surface-600 bg-surface-800 p-5">
        <h2 className="text-lg font-bold text-white">Resumen del pedido</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Todavía no agregaste productos.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {items.map((item) => (
              <li
                key={item.cartKey ?? `${item.product.id}-${item.comboDetail ?? 'normal'}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-surface-600 bg-surface-900/40 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{item.displayName ?? item.product.name}</p>
                  {item.comboDetail && <p className="mt-0.5 text-xs text-stone-400">{item.comboDetail}</p>}
                  <p className="mt-0.5 text-xs text-stone-500">Cantidad: {item.quantity}</p>
                </div>
                <p className="shrink-0 font-semibold text-brand-400">
                  {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm text-stone-300">
          {totalItems} productos — <span className="font-bold text-brand-400">{formatPrice(totalPrice)}</span>
        </p>
      </div>
    </div>
  );
}
