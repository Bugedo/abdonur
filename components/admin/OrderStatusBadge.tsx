import { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; classes: string }> = {
  new: { label: '🆕 Nuevo', classes: 'border-stone-300 bg-stone-100 text-stone-900' },
  confirmed: { label: '✅ Confirmado', classes: 'border-yellow-700 bg-yellow-900/40 text-yellow-300' },
  on_the_way: { label: '🛵 En camino', classes: 'border-green-700 bg-green-900/40 text-green-300' },
  ready: { label: '🍽️ Preparado', classes: 'border-green-700 bg-green-900/40 text-green-300' },
  completed: { label: '🎉 Entregado', classes: 'border-slate-700 bg-slate-900/40 text-slate-300' },
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
