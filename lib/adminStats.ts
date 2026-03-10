import { supabaseAdmin } from '@/lib/supabaseServer';
import {
  AdminStatsBreakdownRow,
  AdminStatsBranchRow,
  AdminStatsData,
  AdminStatsFilters,
  AdminStatsKpis,
  AdminStatsRangePreset,
  AdminStatsStatusRow,
  AdminStatsTopProductRow,
  OrderStatus,
} from '@/types';

type StatsOrderRow = {
  id: string;
  branch_id: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  delivery_method: 'pickup' | 'delivery';
  payment_method: 'cash' | 'transfer';
  branches?: { name: string } | { name: string }[];
};

type StatsItemRow = {
  quantity: number;
  unit_price: number;
  products?: { name: string } | { name: string }[];
  orders?: { branch_id: string; created_at: string; status: OrderStatus } | { branch_id: string; created_at: string; status: OrderStatus }[];
};

function firstRelation<T>(value: T | T[] | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function toLocalDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function getRangeFromPreset(preset: AdminStatsRangePreset, now: Date) {
  const today = startOfDay(now);
  if (preset === 'today') {
    return { from: today, to: endOfDay(now) };
  }
  if (preset === 'yesterday') {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { from: startOfDay(y), to: endOfDay(y) };
  }
  if (preset === 'last7') {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from, to: endOfDay(now) };
  }
  if (preset === 'last30') {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from, to: endOfDay(now) };
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: startOfDay(monthStart), to: endOfDay(now) };
}

export function parseAdminStatsFilters(
  raw: Record<string, string | string[] | undefined>,
  opts?: { branchId?: string }
): AdminStatsFilters {
  const now = new Date();
  const presetRaw = typeof raw.preset === 'string' ? raw.preset : 'today';
  const preset: AdminStatsRangePreset =
    presetRaw === 'today' ||
    presetRaw === 'yesterday' ||
    presetRaw === 'last7' ||
    presetRaw === 'last30' ||
    presetRaw === 'month' ||
    presetRaw === 'custom'
      ? presetRaw
      : 'today';

  const defaultRange = getRangeFromPreset(preset === 'custom' ? 'today' : preset, now);
  const fromInputRaw = typeof raw.from === 'string' ? raw.from : toLocalDateInput(defaultRange.from);
  const toInputRaw = typeof raw.to === 'string' ? raw.to : toLocalDateInput(defaultRange.to);

  let from = defaultRange.from;
  let to = defaultRange.to;

  if (preset === 'custom') {
    const parsedFrom = new Date(`${fromInputRaw}T00:00:00`);
    const parsedTo = new Date(`${toInputRaw}T23:59:59.999`);
    if (!Number.isNaN(parsedFrom.getTime()) && !Number.isNaN(parsedTo.getTime())) {
      from = parsedFrom;
      to = parsedTo;
    }
  }

  const branchId = typeof raw.branchId === 'string' && raw.branchId !== 'all' ? raw.branchId : opts?.branchId;

  return {
    preset,
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    fromInput: toLocalDateInput(from),
    toInput: toLocalDateInput(to),
    branchId,
  };
}

function getPreviousRange(current: AdminStatsFilters) {
  const fromMs = new Date(current.fromIso).getTime();
  const toMs = new Date(current.toIso).getTime();
  const span = Math.max(1, toMs - fromMs);
  const prevTo = new Date(fromMs - 1);
  const prevFrom = new Date(fromMs - span);
  return { fromIso: prevFrom.toISOString(), toIso: prevTo.toISOString() };
}

