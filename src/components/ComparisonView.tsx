import React, { useState } from 'react';
import { CustomerInteraction } from '../types';
import {
  PeriodFilterType,
  filterInteractionsByPeriod,
  calculateConsolidatedMetrics,
  formatCurrency,
  formatPercent,
  getReferenceDate,
} from '../utils/analytics';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  GitCompare,
} from 'lucide-react';

interface ComparisonViewProps {
  interactions: CustomerInteraction[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ interactions }) => {
  const [periodA, setPeriodA] = useState<PeriodFilterType>('this_month');
  const [periodB, setPeriodB] = useState<PeriodFilterType>('last_month');
  const [customStartA, setCustomStartA] = useState('2026-09-01');
  const [customEndA, setCustomEndA] = useState('2026-09-04');
  const [customStartB, setCustomStartB] = useState('2026-08-01');
  const [customEndB, setCustomEndB] = useState('2026-08-31');

  const refDate = getReferenceDate();

  const getLabel = (p: PeriodFilterType) => {
    switch (p) {
      case 'today':
        return 'Hoje (04/09)';
      case 'last_7_days':
        return 'Últimos 7 dias';
      case 'this_month':
        return 'Este Mês (Set/26)';
      case 'last_month':
        return 'Mês Anterior (Ago/26)';
      case 'last_30_days':
        return 'Últimos 30 dias';
      case 'custom':
        return 'Personalizado';
    }
  };

  const itemsA = filterInteractionsByPeriod(interactions, periodA, customStartA, customEndA, refDate);
  const itemsB = filterInteractionsByPeriod(interactions, periodB, customStartB, customEndB, refDate);

  const metricsA = calculateConsolidatedMetrics(itemsA);
  const metricsB = calculateConsolidatedMetrics(itemsB);

  // Helper calculation for delta
  const getDelta = (valA: number, valB: number) => {
    const diff = valA - valB;
    const percent = valB > 0 ? ((diff / valB) * 100).toFixed(1) : diff > 0 ? '+100' : '0';
    return {
      diff,
      percent,
      isPositive: diff >= 0,
    };
  };

  const deltaClients = getDelta(metricsA.totalClients, metricsB.totalClients);
  const deltaSales = getDelta(metricsA.salesCount, metricsB.salesCount);
  const deltaConversion = {
    diff: metricsA.conversionRate - metricsB.conversionRate,
    isPositive: metricsA.conversionRate >= metricsB.conversionRate,
  };
  const deltaRevenue = getDelta(metricsA.totalRevenue, metricsB.totalRevenue);
  const deltaTicket = getDelta(metricsA.averageTicket, metricsB.averageTicket);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GitCompare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Comparação de Períodos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare o fluxo de clientes, vendas, taxa de conversão e faturamento entre dois momentos
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Period A */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Período A (Base Recente)
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono">
              {itemsA.length} atendimentos
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'today', label: 'Hoje' },
              { id: 'last_7_days', label: '7 Dias' },
              { id: 'this_month', label: 'Este Mês (Set)' },
              { id: 'custom', label: 'Personalizado' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodA(p.id as PeriodFilterType)}
                className={`px-3 py-1 text-xs rounded-md font-semibold ${
                  periodA === p.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period B */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Período B (Comparativo / Histórico)
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold font-mono">
              {itemsB.length} atendimentos
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'last_month', label: 'Mês Passado (Ago)' },
              { id: 'last_30_days', label: 'Últimos 30d' },
              { id: 'custom', label: 'Personalizado' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodB(p.id as PeriodFilterType)}
                className={`px-3 py-1 text-xs rounded-md font-semibold ${
                  periodB === p.id
                    ? 'bg-[#0F172A] text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Atendimentos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Clientes que Chegaram
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800">{metricsA.totalClients}</span>
            <span className="text-sm font-semibold text-slate-400 font-mono">vs {metricsB.totalClients}</span>
          </div>
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-bold ${
              deltaClients.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {deltaClients.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {deltaClients.isPositive ? '+' : ''}
              {deltaClients.diff} ({deltaClients.percent}%)
            </span>
          </div>
        </div>

        {/* Vendas Fechadas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Vendas Fechadas
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800">{metricsA.salesCount}</span>
            <span className="text-sm font-semibold text-slate-400 font-mono">vs {metricsB.salesCount}</span>
          </div>
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-bold ${
              deltaSales.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {deltaSales.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {deltaSales.isPositive ? '+' : ''}
              {deltaSales.diff} ({deltaSales.percent}%)
            </span>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Taxa de Conversão
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">
              {formatPercent(metricsA.conversionRate)}
            </span>
            <span className="text-sm font-semibold text-slate-400 font-mono">
              vs {formatPercent(metricsB.conversionRate)}
            </span>
          </div>
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-bold ${
              deltaConversion.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {deltaConversion.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {deltaConversion.diff >= 0 ? '+' : ''}
              {deltaConversion.diff.toFixed(1)} p.p.
            </span>
          </div>
        </div>

        {/* Faturamento */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Faturamento Bruto
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-800 truncate">
              {formatCurrency(metricsA.totalRevenue)}
            </span>
          </div>
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-bold ${
              deltaRevenue.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {deltaRevenue.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {deltaRevenue.isPositive ? '+' : ''}
              {deltaRevenue.percent}%
            </span>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Ticket Médio
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-800 truncate">
              {formatCurrency(metricsA.averageTicket)}
            </span>
          </div>
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-bold ${
              deltaTicket.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {deltaTicket.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {deltaTicket.isPositive ? '+' : ''}
              {deltaTicket.percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Detail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
            Tabela Comparativa Direta: {getLabel(periodA)} vs {getLabel(periodB)}
          </h3>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Indicador de Desempenho</th>
              <th className="py-2.5 px-4 text-center font-bold text-indigo-700">{getLabel(periodA)}</th>
              <th className="py-2.5 px-4 text-center font-bold text-slate-600">{getLabel(periodB)}</th>
              <th className="py-2.5 px-4 text-right">Variação Real</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Total de Clientes que Chegaram à Loja</td>
              <td className="py-3 px-4 text-center font-bold font-mono">{metricsA.totalClients}</td>
              <td className="py-3 px-4 text-center font-mono text-slate-500">{metricsB.totalClients}</td>
              <td className="py-3 px-4 text-right font-bold">
                <span className={deltaClients.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                  {deltaClients.isPositive ? '+' : ''}
                  {deltaClients.diff} ({deltaClients.percent}%)
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Vendas Realizadas (Fechamentos)</td>
              <td className="py-3 px-4 text-center font-bold font-mono">{metricsA.salesCount}</td>
              <td className="py-3 px-4 text-center font-mono text-slate-500">{metricsB.salesCount}</td>
              <td className="py-3 px-4 text-right font-bold">
                <span className={deltaSales.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                  {deltaSales.isPositive ? '+' : ''}
                  {deltaSales.diff} ({deltaSales.percent}%)
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Taxa de Conversão (% Vendas/Visitas)</td>
              <td className="py-3 px-4 text-center font-bold font-mono text-indigo-700">
                {formatPercent(metricsA.conversionRate)}
              </td>
              <td className="py-3 px-4 text-center font-mono text-slate-500">
                {formatPercent(metricsB.conversionRate)}
              </td>
              <td className="py-3 px-4 text-right font-bold">
                <span className={deltaConversion.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                  {deltaConversion.diff >= 0 ? '+' : ''}
                  {deltaConversion.diff.toFixed(1)} p.p.
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Clientes em Negociação</td>
              <td className="py-3 px-4 text-center font-bold font-mono">{metricsA.negotiatingCount}</td>
              <td className="py-3 px-4 text-center font-mono text-slate-500">{metricsB.negotiatingCount}</td>
              <td className="py-3 px-4 text-right font-bold font-mono">
                {metricsA.negotiatingCount - metricsB.negotiatingCount}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Desistências / Não Compraram</td>
              <td className="py-3 px-4 text-center font-bold font-mono">{metricsA.lostCount}</td>
              <td className="py-3 px-4 text-center font-mono text-slate-500">{metricsB.lostCount}</td>
              <td className="py-3 px-4 text-right font-bold font-mono">
                {metricsA.lostCount - metricsB.lostCount}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Faturamento Total</td>
              <td className="py-3 px-4 text-center font-bold font-mono text-emerald-700">
                {formatCurrency(metricsA.totalRevenue)}
              </td>
              <td className="py-3 px-4 text-center font-mono text-slate-500">
                {formatCurrency(metricsB.totalRevenue)}
              </td>
              <td className="py-3 px-4 text-right font-bold">
                <span className={deltaRevenue.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                  {deltaRevenue.isPositive ? '+' : ''}
                  {deltaRevenue.percent}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
