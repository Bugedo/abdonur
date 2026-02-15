'use client';

import { useState } from 'react';
import { OrderStatus } from '@/types';
import { updateOrderStatus } from '@/actions/updateOrderStatus';

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const transitions: Record<OrderStatus, { label: string; next: OrderStatus; classes: string }[]> = {
  new: [
    { label: '✅ Confirmar pedido', next: 'confirmed', classes: 'bg-blue-600 text-white hover:bg-blue-700' },
    { label: '❌ Cancelar', next: 'cancelled', classes: 'border border-red-300 text-red-600 hover:bg-red-50' },
  ],
  confirmed: [
    { label: '🎉 Marcar completado', next: 'completed', classes: 'bg-green-600 text-white hover:bg-green-700' },
    { label: '❌ Cancelar', next: 'cancelled', classes: 'border border-red-300 text-red-600 hover:bg-red-50' },
  ],
  completed: [],
  cancelled: [],
};

export default function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const actions = transitions[currentStatus];
  if (actions.length === 0) return null;

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
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}


