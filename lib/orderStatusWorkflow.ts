import type { OrderStatus } from '../types/index.ts';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['on_the_way', 'ready', 'cancelled'],
  on_the_way: ['completed'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

const CANCELLABLE_STATUSES: OrderStatus[] = ['new', 'confirmed'];

export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
}

export function canTransitionStatus(from: OrderStatus, to: OrderStatus): boolean {
  return getNextStatuses(from).includes(to);
}

export function canCancelOrder(status: OrderStatus): boolean {
  return CANCELLABLE_STATUSES.includes(status);
}
