'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { createOrder } from '@/actions/createOrder';
import { Branch, DeliveryMethod, PaymentMethod } from '@/types';

interface ConfirmClientProps {
  branch: Branch;
}

export default function ConfirmClient({ branch }: ConfirmClientProps) {
  const { items, totalItems, totalPrice, isMinimumMet, clearCart, removeLineItem } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(totalPrice);

  const deliveryLabel = deliveryMethod === 'pickup' ? 'Retira en local' : 'Envío a domicilio';
  const paymentLabel = paymentMethod === 'cash' ? 'Efectivo al recibir' : 'Transferencia / MercadoPago';

  function buildWhatsAppMessage(orderId: string): string {
    const lines = [
      `🥟 *Nuevo pedido — ${branch.name}*`,
      `📋 Pedido: #${orderId.slice(0, 8).toUpperCase()}`,
      `👤 Cliente: ${customerName.trim()}`,
      '',
      '*Detalle:*',
      ...items.map(
        (i) =>
          `• ${i.quantity}x ${i.displayName ?? i.product.name} — $${(
            (i.unitPrice ?? i.product.price) * i.quantity
          ).toLocaleString('es-AR')}`
      ),
      '',
      `*Total: ${formattedTotal}*`,
      '',
      `🚚 Entrega: ${deliveryLabel}`,
    ];

    if (deliveryMethod === 'delivery') {
      lines.push(`📍 Dirección: ${address.trim()}`);
    }

    lines.push(`💳 Pago: ${paymentLabel}`);

    if (notes.trim()) {
      lines.push('', `📝 Observaciones: ${notes.trim()}`);
    }

    return lines.join('\n');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    let whatsappWindow: Window | null = null;

    if (!customerName.trim()) {
      setError('Ingresá tu nombre.');
      return;
    }

    if (deliveryMethod === 'delivery' && !address.trim()) {
      setError('Ingresá tu dirección para el envío.');
      return;
    }

    if (!isMinimumMet) {
      setError('Agregá al menos un producto al carrito.');
      return;
    }

    setLoading(true);

    try {
      // Open a blank tab synchronously from the user click
      // so browsers don't block the final WhatsApp redirect.
      whatsappWindow = window.open('', '_blank');

      const result = await createOrder({
        branchId: branch.id,
        customerName: customerName.trim(),
        notes: notes.trim(),
        deliveryMethod,
        address: address.trim(),
        paymentMethod,
        items,
      });

      if (!result.success) {
        if (whatsappWindow) whatsappWindow.close();
        setError(result.error ?? 'Error al crear el pedido.');
        setLoading(false);
        return;
      }

      const message = buildWhatsAppMessage(result.orderId!);
      const waUrl = `https://wa.me/${branch.whatsapp_number}?text=${encodeURIComponent(message)}`;

      clearCart();
      if (whatsappWindow) {
        whatsappWindow.location.href = waUrl;
      } else {
        window.open(waUrl, '_blank');
      }
    } catch {
      if (whatsappWindow) whatsappWindow.close();
      setError('Error inesperado. Intentá de nuevo.');
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-surface-500 bg-surface-800 p-12 text-center">
        <p className="text-stone-500">Tu carrito está vacío.</p>
        <Link
          href={`/sucursal/${branch.slug}/menu`}
          className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2 text-sm font-bold text-white hover:bg-brand-700"
        >
          Ir al menú
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Resumen del pedido */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6">
        <h2 className="text-lg font-bold text-white">Tu pedido</h2>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.cartKey ?? item.product.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate text-stone-300">
                  {item.quantity}x {item.displayName ?? item.product.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  ${((item.unitPrice ?? item.product.price) * item.quantity).toLocaleString('es-AR')}
                </span>
                <button
                  type="button"
                  onClick={() => removeLineItem({ productId: item.product.id, cartKey: item.cartKey })}
                  className="rounded-md border border-red-700/70 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-900/30"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-surface-600 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">Total ({totalItems} productos)</span>
            <span className="text-xl font-extrabold text-brand-500">{formattedTotal}</span>
          </div>
        </div>
        <Link
          href={`/sucursal/${branch.slug}/menu`}
          className="mt-3 inline-block text-sm text-brand-400 hover:underline"
        >
          ← Modificar pedido
        </Link>
      </div>

      {/* Datos del cliente */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6">
        <h2 className="text-lg font-bold text-white">Tus datos</h2>

        <div className="mt-4 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-400">
              Nombre <span className="text-brand-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre"
              className="mt-1 w-full rounded-lg border border-surface-500 bg-surface-700 px-4 py-3 text-white placeholder:text-stone-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              required
            />
          </div>

          {/* Método de entrega */}
          <div>
            <label className="block text-sm font-medium text-stone-400">
              ¿Cómo lo querés? <span className="text-brand-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  deliveryMethod === 'pickup'
                    ? 'border-brand-500 bg-brand-900/40 text-brand-400'
                    : 'border-surface-500 bg-surface-700 text-stone-400 hover:border-surface-400'
                }`}
              >
                🏪 Retiro en local
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  deliveryMethod === 'delivery'
                    ? 'border-brand-500 bg-brand-900/40 text-brand-400'
                    : 'border-surface-500 bg-surface-700 text-stone-400 hover:border-surface-400'
                }`}
              >
                🛵 Envío a domicilio
              </button>
            </div>
          </div>

          {/* Dirección (solo si es delivery) */}
          {deliveryMethod === 'delivery' && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-stone-400">
                Dirección de envío <span className="text-brand-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Av. San Martín 1234, Piso 2"
                className="mt-1 w-full rounded-lg border border-surface-500 bg-surface-700 px-4 py-3 text-white placeholder:text-stone-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                required
              />
            </div>
          )}

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-stone-400">
              ¿Cómo pagás? <span className="text-brand-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-brand-500 bg-brand-900/40 text-brand-400'
                    : 'border-surface-500 bg-surface-700 text-stone-400 hover:border-surface-400'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  paymentMethod === 'transfer'
                    ? 'border-brand-500 bg-brand-900/40 text-brand-400'
                    : 'border-surface-500 bg-surface-700 text-stone-400 hover:border-surface-400'
                }`}
              >
                📱 Transferencia / MP
              </button>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-stone-400">
              Observaciones
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: sin picante, para las 20hs, etc."
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-surface-500 bg-surface-700 px-4 py-3 text-white placeholder:text-stone-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Botón enviar */}
      <button
        type="submit"
        disabled={loading || !isMinimumMet}
        className="w-full rounded-xl bg-whatsapp py-4 text-lg font-bold text-white transition-colors hover:bg-whatsapp-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Enviando...' : '💬 Confirmar y enviar por WhatsApp'}
      </button>
    </form>
  );
}
