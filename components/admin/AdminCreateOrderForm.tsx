'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminOrder } from '@/actions/createAdminOrder';
import AdminProductPicker from '@/components/admin/AdminProductPicker';
import { useAdminOrderCart } from '@/components/admin/useAdminOrderCart';
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
  cancelHref: string;
}

export default function AdminCreateOrderForm({
  products,
  branchOptions,
  defaultBranchId,
  panelSlug,
  cancelHref,
}: AdminCreateOrderFormProps) {
  const router = useRouter();
  const { items, productCartActions, comboCartActions, totalItems, totalPrice } = useAdminOrderCart();
  const [selectedBranchId, setSelectedBranchId] = useState(defaultBranchId);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (items.length === 0) {
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
      items,
    });

    if (!result.success) {
      setError(result.error ?? 'No se pudo crear el pedido.');
      setLoading(false);
      return;
    }

    if (result.orderId) {
      router.push(`/admin/pedido/${result.orderId}`);
    } else {
      router.push(`/admin/sucursal/${panelSlug}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-5">
        <h2 className="text-lg font-bold text-white">Datos del pedido</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {branchOptions.length > 1 && (
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
          )}

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
                Envío
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
            <p className="mt-1 text-xs text-stone-500">El envío manual se registra sin costo automático.</p>
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

      <AdminProductPicker
        products={products}
        items={items}
        productCartActions={productCartActions}
        comboCartActions={comboCartActions}
        totalItems={totalItems}
        totalPrice={totalPrice}
      />

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          className="w-full rounded-xl border border-surface-500 py-3 text-sm font-semibold text-stone-300 hover:bg-surface-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Creando pedido...' : 'Crear pedido'}
        </button>
      </div>
    </form>
  );
}
