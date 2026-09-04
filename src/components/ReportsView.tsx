import React, { useState } from 'react';
import { CustomerInteraction } from '../types';
import {
  PeriodFilterType,
  filterInteractionsByPeriod,
  calculateConsolidatedMetrics,
  getOriginBreakdown,
  getCampaignBreakdown,
  getProductBreakdown,
  formatCurrency,
  formatPercent,
  getReferenceDate,
} from '../utils/analytics';
import { exportInteractionsToCSV, printExecutiveReport } from '../utils/exportUtils';
import { STATUS_CONFIG } from '../utils/defaults';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Search,
} from 'lucide-react';

interface ReportsViewProps {
  interactions: CustomerInteraction[];
  storeName: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ interactions, storeName }) => {
  const [period, setPeriod] = useState<PeriodFilterType>('this_month');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-09-04');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const refDate = getReferenceDate();

  const activeItems = filterInteractionsByPeriod(interactions, period, customStart, customEnd, refDate);
  const metrics = calculateConsolidatedMetrics(activeItems);

  const origins = getOriginBreakdown(activeItems);
  const campaigns = getCampaignBreakdown(activeItems);
  const products = getProductBreakdown(activeItems);

  const filteredItems = activeItems.filter((item) => {
    if (tableFilter !== 'all' && item.status !== tableFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.customerName?.toLowerCase().includes(q) ||
        item.product.toLowerCase().includes(q) ||
        item.campaign.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q) ||
        item.sellerName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return 'Hoje (04/09/2026)';
      case 'last_7_days':
        return 'Últimos 7 dias';
      case 'this_month':
        return 'Este mês (Setembro de 2026)';
      case 'last_month':
        return 'Mês anterior (Agosto de 2026)';
      case 'last_30_days':
        return 'Últimos 30 dias';
      case 'custom':
        return `Período Personalizado (${customStart} a ${customEnd})`;
    }
  };

  const handleExportCSV = () => {
    const filename = `relatorio-atendimentos-${period}-${refDate}.csv`;
    exportInteractionsToCSV(activeItems, filename);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Relatórios Gerenciais de Atendimento & Vendas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Demonstrativo analítico completo para suporte à tomada de decisão executiva
          </p>
        </div>

        {/* Action Buttons: Export Excel / CSV & Print / PDF */}
        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel / CSV</span>
          </button>

          <button
            id="btn-print-pdf"
            onClick={printExecutiveReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Period Selection Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Selecionar Período de Análise:</span>
          </span>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'today', label: 'Hoje' },
              { id: 'last_7_days', label: 'Últimos 7 dias' },
              { id: 'this_month', label: 'Este mês (Set/26)' },
              { id: 'last_month', label: 'Mês anterior (Ago/26)' },
              { id: 'last_30_days', label: 'Últimos 30 dias' },
              { id: 'custom', label: 'Período personalizado' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as PeriodFilterType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  period === p.id
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range */}
        {period === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-600">Intervalo de datas:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-slate-800"
            />
            <span className="text-slate-400">até</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-slate-800"
            />
          </div>
        )}
      </div>

      {/* PRINT HEADER: Appears cleanly on PDF/Print */}
      <div className="hidden print:block p-4 border-b-2 border-slate-900 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900">{storeName}</h1>
            <h2 className="text-sm font-bold text-slate-600">
              Relatório Executivo de Atendimentos, Campanhas e Vendas
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Período: <strong>{getPeriodLabel()}</strong> | Emitido em: 04/09/2026
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <span>Sales Analytics v2.4</span>
          </div>
        </div>
      </div>

      {/* PAINEL EXECUTIVO: Indicadores Consolidados do Período */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sumário Executivo • {getPeriodLabel()}
            </h2>
            <p className="text-xs text-slate-400">
              Total consolidado de {activeItems.length} atendimentos registrados
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
            Faturamento: {formatCurrency(metrics.totalRevenue)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Atendimentos
            </span>
            <span className="text-xl font-black text-slate-800">{metrics.totalClients}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">100% fluxo</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Vendas
            </span>
            <span className="text-xl font-black text-emerald-700">{metrics.salesCount}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Fechadas</span>
          </div>
          <div className="p-3 bg-indigo-600 rounded-xl shadow-xs text-white">
            <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">
              Conversão
            </span>
            <span className="text-xl font-black italic">
              {formatPercent(metrics.conversionRate)}
            </span>
            <span className="text-[10px] text-indigo-100 block mt-0.5 opacity-80">Vendas/Visitas</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
              Negociação
            </span>
            <span className="text-xl font-black text-amber-700">{metrics.negotiatingCount}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">
              {formatPercent(metrics.negotiatingRate)}
            </span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block">
              Desistências
            </span>
            <span className="text-xl font-black text-rose-700">{metrics.lostCount}</span>
            <span className="text-[10px] text-rose-600 block mt-0.5">
              {formatPercent(metrics.lostRate)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Faturamento
            </span>
            <span className="text-base font-black text-slate-800 truncate block">
              {formatCurrency(metrics.totalRevenue)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Total bruto</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Ticket Médio
            </span>
            <span className="text-base font-black text-slate-800 truncate block">
              {formatCurrency(metrics.averageTicket)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Por venda</span>
          </div>
        </div>
      </div>

      {/* ANÁLISE TRIANGULAR: Origens x Campanhas x Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela Origens */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Resultados por Origem</span>
            <span className="text-slate-400 text-[10px] font-mono">{origins.length} canais</span>
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {origins.slice(0, 6).map((item) => (
              <div key={item.origin} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{item.origin}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {item.total} atend. • {item.vendas} vendas
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-mono">
                    {item.taxa}% conv.
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    {formatCurrency(item.faturamento)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela Campanhas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Resultados por Campanha</span>
            <span className="text-slate-400 text-[10px] font-mono">{campaigns.length} ações</span>
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {campaigns.slice(0, 6).map((item) => (
              <div key={item.campaign} className="py-2.5 flex items-center justify-between">
                <div className="max-w-[150px] truncate">
                  <span className="font-semibold text-slate-800" title={item.campaign}>
                    {item.campaign}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {item.total} atend. • {item.vendas} vendas
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-mono">
                    {item.taxa}% conv.
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    {formatCurrency(item.faturamento)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela Produtos / Móveis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Demanda por Móvel / Categoria</span>
            <span className="text-slate-400 text-[10px] font-mono">{products.length} móveis</span>
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {products.slice(0, 6).map((item) => (
              <div key={item.product} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{item.product}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {item.total} visitas • {item.vendas} vendas
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 block font-mono">
                    {formatCurrency(item.faturamento)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Ticket: {formatCurrency(item.vendas > 0 ? item.faturamento / item.vendas : 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REGISTROS COMPLETOS: Tabela Analítica Detalhada */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
              Registros Analíticos do Período ({filteredItems.length})
            </h3>
            <p className="text-xs text-slate-400">Listagem completa e auditável de cada atendimento</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-52"
              />
            </div>

            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">Todos os status</option>
              <option value="venda_realizada">Venda realizada</option>
              <option value="em_negociacao">Em negociação</option>
              <option value="desistiu">Desistiu</option>
              <option value="sem_interesse">Sem interesse</option>
              <option value="retorno_futuro">Retorno futuro</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Data / Hora</th>
                <th className="py-2.5 px-4">Cliente</th>
                <th className="py-2.5 px-4">Origem</th>
                <th className="py-2.5 px-4">Campanha</th>
                <th className="py-2.5 px-4">Móvel de Interesse</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Valor Venda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado no período selecionado.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const conf = STATUS_CONFIG[item.status];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {item.date.split('-')[2]}/{item.date.split('-')[1]} • {item.time}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {item.customerName || 'Cliente Balcão'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{item.origin}</td>
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{item.campaign}</td>
                      <td className="py-2.5 px-4 text-slate-800 font-semibold whitespace-nowrap">
                        {item.product}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conf.badgeClass}`}
                        >
                          {conf.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        {item.saleValue ? (
                          <span className="text-emerald-600">{formatCurrency(item.saleValue)}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
