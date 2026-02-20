import { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; classes: string }> = {
  new: { label: '🆕 Nuevo', classes: 'border-yellow-700 bg-yellow-900/40 text-yellow-400' },
  confirmed: { label: '✅ Confirmado', classes: 'border-blue-700 bg-blue-900/40 text-blue-400' },
  completed: { label: '🎉 Completado', classes: 'border-green-700 bg-green-900/40 text-green-400' },
  cancelled: { label: '❌ Cancelado', classes: 'border-red-700 bg-red-900/40 text-red-400' },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  );
}
