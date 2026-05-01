'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminOrder } from '@/actions/createAdminOrder';
import { DeliveryMethod, PaymentMethod, Product } from '@/types';

interface BranchOption {
  id: string;
  slug: string;
  name: string;
}

interface AdminCreateOrderFormProps {
  products: Product[];
  branchOptions: BranchOption[];
  defaultBranchId: string;
  panelSlug: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function AdminCreateOrderForm({
  products,
  branchOptions,
  defaultBranchId,
  panelSlug,
}: AdminCreateOrderFormProps) {
  const router = useRouter();
  const [selectedBranchId, setSelectedBranchId] = useState(defaultBranchId);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const productsByCategory = useMemo(() => {
    return {
      empanadas: products.filter((p) => p.category === 'empanadas'),
      comidas: products.filter((p) => p.category === 'comidas'),
      postres: products.filter((p) => p.category === 'postres'),
    };
  }, [products]);

  const selectedItems = useMemo(
    () =>
      products
        .map((product) => ({ product, quantity: quantities[product.id] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [products, quantities]
  );

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  function setQuantity(productId: string, quantity: number) {
    setQuantities((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: quantity };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Ingresá el nombre del cliente.');
      return;
    }

    if (deliveryMethod === 'delivery' && !address.trim()) {
      setError('Ingresá una dirección para envío.');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Seleccioná al menos un producto.');
      return;
    }

    setLoading(true);
    const result = await createAdminOrder({
      branchId: selectedBranchId,
      customerName: customerName.trim(),
      notes: notes.trim(),
      deliveryMethod,
      address: address.trim(),
      paymentMethod,
      items: selectedItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
    });

    if (!result.success) {
      setError(result.error ?? 'No se pudo crear el pedido.');
      setLoading(false);
      return;
    }

    router.push(`/admin/sucursal/${panelSlug}`);
    router.refresh();
  }

  const categoryOrder: Array<keyof typeof productsByCategory> = ['empanadas', 'comidas', 'postres'];
  const categoryLabels: Record<keyof typeof productsByCategory, string> = {
    empanadas: 'Empanadas',
    comidas: 'Comidas',
    postres: 'Postres',
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-5">
        <h2 className="text-lg font-bold text-white">Datos del pedido</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-400">Sucursal destino</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-500 bg-surface-700 px-3 py-2 text-sm text-white"
            >
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400">
              Cliente <span className="text-brand-500">*</span>
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
              className="mt-1 w-full rounded-lg border border-surface-500 bg-surface-700 px-3 py-2 text-sm text-white placeholder:text-stone-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400">Entrega</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  deliveryMethod === 'pickup'
                    ? 'border-brand-600 bg-brand-900/30 text-brand-300'
                    : 'border-surface-500 text-stone-300'
                }`}
              >
                Retiro
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  deliveryMethod === 'delivery'
                    ? 'border-brand-600 bg-brand-900/30 text-brand-300'
                    : 'border-surface-500 text-stone-300'
                }`}
              >
                Envio
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400">Pago</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  paymentMethod === 'cash'
                    ? 'border-brand-600 bg-brand-900/30 text-brand-300'
                    : 'border-surface-500 text-stone-300'
                }`}
              >
                Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  paymentMethod === 'transfer'
                    ? 'border-brand-600 bg-brand-900/30 text-brand-300'
                    : 'border-surface-500 text-stone-300'
                }`}
              >
                Transferencia
              </button>
            </div>
          </div>
        </div>

        {deliveryMethod === 'delivery' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-400">
              Dirección <span className="text-brand-500">*</span>
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, referencia"
              className="mt-1 w-full rounded-lg border border-surface-500 bg-surface-700 px-3 py-2 text-sm text-white placeholder:text-stone-500"
              required
            />
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-400">Observaciones</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Indicaciones del pedido"
            className="mt-1 w-full resize-none rounded-lg border border-surface-500 bg-surface-700 px-3 py-2 text-sm text-white placeholder:text-stone-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-surface-600 bg-surface-800 p-5">
        <h2 className="text-lg font-bold text-white">Productos</h2>
        <div className="mt-4 space-y-5">
          {categoryOrder.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">{categoryLabels[category]}</h3>
              <div className="mt-2 space-y-2">
                {productsByCategory[category].map((product) => {
                  const quantity = quantities[product.id] ?? 0;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-surface-600 bg-surface-900/40 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-stone-400">{formatPrice(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          className="h-7 w-7 rounded-md border border-surface-500 text-sm font-bold text-stone-200"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-white">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          className="h-7 w-7 rounded-md border border-brand-600 text-sm font-bold text-brand-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-surface-600 bg-surface-800 p-5">
        <h2 className="text-lg font-bold text-white">Resumen</h2>
        <p className="mt-2 text-sm text-stone-300">
          {totalItems} productos - <span className="font-bold text-brand-400">{formatPrice(totalPrice)}</span>
        </p>
      </div>

      {error && <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-400">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Creando pedido...' : 'Crear pedido'}
      </button>
    </form>
  );
}
