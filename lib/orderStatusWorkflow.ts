import { OrderStatus } from '@/types';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed'],
  confirmed: ['on_the_way', 'ready'],
  on_the_way: ['completed'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
}

export function canTransitionStatus(from: OrderStatus, to: OrderStatus): boolean {
  return getNextStatuses(from).includes(to);
}
