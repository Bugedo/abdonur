import { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; classes: string }> = {
  new: { label: '🆕 Nuevo', classes: 'border-yellow-300 bg-yellow-50 text-yellow-800' },
  confirmed: { label: '✅ Confirmado', classes: 'border-blue-300 bg-blue-50 text-blue-800' },
  completed: { label: '🎉 Completado', classes: 'border-green-300 bg-green-50 text-green-800' },
  cancelled: { label: '❌ Cancelado', classes: 'border-red-300 bg-red-50 text-red-800' },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  );
}


