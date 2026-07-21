'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { createOrder } from '@/actions/createOrder';
import { Branch, DeliveryMethod, PaymentMethod } from '@/types';
import AddressPhotonAutocomplete from '@/components/confirm/AddressPhotonAutocomplete';
import { normalizeWhatsappWaMe } from '@/lib/formatWhatsappDisplay';
import { buildWhatsappOrderMessage } from '@/lib/buildWhatsappOrderMessage';
import {
  buildWhatsappSendUrl,
  isInAppBrowser,
  openWhatsappSendUrl,
} from '@/lib/openWhatsapp';
import {
  getBranchClosedCustomerMessage,
  isBranchOpenNow,
} from '@/lib/branchOpenStatus';
import BranchClosedNotice from '@/components/ui/BranchClosedNotice';

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
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [showInAppHint, setShowInAppHint] = useState(false);
  const [branchOpen, setBranchOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setBranchOpen(isBranchOpenNow(branch.opening_hours));
    const interval = setInterval(() => {
      setBranchOpen(isBranchOpenNow(branch.opening_hours));
    }, 60_000);
    return () => clearInterval(interval);
  }, [branch.opening_hours]);

  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(totalPrice);

  const deliveryLabel = deliveryMethod === 'pickup' ? 'Retira en local' : 'Envío a domicilio';
  const paymentLabel = paymentMethod === 'cash' ? 'Efectivo al recibir' : 'Transferencia / MercadoPago';
  const isClosed = branchOpen === false;

  function buildWhatsAppMessage(orderId: string): string {
    return buildWhatsappOrderMessage({
      branchName: branch.name,
      orderId,
      customerName: customerName.trim(),
      items,
      formattedTotal,
      deliveryMethod,
      deliveryLabel,
      address: address.trim(),
      paymentMethod,
      paymentLabel,
      notes: notes.trim(),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setWhatsappUrl(null);
    setShowInAppHint(false);

    if (!isBranchOpenNow(branch.opening_hours)) {
      setBranchOpen(false);
      setError(getBranchClosedCustomerMessage(branch.opening_hours));
      return;
    }

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
        return;
      }

      const message = buildWhatsAppMessage(result.orderId!);
      const waUrl = buildWhatsappSendUrl(normalizeWhatsappWaMe(branch.whatsapp_number), message);

      clearCart();
      setWhatsappUrl(waUrl);

      const inApp = isInAppBrowser();
      setShowInAppHint(inApp);

      if (!inApp) {
        openWhatsappSendUrl(waUrl);
      }
    } catch {
      setError('Error inesperado. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const deliveryBlocked = deliveryMethod === 'delivery' && !address.trim();
  const submitDisabled = loading || !isMinimumMet || deliveryBlocked || isClosed || branchOpen === null;

  if (whatsappUrl) {
    return (
      <div className="mt-8 space-y-4 rounded-xl border border-metallic-500/25 bg-surface-800/92 p-8 text-center shadow-[inset_0_1px_0_rgba(212,175,55,0.06)] backdrop-blur-sm">
        <p className="font-display text-xl font-semibold text-white">¡Pedido registrado!</p>
        <p className="text-sm text-stone-400">
          Tocá el botón para abrir WhatsApp y enviar el mensaje al local.
        </p>
        {showInAppHint && (
          <p className="rounded-lg border border-amber-700/50 bg-amber-900/25 px-4 py-3 text-left text-sm text-amber-200">
            Si ves &quot;Descargar WhatsApp&quot;, abrí el menú del navegador (⋮) y elegí{' '}
            <strong>Abrir en Chrome</strong> o <strong>Abrir en Safari</strong>. Después volvé a tocar
            el botón verde.
          </p>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-xl bg-whatsapp py-4 text-lg font-bold text-white shadow-[0_4px_22px_rgba(37,211,102,0.25)] transition-[transform,box-shadow,background-color] hover:bg-whatsapp-dark hover:shadow-[0_6px_28px_rgba(37,211,102,0.35)]"
        >
          💬 Abrir WhatsApp y enviar pedido
        </a>
        <Link
          href={`/sucursal/${branch.slug}/menu`}
          className="inline-block text-sm text-metallic-400 transition-colors hover:text-metallic-300 hover:underline"
        >
          Volver al menú
        </Link>
      </div>
    );
  }

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
      {isClosed && <BranchClosedNotice openingHours={branch.opening_hours} />}

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
        <div className="mt-4 border-t border-metallic-500/25 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">Total ({totalItems} productos)</span>
            <span className="text-xl font-extrabold text-metallic-400">{formattedTotal}</span>
          </div>
          {deliveryMethod === 'delivery' && (
            <p className="mt-2 text-xs text-stone-500">
              El costo de envío lo confirma el local por WhatsApp.
            </p>
          )}
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
                onClick={() => setDeliveryMethod('delivery')}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  deliveryMethod === 'delivery'
                    ? 'border-metallic-400 bg-brand-900/25 text-metallic-200'
                    : 'border-metallic-500/25 bg-surface-700 text-stone-400 hover:border-metallic-500/40'
                }`}
              >
                🛵 Envío a domicilio
              </button>
            </div>
          </div>

          {deliveryMethod === 'delivery' && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-stone-400">
                Dirección de envío <span className="text-metallic-500">*</span>
              </label>
              <AddressPhotonAutocomplete
                id="address"
                value={address}
                onChangeAddress={setAddress}
                onPlaceResolved={(_lat, _lng, label) => setAddress(label)}
                onPlaceCleared={() => {}}
                placeholder="Buscá tu dirección o escribila (Córdoba Capital)"
              />
              <p className="mt-2 text-xs text-stone-500">
                Solo envíos en Córdoba Capital, Argentina. Podés elegir una sugerencia o escribir la
                dirección completa.
              </p>
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
        disabled={submitDisabled}
        className="w-full rounded-xl bg-whatsapp py-4 text-lg font-bold text-white shadow-[0_4px_22px_rgba(37,211,102,0.25)] transition-[transform,box-shadow,background-color] hover:bg-whatsapp-dark hover:shadow-[0_6px_28px_rgba(37,211,102,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? 'Enviando...'
          : isClosed
            ? 'Local cerrado — no se puede enviar'
            : '💬 Confirmar y enviar por WhatsApp'}
      </button>
    </form>
  );
}
