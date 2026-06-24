'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/actions/updateOrderStatus';
import { canCancelOrder } from '@/lib/orderStatusWorkflow';
import { OrderStatus } from '@/types';

interface CancelOrderDialogProps {
  orderId: string;
  currentStatus: OrderStatus;
  disabled?: boolean;
  onSuccess?: () => void;
  buttonClassName?: string;
}

export default function CancelOrderDialog({
  orderId,
  currentStatus,
  disabled = false,
  onSuccess,
  buttonClassName = 'rounded-lg border border-red-700 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-900/30 disabled:cursor-not-allowed disabled:opacity-40',
}: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!canCancelOrder(currentStatus)) return null;

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setReason('');
    setError('');
  }

  async function handleConfirm() {
    setLoading(true);
    setError('');

    const result = await updateOrderStatus(orderId, 'cancelled', reason);
    if (!result.success) {
      setError(result.error ?? 'No se pudo cancelar el pedido.');
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    setReason('');
    onSuccess?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        disabled={disabled || loading}
        className={buttonClassName}
      >
        Cancelar pedido
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
          >
            <h2 id="cancel-order-title" className="text-lg font-bold text-white">
              Cancelar pedido
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              Esta acción no se puede deshacer. El pedido pasará a Pedidos pasados.
            </p>

            <label className="mt-4 block text-sm font-medium text-stone-300" htmlFor={`cancel-reason-${orderId}`}>
              Motivo (opcional)
            </label>
            <textarea
              id={`cancel-reason-${orderId}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Ej: pedido duplicado, no llegamos con el delivery..."
              className="mt-1 w-full rounded-lg border border-surface-500 bg-surface-900 px-3 py-2 text-sm text-white placeholder:text-stone-500 focus:border-red-600 focus:outline-none"
            />

            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-lg border border-surface-500 px-4 py-2 text-sm font-semibold text-stone-300 hover:bg-surface-700 disabled:opacity-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={loading}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Cancelando...' : 'Confirmar cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
