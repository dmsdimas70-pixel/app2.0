import React, { useState } from 'react';
import { CustomerInteraction, CustomerStatus, DaySummaryCalculated, AppSettings } from '../types';
import { STATUS_CONFIG } from '../utils/defaults';
import { formatCurrency, formatPercent } from '../utils/analytics';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Zap,
  Tag,
  Share2,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';

interface DailyViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  interactions: CustomerInteraction[];
  daySummary: DaySummaryCalculated;
  onNewInteraction: () => void;
  onEditInteraction: (interaction: CustomerInteraction) => void;
  onQuickChangeStatus: (interaction: CustomerInteraction) => void;
  onDeleteRequest: (item: CustomerInteraction) => void;
  settings: AppSettings;
  onQuickAdd: (origin: string, campaign: string, product: string) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
  setSelectedDate,
  interactions,
  daySummary,
  onNewInteraction,
  onEditInteraction,
  onQuickChangeStatus,
  onDeleteRequest,
  settings,
  onQuickAdd,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showQuickAddDrawer, setShowQuickAddDrawer] = useState(false);
  const [quickOrigin, setQuickOrigin] = useState(settings.origins[0] || 'Instagram');
  const [quickCampaign, setQuickCampaign] = useState(settings.campaigns[0] || 'Campanha de Sofá');
  const [quickProduct, setQuickProduct] = useState(settings.products[0] || 'Sofá');

  // Filter interactions for the selected date
  const dayInteractions = interactions.filter((i) => i.date === selectedDate);

  const filteredInteractions = dayInteractions.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCustomer = item.customerName?.toLowerCase().includes(q);
      const matchProduct = item.product.toLowerCase().includes(q);
      const matchCampaign = item.campaign.toLowerCase().includes(q);
      const matchOrigin = item.origin.toLowerCase().includes(q);
      const matchSeller = item.sellerName?.toLowerCase().includes(q);
      if (!matchCustomer && !matchProduct && !matchCampaign && !matchOrigin && !matchSeller) {
        return false;
      }
    }
    return true;
  });

  // Calculate origin counts for the day (subdivisão "Origem dos Atendimentos")
  const originCounts: Record<string, number> = {};
  dayInteractions.forEach((i) => {
    originCounts[i.origin] = (originCounts[i.origin] || 0) + 1;
  });

  const maxOriginCount = Math.max(1, ...Object.values(originCounts));

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickAdd(quickOrigin, quickCampaign, quickProduct);
    setShowQuickAddDrawer(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card: Title & Date Selector */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Atendimentos do Dia
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              {dayInteractions.length} {dayInteractions.length === 1 ? 'cliente' : 'clientes'} hoje
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Painel diário da vendedora: registro ágil de chegada, negociação e conversão de clientes
          </p>
        </div>

        {/* Date Selector & Primary Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Data:</span>
            <input
              id="date-picker-daily-view"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            id="btn-open-quick-add"
            onClick={() => setShowQuickAddDrawer(!showQuickAddDrawer)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Entrada Rápida</span>
          </button>

          <button
            id="btn-register-new-interaction"
            onClick={onNewInteraction}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 font-black" />
            <span>+ Novo Atendimento</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bar (Drawer toggleable) */}
      {showQuickAddDrawer && (
        <form
          onSubmit={handleQuickAddSubmit}
          className="bg-indigo-900 text-white border border-indigo-700 p-5 rounded-2xl space-y-4 shadow-lg transition-all animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>Registro Instantâneo de Balcão (Cliente na loja)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowQuickAddDrawer(false)}
              className="text-xs text-indigo-200 hover:text-white font-medium"
            >
              Fechar ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                Origem do Cliente
              </label>
              <select
                value={quickOrigin}
                onChange={(e) => setQuickOrigin(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-indigo-700 rounded-lg bg-indigo-950/80 text-white focus:ring-2 focus:ring-indigo-400"
              >
                {settings.origins.map((o) => (
                  <option key={o} value={o} className="bg-slate-900 text-white">
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                Campanha
              </label>
              <select
                value={quickCampaign}
                onChange={(e) => setQuickCampaign(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-indigo-700 rounded-lg bg-indigo-950/80 text-white focus:ring-2 focus:ring-indigo-400"
              >
                {settings.campaigns.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                Produto / Móvel
              </label>
              <select
                value={quickProduct}
                onChange={(e) => setQuickProduct(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-indigo-700 rounded-lg bg-indigo-950/80 text-white focus:ring-2 focus:ring-indigo-400"
              >
                {settings.products.map((p) => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              id="btn-submit-quick-entry"
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Registrar Chegada Agora
            </button>
          </div>
        </form>
      )}

      {/* RESUMO DO DIA: Geometric Balance KPIs Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Resumo do Dia • Indicadores em Tempo Real
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Calculado automaticamente • {selectedDate}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Card 1: Atendimentos */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Atendimentos
            </p>
            <p className="text-2xl font-black text-slate-800">{daySummary.totalClients}</p>
            <p className="text-[10px] text-indigo-600 font-bold mt-1">100% fluxo loja</p>
          </div>

          {/* Card 2: Vendas */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Vendas Fechadas
            </p>
            <p className="text-2xl font-black text-slate-800">{daySummary.salesCount}</p>
            <p className="text-[10px] text-emerald-500 font-bold mt-1">
              +{daySummary.salesCount} conc. hoje
            </p>
          </div>

          {/* Card 3: Negociação */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Negociação
            </p>
            <p className="text-2xl font-black text-slate-800">{daySummary.negotiatingCount}</p>
            <p className="text-[10px] text-amber-500 font-bold mt-1">
              {formatPercent(daySummary.negotiatingRate)} em curso
            </p>
          </div>

          {/* Card 4: Desistências */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Desistências
            </p>
            <p className="text-2xl font-black text-slate-800">{daySummary.lostCount}</p>
            <p className="text-[10px] text-rose-500 font-bold mt-1">
              {formatPercent(daySummary.lostRate)} perdas
            </p>
          </div>

          {/* Card 5: Taxa Conversão (PROMINENT GEOMETRIC BALANCE THEME CARD) */}
          <div className="bg-indigo-600 p-4 rounded-xl shadow-sm text-white flex flex-col justify-between">
            <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1">
              Taxa Conversão
            </p>
            <p className="text-2xl font-black italic">{formatPercent(daySummary.conversionRate)}</p>
            <p className="text-[10px] text-indigo-100 opacity-80 mt-1">Meta loja: &gt;25%</p>
          </div>

          {/* Card 6: Faturamento */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Faturamento
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-800 truncate">
              {formatCurrency(daySummary.totalRevenue)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">
              Ticket: {formatCurrency(daySummary.averageTicket)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Atendimentos Recentes Table + Ranking de Origem Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atendimentos Recentes Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-700 uppercase tracking-tight">
                Atendimentos Recentes ({filteredInteractions.length})
              </h3>
              <p className="text-xs text-slate-400">
                Registros do dia em tempo real com controle de status
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente, móvel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-44"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-2.5 border-b border-slate-200">Hora</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Cliente</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Origem</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Campanha</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Produto</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Status</th>
                  <th className="px-4 py-2.5 border-b border-slate-200 text-right">Valor</th>
                  <th className="px-4 py-2.5 border-b border-slate-200 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredInteractions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                      Nenhum atendimento encontrado para esta data ou filtro.
                    </td>
                  </tr>
                ) : (
                  filteredInteractions.map((item) => {
                    const conf = STATUS_CONFIG[item.status];
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 border-b border-slate-100 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-slate-500 font-semibold whitespace-nowrap">
                          {item.time}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                          {item.customerName || 'Cliente Balcão'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                          {item.origin}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {item.campaign}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                          {item.product}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => onQuickChangeStatus(item)}
                            title="Clique para alterar status rapidamente"
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-opacity hover:opacity-80 ${conf.badgeClass}`}
                          >
                            {conf.label}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                          {item.saleValue ? (
                            <span className="text-emerald-600">{formatCurrency(item.saleValue)}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onEditInteraction(item)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Editar Atendimento"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteRequest(item)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Excluir Atendimento (com confirmação)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Ranking de Origem (from Geometric Balance Design HTML) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Ranking de Origem
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                {Object.keys(originCounts).length} canais
              </span>
            </div>

            {Object.keys(originCounts).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Sem dados de origem registrados para hoje.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(originCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([orig, count], idx) => {
                    const percent = Math.round((count / maxOriginCount) * 100);
                    const colorClass =
                      idx === 0
                        ? 'bg-indigo-600'
                        : idx === 1
                        ? 'bg-indigo-500'
                        : idx === 2
                        ? 'bg-indigo-400'
                        : 'bg-indigo-300';
                    return (
                      <div key={orig} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-700">{orig}</span>
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {count} {count === 1 ? 'atend.' : 'atend.'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`${colorClass} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Quick Insights Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dica Comercial Sênior</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Registrar o motivo exato nos atendimentos com status <em>Em negociação</em> aumenta a
              taxa de fechamento no retorno em até <strong>38%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
