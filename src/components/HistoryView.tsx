import React, { useState, useMemo } from 'react';
import { CustomerInteraction, CustomerStatus, AppSettings } from '../types';
import { STATUS_CONFIG } from '../utils/defaults';
import {
  Search,
  Filter,
  Calendar,
  Layers,
  Tag,
  Share2,
  DollarSign,
  Edit2,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Clock,
  ArrowUpDown,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { exportInteractionsToCSV } from '../utils/exportUtils';

interface HistoryViewProps {
  interactions: CustomerInteraction[];
  settings: AppSettings;
  onEditInteraction: (item: CustomerInteraction) => void;
  onQuickChangeStatus: (item: CustomerInteraction) => void;
  onDeleteRequest: (item: CustomerInteraction) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  interactions,
  settings,
  onEditInteraction,
  onQuickChangeStatus,
  onDeleteRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterOrigin, setFilterOrigin] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeller, setFilterSeller] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Quick period presets
  const applyPeriodPreset = (preset: 'today' | 'yesterday' | '7days' | 'thisMonth' | 'lastMonth' | 'all') => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
      return;
    }

    if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setStartDate(yStr);
      setEndDate(yStr);
      return;
    }

    if (preset === '7days') {
      const d7 = new Date(today);
      d7.setDate(today.getDate() - 6);
      setStartDate(d7.toISOString().split('T')[0]);
      setEndDate(todayStr);
      return;
    }

    if (preset === 'thisMonth') {
      const firstDay = `${yyyy}-${mm}-01`;
      setStartDate(firstDay);
      setEndDate(todayStr);
      return;
    }

    if (preset === 'lastMonth') {
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthYear = lastMonthDate.getFullYear();
      const lastMonthMonth = String(lastMonthDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(lastMonthYear, lastMonthDate.getMonth() + 1, 0).getDate();
      setStartDate(`${lastMonthYear}-${lastMonthMonth}-01`);
      setEndDate(`${lastMonthYear}-${lastMonthMonth}-${lastDay}`);
      return;
    }
  };

  // Filtered and sorted interactions
  const filteredInteractions = useMemo(() => {
    return interactions
      .filter((item) => {
        // Date range
        if (startDate && item.date < startDate) return false;
        if (endDate && item.date > endDate) return false;

        // Select filters
        if (filterCampaign !== 'all' && item.campaign !== filterCampaign) return false;
        if (filterProduct !== 'all' && item.product !== filterProduct) return false;
        if (filterOrigin !== 'all' && item.origin !== filterOrigin) return false;
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        if (filterSeller !== 'all' && item.sellerName !== filterSeller) return false;

        // Search text (notes, product sold, seller, customer)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchNotes = item.notes?.toLowerCase().includes(q);
          const matchCustomer = item.customerName?.toLowerCase().includes(q);
          const matchSeller = item.sellerName?.toLowerCase().includes(q);
          const matchProductSold = item.productSold?.toLowerCase().includes(q);
          const matchOrigin = item.origin?.toLowerCase().includes(q);
          const matchProduct = item.product?.toLowerCase().includes(q);
          if (!matchNotes && !matchCustomer && !matchSeller && !matchProductSold && !matchOrigin && !matchProduct) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = `${a.date}T${a.time}`;
        const timeB = `${b.date}T${b.time}`;
        return sortOrder === 'desc' ? timeB.localeCompare(timeA) : timeA.localeCompare(timeB);
      });
  }, [
    interactions,
    startDate,
    endDate,
    filterCampaign,
    filterProduct,
    filterOrigin,
    filterStatus,
    filterSeller,
    searchTerm,
    sortOrder,
  ]);

  // Aggregate metrics for filtered results
  const metrics = useMemo(() => {
    const total = filteredInteractions.length;
    const sales = filteredInteractions.filter((i) => i.status === 'venda_realizada');
    const revenue = sales.reduce((acc, curr) => acc + (Number(curr.saleValue) || 0), 0);
    const conversionRate = total > 0 ? (sales.length / total) * 100 : 0;
    const negotiating = filteredInteractions.filter((i) => i.status === 'em_negociacao').length;
    const lost = filteredInteractions.filter(
      (i) => i.status === 'desistiu' || i.status === 'sem_interesse'
    ).length;

    return {
      total,
      salesCount: sales.length,
      revenue,
      conversionRate: conversionRate.toFixed(1),
      negotiating,
      lost,
    };
  }, [filteredInteractions]);

  // Unique lists from actual interactions (preserving historical deactivated items too!)
  const availableCampaigns = useMemo(() => {
    const set = new Set<string>();
    settings.campaigns.forEach((c) => set.add(c));
    interactions.forEach((i) => i.campaign && set.add(i.campaign));
    return Array.from(set);
  }, [settings.campaigns, interactions]);

  const availableProducts = useMemo(() => {
    const set = new Set<string>();
    settings.products.forEach((p) => set.add(p));
    interactions.forEach((i) => i.product && set.add(i.product));
    return Array.from(set);
  }, [settings.products, interactions]);

  const availableOrigins = useMemo(() => {
    const set = new Set<string>();
    settings.origins.forEach((o) => set.add(o));
    interactions.forEach((i) => i.origin && set.add(i.origin));
    return Array.from(set);
  }, [settings.origins, interactions]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Histórico de Atendimentos</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pesquise, filtre e audite todos os atendimentos registrados na loja com filtros avançados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportInteractionsToCSV(filteredInteractions, 'historico_filtrado')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Filtro (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Filtered Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Encontrado
          </span>
          <div className="text-2xl font-bold text-slate-800 mt-1">{metrics.total}</div>
          <span className="text-[11px] text-slate-500">atendimentos</span>
        </div>

        <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">
            Taxa de Conversão
          </span>
          <div className="text-2xl font-bold italic mt-1">{metrics.conversionRate}%</div>
          <span className="text-[11px] text-indigo-100">{metrics.salesCount} vendas fechadas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Faturamento Filtrado
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            R$ {metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-500">
            Ticket médio: R${' '}
            {metrics.salesCount > 0
              ? (metrics.revenue / metrics.salesCount).toLocaleString('pt-BR', {
                  maximumFractionDigits: 0,
                })
              : '0'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Em Aberto / Perda
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {metrics.negotiating}{' '}
            <span className="text-xs font-normal text-slate-400">/ {metrics.lost} desistiram</span>
          </div>
          <span className="text-[11px] text-slate-500">pipeline em negociação</span>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Presets de Período */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">
            Período Rápido:
          </span>
          <button
            type="button"
            onClick={() => applyPeriodPreset('today')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => applyPeriodPreset('yesterday')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Ontem
          </button>
          <button
            type="button"
            onClick={() => applyPeriodPreset('7days')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Últimos 7 dias
          </button>
          <button
            type="button"
            onClick={() => applyPeriodPreset('thisMonth')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Este Mês
          </button>
          <button
            type="button"
            onClick={() => applyPeriodPreset('lastMonth')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Mês Passado
          </button>
          <button
            type="button"
            onClick={() => applyPeriodPreset('all')}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold"
          >
            Todo o Período
          </button>
        </div>

        {/* Date Filters + Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Pesquisa Rápida (Observações, Vendedor, Detalhes)
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: desconto, sala de estar, sofa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Campanha
            </label>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Todas as Campanhas</option>
              {availableCampaigns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Produto de Interesse
            </label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Todos os Produtos</option>
              {availableProducts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Origem do Cliente
            </label>
            <select
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Todas as Origens</option>
              {availableOrigins.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Status do Atendimento
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Todos os Status</option>
              {(Object.keys(STATUS_CONFIG) as CustomerStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters / Ordering */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>{filteredInteractions.length} atendimentos encontrados</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigos primeiro'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterCampaign('all');
                setFilterProduct('all');
                setFilterOrigin('all');
                setFilterStatus('all');
                setFilterSeller('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-indigo-600 hover:underline font-bold"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filteredInteractions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhum atendimento corresponde aos filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Data / Hora</th>
                  <th className="py-3.5 px-4">Origem</th>
                  <th className="py-3.5 px-4">Campanha</th>
                  <th className="py-3.5 px-4">Produto de Interesse</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Valor Venda</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInteractions.map((item) => {
                  const conf = STATUS_CONFIG[item.status];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono">{item.date}</div>
                        <div className="text-[11px] text-slate-400">{item.time}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.origin}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700">{item.campaign}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.product}</div>
                        {item.productSold && item.status === 'venda_realizada' && (
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Vendido: {item.productSold}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onQuickChangeStatus(item)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${conf.badgeClass} cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all`}
                          title="Clique para alterar status rapidamente"
                        >
                          {conf.label}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        {item.saleValue && item.saleValue > 0 ? (
                          <span className="text-emerald-700">
                            R$ {item.saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditInteraction(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar Atendimento"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRequest(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir Atendimento (com confirmação)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
