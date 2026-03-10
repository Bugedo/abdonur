'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminOrderWithItems, OrderStatus } from '@/types';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import { updateOrderStatus } from '@/actions/updateOrderStatus';
import { getNextStatuses } from '@/lib/orderStatusWorkflow';

type OrdersFilter = 'all' | 'new' | 'confirmed' | 'on_the_way' | 'ready' | 'past';

interface BranchOrdersPanelProps {
  orders: AdminOrderWithItems[];
  showBranchName?: boolean;
}

const actionMetaByStatus: Record<OrderStatus, { label: string; classes: string }> = {
  new: { label: 'Nuevo', classes: '' },
  confirmed: { label: 'Confirmar', classes: 'border-yellow-700 text-yellow-300 hover:bg-yellow-900/30' },
  on_the_way: { label: 'En camino', classes: 'border-emerald-700 text-emerald-300 hover:bg-emerald-900/30' },
  ready: { label: 'Preparado', classes: 'border-green-700 text-green-300 hover:bg-green-900/30' },
  completed: { label: 'Entregado', classes: 'border-slate-600 text-slate-300 hover:bg-slate-800/50' },
  cancelled: { label: 'Cancelado', classes: 'border-red-700 text-red-300 hover:bg-red-900/30' },
};

function formatDate(date: string) {
  return new Date(date).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
}

type TimerLevel = 'green' | 'yellow' | 'red';

function getElapsedMs(createdAt: string, nowMs: number) {
  const createdMs = new Date(createdAt).getTime();
  return Math.max(0, nowMs - createdMs);
}

function getTimerLevel(elapsedMs: number): TimerLevel {
  const elapsedMinutes = elapsedMs / 60000;
  if (elapsedMinutes < 20) return 'green';
  if (elapsedMinutes < 40) return 'yellow';
  return 'red';
}

