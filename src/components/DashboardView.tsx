import React, { useState } from 'react';
import { CustomerInteraction } from '../types';
import {
  PeriodFilterType,
  filterInteractionsByPeriod,
  calculateConsolidatedMetrics,
  getWeekdayStats,
  getDailyTimelineStats,
  getStatusBreakdown,
  getOriginBreakdown,
  getCampaignBreakdown,
  getProductBreakdown,
  formatCurrency,
  formatPercent,
  getReferenceDate,
} from '../utils/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  Layers,
  Share2,
  Tag,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardViewProps {
  interactions: CustomerInteraction[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ interactions }) => {
  const [period, setPeriod] = useState<PeriodFilterType>('this_month');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-09-04');
  const [chartTab, setChartTab] = useState<'all' | 'fluxo' | 'campanhas' | 'produtos'>('all');

  const refDate = getReferenceDate();

  // Metrics for Today, Week, Month
  const todayItems = filterInteractionsByPeriod(interactions, 'today', undefined, undefined, refDate);
  const weekItems = filterInteractionsByPeriod(interactions, 'last_7_days', undefined, undefined, refDate);
  const monthItems = filterInteractionsByPeriod(interactions, 'this_month', undefined, undefined, refDate);

  // Filtered dataset for currently selected period
  const activeItems = filterInteractionsByPeriod(interactions, period, customStart, customEnd, refDate);
  const activeMetrics = calculateConsolidatedMetrics(activeItems);

  // Chart datasets
  const weekdayData = getWeekdayStats(activeItems);
  const timelineData = getDailyTimelineStats(activeItems);
  const statusData = getStatusBreakdown(activeItems);
  const originData = getOriginBreakdown(activeItems);
  const campaignData = getCampaignBreakdown(activeItems);
  const productData = getProductBreakdown(activeItems);

  // Custom tooltips (Geometric Balance dark slate tooltip)
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F172A] text-white p-2.5 rounded-lg shadow-lg border border-[#334155] text-xs">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300">{item.name}:</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(item.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomStandardTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F172A] text-white p-2.5 rounded-lg shadow-lg border border-[#334155] text-xs">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300">{item.name}:</span>
              <span className="font-semibold">{item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Period Filter */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Dashboard Geral de Desempenho
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoramento analítico de visitas, taxa de conversão, faturamento e canais
          </p>
        </div>

        {/* Period Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'last_7_days', label: 'Últimos 7 dias' },
            { id: 'this_month', label: 'Este Mês (Set/26)' },
            { id: 'last_month', label: 'Mês Anterior (Ago/26)' },
            { id: 'last_30_days', label: 'Últimos 30 dias' },
            { id: 'custom', label: 'Personalizado' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as PeriodFilterType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === item.id
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Period Date Range Inputs */}
      {period === 'custom' && (
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-wrap items-center gap-3 text-xs animate-fadeIn">
          <span className="font-bold text-slate-700">Intervalo de datas:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">De:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-md bg-white font-semibold text-slate-800"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Até:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-md bg-white font-semibold text-slate-800"
            />
          </div>
        </div>
      )}

      {/* INDICADORES OBRIGATÓRIOS DO DASHBOARD (Geometric Balance theme) */}
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Principais Indicadores • Período Atual
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Atendimentos de Hoje */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Atend. Hoje
            </span>
            <span className="text-2xl font-black text-slate-800">{todayItems.length}</span>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">Visitas hoje</span>
          </div>

          {/* 2. Atendimentos da Semana */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Atend. Semana
            </span>
            <span className="text-2xl font-black text-slate-800">{weekItems.length}</span>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">Últimos 7 dias</span>
          </div>

          {/* 3. Atendimentos do Mês */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Atend. Mês
            </span>
            <span className="text-2xl font-black text-slate-800">{monthItems.length}</span>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">Setembro/26</span>
          </div>

          {/* 4. Vendas Realizadas */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Vendas Fechadas
            </span>
            <span className="text-2xl font-black text-slate-800">{activeMetrics.salesCount}</span>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1">
              +{activeMetrics.salesCount} no período
            </span>
          </div>

          {/* 5. Clientes em Negociação */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Em Negociação
            </span>
            <span className="text-2xl font-black text-slate-800">
              {activeMetrics.negotiatingCount}
            </span>
            <span className="text-[10px] text-amber-500 font-bold block mt-1">
              {formatPercent(activeMetrics.negotiatingRate)} do fluxo
            </span>
          </div>

          {/* 6. Desistências */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Desistências
            </span>
            <span className="text-2xl font-black text-slate-800">{activeMetrics.lostCount}</span>
            <span className="text-[10px] text-rose-500 font-bold block mt-1">
              {formatPercent(activeMetrics.lostRate)} perdas
            </span>
          </div>

          {/* 7. Taxa de Conversão (Prominent Indigo Theme Card) */}
          <div className="bg-indigo-600 p-3.5 rounded-xl shadow-sm text-white flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block mb-1">
              Taxa Conversão
            </span>
            <span className="text-2xl font-black italic">
              {formatPercent(activeMetrics.conversionRate)}
            </span>
            <span className="text-[10px] text-indigo-100 opacity-80 block mt-1">Meta: 25%</span>
          </div>

          {/* 8. Faturamento Registrado */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Faturamento
            </span>
            <span className="text-base sm:text-lg font-black text-slate-800 truncate block">
              {formatCurrency(activeMetrics.totalRevenue)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono truncate">
              Ticket: {formatCurrency(activeMetrics.averageTicket)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Category Filter Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Visão dos Gráficos:
        </span>
        <button
          onClick={() => setChartTab('all')}
          className={`px-3 py-1 rounded-md text-xs font-semibold ${
            chartTab === 'all'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos os 10 Gráficos
        </button>
        <button
          onClick={() => setChartTab('fluxo')}
          className={`px-3 py-1 rounded-md text-xs font-semibold ${
            chartTab === 'fluxo'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Fluxo & Status (1-5)
        </button>
        <button
          onClick={() => setChartTab('campanhas')}
          className={`px-3 py-1 rounded-md text-xs font-semibold ${
            chartTab === 'campanhas'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Origem & Campanhas (6-8)
        </button>
        <button
          onClick={() => setChartTab('produtos')}
          className={`px-3 py-1 rounded-md text-xs font-semibold ${
            chartTab === 'produtos'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Produtos & Faturamento (9-10)
        </button>
      </div>

      {/* OS 10 GRÁFICOS SOLICITADOS NO PROMPT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO 1: Atendimentos por dia da semana */}
        {(chartTab === 'all' || chartTab === 'fluxo') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  1. Atendimentos por Dia da Semana
                </h3>
                <p className="text-xs text-slate-400">Distribuição semanal do fluxo de clientes</p>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                SEG - DOM
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomStandardTooltip />} />
                  <Bar dataKey="total" name="Atendimentos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRÁFICO 2: Atendimentos por dia (evolução cronológica) */}
        {(chartTab === 'all' || chartTab === 'fluxo') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  2. Atendimentos por Dia (Linha Temporal)
                </h3>
                <p className="text-xs text-slate-400">Evolução diária das entradas na loja</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomStandardTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Atendimentos"
                    stroke="#0f172a"
                    fill="#e2e8f0"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRÁFICO 3: Vendas por dia */}
        {(chartTab === 'all' || chartTab === 'fluxo') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">3. Vendas por Dia</h3>
                <p className="text-xs text-slate-400">Contratos e compras fechadas diariamente</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                FECHAMENTOS
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomStandardTooltip />} />
                  <Bar dataKey="vendas" name="Vendas" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRÁFICO 4: Comparação entre atendimentos e vendas */}
        {(chartTab === 'all' || chartTab === 'fluxo') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  4. Comparação: Atendimentos vs Vendas
                </h3>
                <p className="text-xs text-slate-400">Volume de visitantes comparado aos fechamentos</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomStandardTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="total" name="Atendimentos" fill="#64748b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="vendas" name="Vendas" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRÁFICO 5: Clientes por status */}
        {(chartTab === 'all' || chartTab === 'fluxo') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">5. Clientes por Status</h3>
                <p className="text-xs text-slate-400">Distribuição percentual da carteira</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center">
              <div className="h-56 w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomStandardTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-1.5 text-xs">
                {statusData.map((item) => (
                  <div key={item.statusKey} className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">
                      {item.count} ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GRÁFICO 6: Atendimentos por origem */}
        {(chartTab === 'all' || chartTab === 'campanhas') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">6. Atendimentos por Origem</h3>
                <p className="text-xs text-slate-400">Canais de atração de clientes da loja</p>
              </div>
              <Share2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={originData.slice(0, 7)}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="origin" tick={{ fontSize: 10, fill: '#334155' }} width={80} />
                  <Tooltip content={<CustomStandardTooltip />} />
                  <Bar dataKey="total" name="Atendimentos" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRÁFICO 7: Atendimentos por campanha */}
        {(chartTab === 'all' || chartTab === 'campanhas') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">7. Atendimentos por Campanha</h3>
                <p className="text-xs text-slate-400">Volume de clientes gerado por ação promocional</p>
              </div>
              <Tag className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignData.slice(0, 6)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="campaign"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomStandardTooltip />} />
                  <Bar dataKey="total" name="Atendimentos" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRÁFICO 8: Atendimentos por produto / móvel */}
        {(chartTab === 'all' || chartTab === 'produtos') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  8. Atendimentos por Produto / Categoria
                </h3>
                <p className="text-xs text-slate-400">Móveis que mais despertaram interesse</p>
              </div>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="product" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomStandardTooltip />} />
                  <Bar dataKey="total" name="Interessados" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRÁFICO 9: Faturamento por período */}
        {(chartTab === 'all' || chartTab === 'produtos') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">9. Faturamento por Período</h3>
                <p className="text-xs text-slate-400">Volume financeiro gerado em vendas (R$)</p>
              </div>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="faturamento"
                    name="Faturamento"
                    stroke="#10b981"
                    fill="#d1fae5"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRÁFICO 10: Taxa de conversão por campanha */}
        {(chartTab === 'all' || chartTab === 'campanhas') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  10. Taxa de Conversão por Campanha (%)
                </h3>
                <p className="text-xs text-slate-400">Eficácia das campanhas em transformar visitas em vendas</p>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                CONVERSÃO
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignData.slice(0, 6)}
                  margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="campaign"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Taxa de Conversão']}
                  />
                  <Bar dataKey="taxa" name="Conversão (%)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
