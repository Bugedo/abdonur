'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { createOrder } from '@/actions/createOrder';
import { getDeliveryQuote } from '@/actions/deliveryQuote';
import { Branch, DeliveryMethod, PaymentMethod } from '@/types';
import AddressPhotonAutocomplete from '@/components/confirm/AddressPhotonAutocomplete';

interface ConfirmClientProps {
  branch: Branch;
}

function branchSupportsDelivery(branch: Branch): boolean {
  const la = branch.latitude;
  const lo = branch.longitude;
  return la != null && lo != null && Number.isFinite(Number(la)) && Number.isFinite(Number(lo));
}

export default function ConfirmClient({ branch }: ConfirmClientProps) {
  const { items, totalItems, totalPrice, isMinimumMet, clearCart, removeLineItem } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [address, setAddress] = useState('');
  const [destLat, setDestLat] = useState<number | null>(null);
  const [destLng, setDestLng] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [quote, setQuote] = useState<{ feeARS: number; distanceKm: number } | null>(null);

  const supportsDelivery = branchSupportsDelivery(branch);

  const arsFmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(n);

  const cartSubtotal = totalPrice;
  const deliveryFeePreview = deliveryMethod === 'delivery' && quote ? quote.feeARS : 0;
  const grandTotal = cartSubtotal + deliveryFeePreview;

  const deliveryLabel = deliveryMethod === 'pickup' ? 'Retira en local' : 'Envío a domicilio';
  const paymentLabel = paymentMethod === 'cash' ? 'Efectivo al recibir' : 'Transferencia / MercadoPago';

  useEffect(() => {
    if (deliveryMethod !== 'delivery') {
      setDestLat(null);
      setDestLng(null);
      setQuote(null);
      setQuoteError('');
      setQuoteLoading(false);
      return;
    }

    if (destLat == null || destLng == null) {
      setQuote(null);
      setQuoteError('');
      setQuoteLoading(false);
      return;
    }

    let cancelled = false;
    setQuoteLoading(true);
    setQuoteError('');
    void getDeliveryQuote(branch.id, destLat, destLng).then((r) => {
      if (cancelled) return;
      setQuoteLoading(false);
      if (r.ok) {
        setQuote({ feeARS: r.feeARS, distanceKm: r.distanceKm });
      } else {
        setQuote(null);
        setQuoteError(r.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [branch.id, deliveryMethod, destLat, destLng]);

  function buildWhatsAppMessage(
    orderId: string,
    totals: { itemsSubtotal: number; deliveryFee: number; total: number; deliveryKm?: number | null }
  ): string {
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
      `*Subtotal productos:* ${arsFmt(totals.itemsSubtotal)}`,
    ];

    if (totals.deliveryFee > 0) {
      lines.push(`*Envío:* ${arsFmt(totals.deliveryFee)}`);
      if (totals.deliveryKm != null) {
        lines.push(`*Distancia aprox. (geodésica):* ${totals.deliveryKm.toFixed(1)} km`);
      }
    }

    lines.push('', `*Total:* ${arsFmt(totals.total)}`, '', `🚚 Entrega: ${deliveryLabel}`);

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

    if (deliveryMethod === 'delivery') {
      if (!supportsDelivery) {
        setError('El envío a domicilio no está disponible en esta sucursal.');
        return;
      }
      if (!address.trim()) {
        setError('Ingresá tu dirección para el envío.');
        return;
      }
      if (destLat == null || destLng == null) {
        setError('Elegí una dirección del listado para calcular el envío.');
        return;
      }
      if (quoteLoading || !quote || quoteError) {
        setError(quoteError || 'Esperá la cotización de envío.');
        return;
      }
    }

    if (!isMinimumMet) {
      setError('Agregá al menos un producto al carrito.');
      return;
    }

    setLoading(true);

    try {
      whatsappWindow = window.open('', '_blank');

      const result = await createOrder({
        branchId: branch.id,
        customerName: customerName.trim(),
        notes: notes.trim(),
        deliveryMethod,
        address: address.trim(),
        paymentMethod,
        items,
        deliveryDestinationLat:
          deliveryMethod === 'delivery' && destLat != null ? destLat : undefined,
        deliveryDestinationLng:
          deliveryMethod === 'delivery' && destLng != null ? destLng : undefined,
      });

      if (!result.success) {
        if (whatsappWindow) whatsappWindow.close();
        setError(result.error ?? 'Error al crear el pedido.');
        setLoading(false);
        return;
      }

      const message = buildWhatsAppMessage(result.orderId!, {
        itemsSubtotal: result.itemsSubtotal ?? cartSubtotal,
        deliveryFee: result.deliveryFee ?? 0,
        total: result.totalPrice ?? grandTotal,
        deliveryKm:
          deliveryMethod === 'delivery'
            ? (result.deliveryDistanceKm ?? quote?.distanceKm ?? null)
            : undefined,
      });
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

  const deliveryBlocked =
    deliveryMethod === 'delivery' &&
    supportsDelivery &&
    (destLat == null ||
      quoteLoading ||
      quote == null ||
      !!quoteError);

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-metallic-500/35 bg-surface-800/90 p-12 text-center backdrop-blur-sm">
        <p className="text-stone-500">Tu carrito está vacío.</p>
        <Link
          href={`/sucursal/${branch.slug}/menu`}
          className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2 text-sm font-bold text-white shadow-md shadow-brand-900/30 transition-colors hover:bg-brand-500"
        >
          Ir al menú
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="rounded-xl border border-metallic-500/25 bg-surface-800/92 p-6 shadow-[inset_0_1px_0_rgba(212,175,55,0.06)] backdrop-blur-sm">
        <h2 className="font-display text-lg font-semibold tracking-wide text-white">Tu pedido</h2>
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
        <div className="mt-4 border-t border-metallic-500/25 pt-4 space-y-1">
          <div className="flex items-center justify-between text-sm text-stone-400">
            <span>Subtotal productos ({totalItems} productos)</span>
            <span className="font-medium text-stone-300">{arsFmt(cartSubtotal)}</span>
          </div>
          {deliveryMethod === 'delivery' && supportsDelivery && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-400">
                Envío{' '}
                {quoteLoading
                  ? '(calculando…)'
                  : quote
                    ? `(${quote.distanceKm.toFixed(1)} km)`
                    : destLat != null && destLng != null
                      ? ''
                      : ''}
              </span>
              <span className="font-medium text-stone-300">
                {deliveryFeePreview ? arsFmt(deliveryFeePreview) : quoteLoading ? '…' : '—'}
              </span>
            </div>
          )}
          {deliveryMethod === 'delivery' && quoteError && (
            <p className="text-xs text-red-400">{quoteError}</p>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-bold text-white">Total</span>
            <span className="text-xl font-extrabold text-metallic-400">{arsFmt(grandTotal)}</span>
          </div>
        </div>
        <Link
          href={`/sucursal/${branch.slug}/menu`}
          className="mt-3 inline-block text-sm text-metallic-400 transition-colors hover:text-metallic-300 hover:underline"
        >
          ← Modificar pedido
        </Link>
      </div>

      <div className="rounded-xl border border-metallic-500/25 bg-surface-800/92 p-6 shadow-[inset_0_1px_0_rgba(212,175,55,0.06)] backdrop-blur-sm">
        <h2 className="font-display text-lg font-semibold tracking-wide text-white">Tus datos</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-400">
              Nombre <span className="text-metallic-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre"
              className="mt-1 w-full rounded-lg border border-metallic-500/20 bg-surface-700/90 px-4 py-3 text-[#e0e0e0] placeholder:text-stone-600 focus:border-metallic-400/50 focus:outline-none focus:ring-2 focus:ring-metallic-400/25"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400">
              ¿Cómo lo querés? <span className="text-metallic-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  deliveryMethod === 'pickup'
                    ? 'border-metallic-400 bg-brand-900/25 text-metallic-200'
                    : 'border-metallic-500/25 bg-surface-700 text-stone-400 hover:border-metallic-500/40'
                }`}
              >
                🏪 Retiro en local
              </button>
              <button
                type="button"
                disabled={!supportsDelivery}
                onClick={() => supportsDelivery && setDeliveryMethod('delivery')}
                title={supportsDelivery ? undefined : 'Pedí retiro en local o desde otra sucursal'}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  deliveryMethod === 'delivery'
                    ? 'border-metallic-400 bg-brand-900/25 text-metallic-200'
                    : 'border-metallic-500/25 bg-surface-700 text-stone-400 hover:border-metallic-500/40'
                }`}
              >
                🛵 Envío a domicilio
              </button>
            </div>
            {!supportsDelivery && (
              <p className="mt-2 text-xs text-stone-500">
                Envío no disponible en esta sucursal hasta configurar coordenadas del local.
              </p>
            )}
          </div>

          {deliveryMethod === 'delivery' && supportsDelivery && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-stone-400">
                Dirección de envío <span className="text-metallic-500">*</span>
              </label>
              <AddressPhotonAutocomplete
                id="address"
                value={address}
                onChangeAddress={setAddress}
                onPlaceResolved={(lat, lng) => {
                  setDestLat(lat);
                  setDestLng(lng);
                }}
                onPlaceCleared={() => {
                  setDestLat(null);
                  setDestLng(null);
                  setQuote(null);
                  setQuoteError('');
                }}
                placeholder="Buscá y elegí la dirección (~3 caracteres)"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-400">
              ¿Cómo pagás? <span className="text-metallic-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-metallic-400 bg-brand-900/25 text-metallic-200'
                    : 'border-metallic-500/25 bg-surface-700 text-stone-400 hover:border-metallic-500/40'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  paymentMethod === 'transfer'
                    ? 'border-metallic-400 bg-brand-900/25 text-metallic-200'
                    : 'border-metallic-500/25 bg-surface-700 text-stone-400 hover:border-metallic-500/40'
                }`}
              >
                📱 Transferencia / MP
              </button>
            </div>
          </div>

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
              className="mt-1 w-full resize-none rounded-lg border border-metallic-500/20 bg-surface-700/90 px-4 py-3 text-[#e0e0e0] placeholder:text-stone-600 focus:border-metallic-400/50 focus:outline-none focus:ring-2 focus:ring-metallic-400/25"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !isMinimumMet || deliveryBlocked}
        className="w-full rounded-xl bg-whatsapp py-4 text-lg font-bold text-white shadow-[0_4px_22px_rgba(37,211,102,0.25)] transition-[transform,box-shadow,background-color] hover:bg-whatsapp-dark hover:shadow-[0_6px_28px_rgba(37,211,102,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Enviando...' : '💬 Confirmar y enviar por WhatsApp'}
      </button>
    </form>
  );
}