async function fetchOrdersRange(params: { fromIso: string; toIso: string; branchId?: string; branchIds?: string[] }) {
  let query = supabaseAdmin
    .from('orders')
    .select('id, branch_id, total_price, status, created_at, delivery_method, payment_method, branches(name)')
    .gte('created_at', params.fromIso)
    .lte('created_at', params.toIso)
    .order('created_at', { ascending: true });

  if (params.branchIds && params.branchIds.length > 0) {
    query = query.in('branch_id', params.branchIds);
  } else if (params.branchId) {
    query = query.eq('branch_id', params.branchId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching orders stats:', error.message);
    return [] as StatsOrderRow[];
  }
  return ((data ?? []) as unknown) as StatsOrderRow[];
}

async function fetchItemsRange(params: { fromIso: string; toIso: string; branchId?: string; branchIds?: string[] }) {
  let query = supabaseAdmin
    .from('order_items')
    .select('quantity, unit_price, products(name), orders!inner(branch_id, created_at, status)')
    .gte('orders.created_at', params.fromIso)
    .lte('orders.created_at', params.toIso);

  if (params.branchIds && params.branchIds.length > 0) {
    query = query.in('orders.branch_id', params.branchIds);
  } else if (params.branchId) {
    query = query.eq('orders.branch_id', params.branchId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching order item stats:', error.message);
    return [] as StatsItemRow[];
  }
  return ((data ?? []) as unknown) as StatsItemRow[];
}

function emptyKpis(): AdminStatsKpis {
  return {
    netSales: 0,
    createdOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
    averageOrderValue: 0,
    cancellationRate: 0,
    averageActiveMinutes: 0,
    activeSlaRate: 0,
  };
}

function aggregateKpis(orders: StatsOrderRow[]): AdminStatsKpis {
  if (orders.length === 0) return emptyKpis();

  const createdOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
  const activeOrdersList = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const activeOrders = activeOrdersList.length;
  const netSales = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_price, 0);
  const averageOrderValue = completedOrders > 0 ? netSales / completedOrders : 0;
  const cancellationRate = createdOrders > 0 ? (cancelledOrders / createdOrders) * 100 : 0;

  const nowMs = Date.now();
  const activeAges = activeOrdersList.map((o) => (nowMs - new Date(o.created_at).getTime()) / 60000);
  const averageActiveMinutes = activeAges.length > 0 ? activeAges.reduce((s, x) => s + x, 0) / activeAges.length : 0;

  const activeSlaCompliant = activeAges.filter((m) => m <= 40).length;
  const activeSlaRate = activeOrders > 0 ? (activeSlaCompliant / activeOrders) * 100 : 100;

  return {
    netSales,
    createdOrders,
    completedOrders,
    activeOrders,
    averageOrderValue,
    cancellationRate,
    averageActiveMinutes,
    activeSlaRate,
  };
}

function aggregateTimeSeries(orders: StatsOrderRow[]) {
  const bucket = new Map<string, { label: string; sales: number; orders: number; cancelled: number }>();
  for (const order of orders) {
    const date = new Date(order.created_at);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
    const prev = bucket.get(key) ?? { label: key, sales: 0, orders: 0, cancelled: 0 };
    prev.orders += 1;
    if (order.status !== 'cancelled') prev.sales += order.total_price;
    if (order.status === 'cancelled') prev.cancelled += 1;
    bucket.set(key, prev);
  }
  return [...bucket.values()];
}

function aggregateStatusRows(orders: StatsOrderRow[]): AdminStatsStatusRow[] {
  const statuses: OrderStatus[] = ['new', 'confirmed', 'on_the_way', 'ready', 'completed', 'cancelled'];
  return statuses.map((status) => {
    const list = orders.filter((o) => o.status === status);
    return {
      status,
      orders: list.length,
      sales: list.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_price, 0),
    };
  });
}

function aggregateTopProducts(items: StatsItemRow[]): AdminStatsTopProductRow[] {
  const map = new Map<string, AdminStatsTopProductRow>();
  for (const item of items) {
    const name = firstRelation(item.products)?.name ?? 'Producto';
    const prev = map.get(name) ?? { productName: name, quantity: 0, sales: 0 };
    prev.quantity += item.quantity;
    prev.sales += item.quantity * item.unit_price;
    map.set(name, prev);
  }
  return [...map.values()].sort((a, b) => b.sales - a.sales).slice(0, 8);
}

function aggregateBreakdown(
  orders: StatsOrderRow[],
  key: 'payment_method' | 'delivery_method',
  labels: Record<string, string>
): AdminStatsBreakdownRow[] {
  const map = new Map<string, number>();
  for (const order of orders) {
    const raw = order[key] as string;
    map.set(raw, (map.get(raw) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label: labels[label] ?? label, orders: count }));
}

function aggregateBranchRows(orders: StatsOrderRow[]): AdminStatsBranchRow[] {
  const map = new Map<string, AdminStatsBranchRow>();
  for (const order of orders) {
    const prev = map.get(order.branch_id) ?? {
      branchId: order.branch_id,
      branchName: firstRelation(order.branches)?.name ?? 'Sucursal',
      orders: 0,
      sales: 0,
    };
    prev.orders += 1;
    if (order.status !== 'cancelled') prev.sales += order.total_price;
    map.set(order.branch_id, prev);
  }
  return [...map.values()].sort((a, b) => b.sales - a.sales);
}

export async function getAdminStatsData(
  filters: AdminStatsFilters,
  opts?: { includeBranchRows?: boolean; branchIds?: string[] }
): Promise<AdminStatsData> {
  const prev = getPreviousRange(filters);

  const [currentOrders, previousOrders, currentItems] = await Promise.all([
    fetchOrdersRange({ ...filters, branchIds: opts?.branchIds }),
    fetchOrdersRange({ fromIso: prev.fromIso, toIso: prev.toIso, branchId: filters.branchId, branchIds: opts?.branchIds }),
    fetchItemsRange({ ...filters, branchIds: opts?.branchIds }),
  ]);

  return {
    current: aggregateKpis(currentOrders),
    previous: aggregateKpis(previousOrders),
    timeSeries: aggregateTimeSeries(currentOrders),
    statusRows: aggregateStatusRows(currentOrders),
    topProducts: aggregateTopProducts(currentItems),
    paymentRows: aggregateBreakdown(currentOrders, 'payment_method', {
      cash: 'Efectivo',
      transfer: 'Transferencia',
    }),
    deliveryRows: aggregateBreakdown(currentOrders, 'delivery_method', {
      pickup: 'Retiro',
      delivery: 'Delivery',
    }),
    branchRows: opts?.includeBranchRows ? aggregateBranchRows(currentOrders) : undefined,
  };
}
