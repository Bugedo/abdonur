'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminStatsBranchRow, AdminStatsData, AdminStatsFilters, Branch } from '@/types';

interface AdminStatsDashboardProps {
  title: string;
  stats: AdminStatsData;
  filters: AdminStatsFilters;
  branches?: Branch[];
  showBranchFilter?: boolean;
}

const presetLabel: Record<AdminStatsFilters['preset'], string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  last7: '7 dias',
  last30: '30 dias',
  month: 'Mes',
  custom: 'Personalizado',
};

const statusLabel: Record<string, string> = {
  new: 'Nuevo',
  confirmed: 'Confirmado',
  on_the_way: 'En camino',
  ready: 'Preparado',
  completed: 'Entregado',
  cancelled: 'Cancelado',
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

function deltaText(current: number, previous: number, suffix = '') {
  if (previous === 0) return 'sin comparativa';
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%${suffix}`;
}

export default function AdminStatsDashboard({
  title,
  stats,
  filters,
  branches = [],
  showBranchFilter = false,
}: AdminStatsDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fromInput, setFromInput] = useState(filters.fromInput);
  const [toInput, setToInput] = useState(filters.toInput);

  const statusChartData = useMemo(
    () =>
      stats.statusRows.map((row) => ({
        name: statusLabel[row.status] ?? row.status,
        orders: row.orders,
        sales: Math.round(row.sales),
      })),
    [stats.statusRows]
  );

  function pushFilters(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value.length === 0) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function applyPreset(preset: AdminStatsFilters['preset']) {
    const update: Record<string, string | undefined> = { preset };
    if (preset !== 'custom') {
      update.from = undefined;
      update.to = undefined;
    }
    pushFilters(update);
  }

  function applyCustomRange(e: React.FormEvent) {
    e.preventDefault();
    pushFilters({ preset: 'custom', from: fromInput, to: toInput });
  }

  function onBranchChange(branchId: string) {
    pushFilters({ branchId: branchId === 'all' ? undefined : branchId });
  }

  return (
    <section className="mt-6 rounded-2xl border border-surface-600 bg-surface-800 p-5">
      <h2 className="text-xl font-extrabold text-white">{title}</h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(Object.keys(presetLabel) as AdminStatsFilters['preset'][]).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => applyPreset(preset)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              filters.preset === preset
                ? 'border-brand-500 bg-brand-900/40 text-brand-300'
                : 'border-surface-500 text-stone-300 hover:bg-surface-700'
            }`}
          >
            {presetLabel[preset]}
          </button>
        ))}

        {showBranchFilter && (
          <select
            value={filters.branchId ?? 'all'}
            onChange={(e) => onBranchChange(e.target.value)}
            className="ml-auto rounded-lg border border-surface-500 bg-surface-700 px-3 py-1.5 text-xs text-white"
          >
            <option value="all">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <form onSubmit={applyCustomRange} className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs text-stone-400">
          Desde
          <input
            type="date"
            value={fromInput}
            onChange={(e) => setFromInput(e.target.value)}
            className="mt-1 block rounded-lg border border-surface-500 bg-surface-700 px-3 py-1.5 text-xs text-white"
          />
        </label>
        <label className="text-xs text-stone-400">
          Hasta
          <input
            type="date"
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            className="mt-1 block rounded-lg border border-surface-500 bg-surface-700 px-3 py-1.5 text-xs text-white"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-brand-600 bg-brand-900/30 px-3 py-1.5 text-xs font-semibold text-brand-300 hover:bg-brand-900/50"
        >
          Aplicar rango
        </button>
      </form>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Ventas netas"
          value={formatMoney(stats.current.netSales)}
          delta={deltaText(stats.current.netSales, stats.previous.netSales)}
        />
        <KpiCard
          label="Pedidos creados"
          value={stats.current.createdOrders.toString()}
          delta={deltaText(stats.current.createdOrders, stats.previous.createdOrders)}
        />
        <KpiCard
          label="Ticket promedio"
          value={formatMoney(stats.current.averageOrderValue)}
          delta={deltaText(stats.current.averageOrderValue, stats.previous.averageOrderValue)}
        />
        <KpiCard
          label="Cancelacion"
          value={formatPct(stats.current.cancellationRate)}
          delta={deltaText(stats.current.cancellationRate, stats.previous.cancellationRate)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Ventas y pedidos por dia">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="label" tick={{ fill: '#a8a29e', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: '#a8a29e', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a8a29e', fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sales" name="Ventas" stroke="#f59e0b" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Pedidos" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribucion por estado">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 11 }} />
              <YAxis tick={{ fill: '#a8a29e', fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" name="Pedidos" fill="#3b82f6" />
              <Bar dataKey="sales" name="Ventas" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Mix de pagos y entrega">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.paymentRows} dataKey="orders" nameKey="label" cx="50%" cy="50%" outerRadius={70} fill="#22c55e" />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.deliveryRows} dataKey="orders" nameKey="label" cx="50%" cy="50%" outerRadius={70} fill="#8b5cf6" />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top productos (por ventas)">
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-stone-400">
                <tr>
                  <th className="py-1">Producto</th>
                  <th className="py-1 text-right">Cant.</th>
                  <th className="py-1 text-right">Ventas</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((row) => (
                  <tr key={row.productName} className="border-t border-surface-600 text-stone-200">
                    <td className="py-1.5">{row.productName}</td>
                    <td className="py-1.5 text-right">{row.quantity}</td>
                    <td className="py-1.5 text-right">{formatMoney(row.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {stats.branchRows && stats.branchRows.length > 0 && (
        <div className="mt-5 rounded-xl border border-surface-600 bg-surface-900/50 p-3">
          <h3 className="text-sm font-bold text-white">Separado por sucursal</h3>
          <div className="mt-2 max-h-64 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-stone-400">
                <tr>
                  <th className="py-1">Sucursal</th>
                  <th className="py-1 text-right">Pedidos</th>
                  <th className="py-1 text-right">Ventas</th>
                </tr>
              </thead>
              <tbody>
                {stats.branchRows.map((row: AdminStatsBranchRow) => (
                  <tr key={row.branchId} className="border-t border-surface-600 text-stone-200">
                    <td className="py-1.5">{row.branchName}</td>
                    <td className="py-1.5 text-right">{row.orders}</td>
                    <td className="py-1.5 text-right">{formatMoney(row.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function KpiCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-xl border border-surface-600 bg-surface-900/60 p-3">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs text-stone-400">{delta}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-600 bg-surface-900/60 p-3">
      <h3 className="mb-2 text-sm font-bold text-white">{title}</h3>
      {children}
    </div>
  );
}
