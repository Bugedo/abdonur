'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart, MIN_ITEMS } from '@/components/cart/CartProvider';
import { createOrder } from '@/actions/createOrder';
import { Branch, DeliveryMethod, PaymentMethod } from '@/types';

interface ConfirmClientProps {
  branch: Branch;
}

export default function ConfirmClient({ branch }: ConfirmClientProps) {
  const { items, totalItems, totalPrice, isMinimumMet, clearCart } = useCart();
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

  // Generar mensaje de WhatsApp
  function buildWhatsAppMessage(orderId: string): string {
    const lines = [
      `🥟 *Nuevo pedido — ${branch.name}*`,
      `📋 Pedido: #${orderId.slice(0, 8).toUpperCase()}`,
      `👤 Cliente: ${customerName.trim()}`,
      '',
      '*Detalle:*',
      ...items.map(
        (i) =>
          `• ${i.quantity}x ${i.product.name} — $${(i.product.price * i.quantity).toLocaleString('es-AR')}`
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

    if (!customerName.trim()) {
      setError('Ingresá tu nombre.');
      return;
    }

    if (deliveryMethod === 'delivery' && !address.trim()) {
      setError('Ingresá tu dirección para el envío.');
      return;
    }

    if (!isMinimumMet) {
      setError(`El pedido mínimo es de ${MIN_ITEMS} empanadas.`);
      return;
    }

    setLoading(true);

    try {
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
        setError(result.error ?? 'Error al crear el pedido.');
        setLoading(false);
        return;
      }

      // Generar link de WhatsApp y abrir
      const message = buildWhatsAppMessage(result.orderId!);
      const waUrl = `https://wa.me/${branch.whatsapp_number}?text=${encodeURIComponent(message)}`;

      clearCart();
      window.open(waUrl, '_blank');
    } catch {
      setError('Error inesperado. Intentá de nuevo.');
      setLoading(false);
    }
  }

  // Si no hay items, mostrar mensaje
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center">
        <p className="text-stone-500">Tu carrito está vacío.</p>
        <Link
          href={`/sucursal/${branch.id}/menu`}
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
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-stone-900">Tu pedido</h2>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between text-sm">
              <span className="text-stone-700">
                {item.quantity}x {item.product.name}
              </span>
              <span className="font-medium text-stone-900">
                ${(item.product.price * item.quantity).toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-stone-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-stone-900">Total ({totalItems} empanadas)</span>
            <span className="text-xl font-extrabold text-brand-700">{formattedTotal}</span>
          </div>
        </div>
        <Link
          href={`/sucursal/${branch.id}/menu`}
          className="mt-3 inline-block text-sm text-brand-600 hover:underline"
        >
          ← Modificar pedido
        </Link>
      </div>

      {/* Datos del cliente */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-stone-900">Tus datos</h2>

        <div className="mt-4 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre"
              className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>

          {/* Método de entrega */}
          <div>
            <label className="block text-sm font-medium text-stone-700">
              ¿Cómo lo querés? <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  deliveryMethod === 'pickup'
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                🏪 Retiro en local
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  deliveryMethod === 'delivery'
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                🛵 Envío a domicilio
              </button>
            </div>
          </div>

          {/* Dirección (solo si es delivery) */}
          {deliveryMethod === 'delivery' && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-stone-700">
                Dirección de envío <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Av. San Martín 1234, Piso 2"
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                required
              />
            </div>
          )}

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-stone-700">
              ¿Cómo pagás? <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  paymentMethod === 'transfer'
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                📱 Transferencia / MP
              </button>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-stone-700">
              Observaciones
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: sin picante, para las 20hs, etc."
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-stone-300 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
