'use client';

import { useState } from 'react';
import { OrderStatus } from '@/types';
import { updateOrderStatus } from '@/actions/updateOrderStatus';
import { getNextStatuses, canCancelOrder } from '@/lib/orderStatusWorkflow';
import CancelOrderDialog from '@/components/admin/CancelOrderDialog';

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const actionConfig: Record<OrderStatus, { label: string; classes: string }> = {
  new: { label: 'Nuevo', classes: '' },
  confirmed: { label: '✅ Confirmar pedido', classes: 'bg-yellow-600 text-white hover:bg-yellow-700' },
  on_the_way: { label: '🛵 Marcar en camino', classes: 'bg-emerald-600 text-white hover:bg-emerald-700' },
  ready: { label: '🍽️ Marcar preparado', classes: 'bg-green-600 text-white hover:bg-green-700' },
  completed: { label: '🎉 Marcar entregado', classes: 'bg-slate-600 text-white hover:bg-slate-700' },
  cancelled: { label: '❌ Cancelado', classes: '' },
};

export default function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const actions = getNextStatuses(currentStatus)
    .filter((nextStatus) => nextStatus !== 'cancelled')
    .map((nextStatus) => ({
      next: nextStatus,
      ...actionConfig[nextStatus],
    }));

  if (actions.length === 0 && !canCancelOrder(currentStatus)) return null;

  async function handleAction(newStatus: OrderStatus) {
    setLoading(true);
    setError('');

    const result = await updateOrderStatus(orderId, newStatus);
    if (!result.success) {
      setError(result.error ?? 'Error al actualizar.');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <button
            key={action.next}
            onClick={() => handleAction(action.next)}
            disabled={loading}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition-colors disabled:opacity-50 ${action.classes}`}
          >
            {loading ? 'Actualizando...' : action.label}
          </button>
        ))}
        <CancelOrderDialog
          orderId={orderId}
          currentStatus={currentStatus}
          disabled={loading}
          buttonClassName="rounded-xl border border-red-700 px-5 py-3 text-sm font-bold text-red-300 transition-colors hover:bg-red-900/30 disabled:opacity-50"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