function formatElapsed(elapsedMs: number) {
  // Business rule: stop counting after 60 minutes.
  const cappedSeconds = Math.min(60 * 60, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(cappedSeconds / 3600);
  const minutes = Math.floor((cappedSeconds % 3600) / 60);
  const seconds = cappedSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function BranchOrdersPanel({ orders, showBranchName = false }: BranchOrdersPanelProps) {
  const router = useRouter();
  const soundsAllowed = !showBranchName;
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [errorsByOrder, setErrorsByOrder] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<OrdersFilter>('all');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [soundEnabled, setSoundEnabled] = useState(soundsAllowed);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastBeepKeyRef = useRef<string | null>(null);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedOrdersRef = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const getAudioContext = useCallback(() => {
    if (!soundEnabled || !soundsAllowed) return null;
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = audioContextRef.current ?? new AudioCtx();
    audioContextRef.current = ctx;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    return ctx;
  }, [soundEnabled, soundsAllowed]);

  const playTimerBeep = useCallback(() => {
    if (!soundEnabled || !soundsAllowed) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;

    const startAt = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.18);
  }, [getAudioContext, soundEnabled, soundsAllowed]);

  const playNewOrderSound = useCallback(() => {
    if (!soundEnabled || !soundsAllowed) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [1046, 1318];
    const base = ctx.currentTime;

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = freq;

      const startAt = base + index * 0.2;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.09, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.16);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.16);
    });
  }, [getAudioContext, soundEnabled, soundsAllowed]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [orders]
  );

  const counters = useMemo(() => {
    const newCount = sortedOrders.filter((o) => o.status === 'new').length;
    const confirmedCount = sortedOrders.filter((o) => o.status === 'confirmed').length;
    const onTheWayCount = sortedOrders.filter((o) => o.status === 'on_the_way').length;
    const readyCount = sortedOrders.filter((o) => o.status === 'ready').length;
    const pastCount = sortedOrders.filter((o) => o.status === 'completed' || o.status === 'cancelled').length;
    return {
      all: sortedOrders.length - pastCount,
      new: newCount,
      confirmed: confirmedCount,
      on_the_way: onTheWayCount,
      ready: readyCount,
      past: pastCount,
    };
  }, [sortedOrders]);

  const visibleOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return sortedOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
    }
    if (activeFilter === 'past') {
      return sortedOrders.filter((o) => o.status === 'completed' || o.status === 'cancelled');
    }
    return sortedOrders.filter((o) => o.status === activeFilter);
  }, [activeFilter, sortedOrders]);

  useEffect(() => {
    if (!soundEnabled || !soundsAllowed) return;

    const activeOrders = sortedOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
    if (activeOrders.length === 0) return;

    const highestLevel = activeOrders.reduce<TimerLevel>((current, order) => {
      const level = getTimerLevel(getElapsedMs(order.created_at, nowMs));
      if (level === 'red') return 'red';
      if (level === 'yellow' && current === 'green') return 'yellow';
      return current;
    }, 'green');

    if (highestLevel === 'green') return;

    const second = Math.floor(nowMs / 1000) % 60;
    const minuteBucket = Math.floor(nowMs / 60000);
    const slot = highestLevel === 'red' ? Math.floor(second / 20) : 0;
    const shouldBeep = highestLevel === 'yellow' ? second === 0 : second % 20 === 0;

    if (!shouldBeep) return;

    const beepKey = `${highestLevel}-${minuteBucket}-${slot}`;
    if (lastBeepKeyRef.current === beepKey) return;
    lastBeepKeyRef.current = beepKey;
    playTimerBeep();
  }, [nowMs, sortedOrders, soundEnabled, playTimerBeep, soundsAllowed]);

  // Auto-refresh so new orders enter without manual F5.
  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      router.refresh();
    }, 5000);
    return () => window.clearInterval(refreshTimer);
  }, [router]);

  // Detect new orders and play a distinct notification sound.
  useEffect(() => {
    const currentIds = new Set(sortedOrders.map((order) => order.id));
    if (!hasInitializedOrdersRef.current) {
      knownOrderIdsRef.current = currentIds;
      hasInitializedOrdersRef.current = true;
      return;
    }

    const hasNewOrder = sortedOrders.some((order) => !knownOrderIdsRef.current.has(order.id));
    if (hasNewOrder) {
      playNewOrderSound();
    }
    knownOrderIdsRef.current = currentIds;
  }, [sortedOrders, playNewOrderSound]);

  async function onChangeStatus(orderId: string, nextStatus: OrderStatus) {
    setLoadingOrderId(orderId);
    setErrorsByOrder((prev) => ({ ...prev, [orderId]: '' }));

    const result = await updateOrderStatus(orderId, nextStatus);
    if (!result.success) {
      setErrorsByOrder((prev) => ({
        ...prev,
        [orderId]: result.error ?? 'No se pudo actualizar el pedido.',
      }));
    }

    setLoadingOrderId(null);
  }

  if (orders.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-surface-500 bg-surface-800 p-12 text-center text-stone-500">
        <p>No hay pedidos todavía.</p>
      </div>
    );
  }

  const filters: { key: OrdersFilter; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'new', label: 'Nuevo' },
    { key: 'confirmed', label: 'Confirmado' },
    { key: 'on_the_way', label: 'En camino' },
    { key: 'ready', label: 'Preparado' },
    { key: 'past', label: 'Pedidos pasados' },
  ];

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Referencia de colores</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-stone-300 bg-stone-100 px-2.5 py-1 font-semibold text-stone-900">
            Nuevo (blanco)
          </span>
          <span className="rounded-full border border-yellow-700 bg-yellow-900/40 px-2.5 py-1 font-semibold text-yellow-300">
            Confirmado (amarillo)
          </span>
          <span className="rounded-full border border-green-700 bg-green-900/40 px-2.5 py-1 font-semibold text-green-300">
            En camino / Preparado (verde)
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900/40 px-2.5 py-1 font-semibold text-slate-300">
            Entregado (pasado)
          </span>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              activeFilter === filter.key
                ? 'border-brand-500 bg-brand-900/40 text-brand-300'
                : 'border-surface-500 text-stone-300 hover:bg-surface-700'
            }`}
          >
            {filter.label} ({counters[filter.key]})
          </button>
        ))}
        </div>
        {soundsAllowed && (
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
              soundEnabled
                ? 'border-emerald-700 bg-emerald-900/30 text-emerald-300'
                : 'border-surface-500 text-stone-300 hover:bg-surface-700'
            }`}
          >
            {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
          </button>
        )}
      </div>

      {visibleOrders.map((order) => {
        const isExpanded = expandedOrderIds.has(order.id);
        const isPast = order.status === 'completed' || order.status === 'cancelled';
        const actionsForOrder = getNextStatuses(order.status)
          .map((status) => ({
            targetStatus: status,
            ...actionMetaByStatus[status],
          }))
          .filter((action) => action.targetStatus !== 'new' && action.targetStatus !== 'cancelled');
        const cardColor =
          order.status === 'new'
            ? 'border-stone-300/50 bg-stone-100/10'
            : order.status === 'confirmed'
              ? 'border-yellow-700/60 bg-yellow-900/25'
              : order.status === 'on_the_way' || order.status === 'ready'
                ? 'border-green-700/60 bg-green-900/25'
                : 'border-surface-600 bg-surface-800';

        return (
          <article
            key={order.id}
            onClick={() =>
              setExpandedOrderIds((prev) => {
                const next = new Set(prev);
                if (next.has(order.id)) {
                  next.delete(order.id);
                } else {
                  next.add(order.id);
                }
                return next;
              })
            }
            className={`relative cursor-pointer rounded-xl border px-4 pb-4 pt-10 transition-all hover:border-brand-600 ${cardColor}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 text-left">
                <p className="font-semibold text-white">{order.customer_name}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  #{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.created_at)}
                </p>
                {showBranchName && order.branches?.name && (
                  <p className="mt-1 text-xs font-medium text-brand-400">🏪 {order.branches.name}</p>
                )}
                <p className="mt-1 text-xs text-stone-400">
                  {order.delivery_method === 'delivery' ? '🛵 Envio a domicilio' : '🏪 Retiro en local'}
                  {' · '}
                  {order.payment_method === 'cash' ? '💵 Efectivo' : '📱 Transferencia'}
                </p>
                {order.address && <p className="mt-1 text-xs text-stone-400">📍 {order.address}</p>}
                {order.notes && <p className="mt-1 text-xs text-stone-400">📝 {order.notes}</p>}
              </div>

                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="mt-1 text-sm font-bold text-white">{formatPrice(order.total_price)}</p>
                </div>
              </div>

            {(() => {
              const elapsedMs = getElapsedMs(order.created_at, nowMs);
              const level = getTimerLevel(elapsedMs);
              const timerClasses =
                level === 'green'
                  ? 'border-emerald-700 bg-emerald-900/30 text-emerald-300'
                  : level === 'yellow'
                    ? 'border-yellow-700 bg-yellow-900/30 text-yellow-300'
                    : 'border-red-700 bg-red-900/30 text-red-300';
              return (
                <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2">
                  <p className={`inline-flex rounded-lg border px-5 py-1.5 text-xl font-extrabold tracking-wide shadow-lg ${timerClasses}`}>
                    {formatElapsed(elapsedMs)}
                  </p>
                </div>
              );
            })()}

            <div className="mt-3 flex flex-wrap gap-2">
              {actionsForOrder.map((action) => (
                <button
                  key={`${order.id}-${action.targetStatus}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onChangeStatus(order.id, action.targetStatus);
                  }}
                  disabled={loadingOrderId === order.id || isPast}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${action.classes}`}
                >
                  {loadingOrderId === order.id ? 'Actualizando...' : action.label}
                </button>
              ))}
            </div>

            {errorsByOrder[order.id] && <p className="mt-2 text-xs text-red-400">{errorsByOrder[order.id]}</p>}

            {isExpanded && (
              <div className="mt-4">
                <div className="rounded-lg border border-surface-600 bg-surface-900/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Detalle de comida</p>
                  {(order.order_items ?? []).length === 0 ? (
                    <p className="mt-2 text-sm text-stone-500">Sin items cargados.</p>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      {(order.order_items ?? []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-stone-300">
                            {item.quantity}x {item.products?.name ?? 'Producto'}
                          </span>
                          <span className="font-medium text-white">{formatPrice(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}

      {visibleOrders.length === 0 && (
        <div className="rounded-xl border border-dashed border-surface-500 bg-surface-800 p-8 text-center text-sm text-stone-500">
          No hay pedidos para el filtro seleccionado.
        </div>
      )}
    </div>
  );
}
