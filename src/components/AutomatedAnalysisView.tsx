import React, { useState } from 'react';
import { CustomerInteraction } from '../types';
import {
  PeriodFilterType,
  filterInteractionsByPeriod,
  generateAutomatedAnalysis,
  getReferenceDate,
} from '../utils/analytics';
import {
  Sparkles,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  Share2,
  Tag,
  Layers,
  CheckCircle2,
  Lightbulb,
  Flame,
} from 'lucide-react';

interface AutomatedAnalysisViewProps {
  interactions: CustomerInteraction[];
}

export const AutomatedAnalysisView: React.FC<AutomatedAnalysisViewProps> = ({ interactions }) => {
  const [period, setPeriod] = useState<PeriodFilterType>('this_month');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-09-04');

  const refDate = getReferenceDate();

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return 'dia de hoje';
      case 'last_7_days':
        return 'últimos 7 dias';
      case 'this_month':
        return 'mês de Setembro de 2026';
      case 'last_month':
        return 'mês de Agosto de 2026';
      case 'last_30_days':
        return 'últimos 30 dias';
      case 'custom':
        return 'período personalizado';
    }
  };

  const activeItems = filterInteractionsByPeriod(interactions, period, customStart, customEnd, refDate);
  const analysis = generateAutomatedAnalysis(activeItems, getPeriodLabel());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Análise dos Resultados
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Inteligência analítica do sistema: descobertas estatísticas e observações automáticas baseadas exclusivamente nos dados cadastrados
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'last_7_days', label: 'Últimos 7 dias' },
            { id: 'this_month', label: 'Este mês (Set/26)' },
            { id: 'last_month', label: 'Mês anterior (Ago/26)' },
            { id: 'last_30_days', label: 'Últimos 30 dias' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as PeriodFilterType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

      {/* SEÇÃO PRINCIPAL: Geometric Balance signature card (bg-indigo-900 rounded-2xl text-white) */}
      <div className="bg-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle geometric circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
        <div className="absolute right-32 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full pointer-events-none"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center">
            <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full mr-2.5"></span>
            <span>Síntese Analítica Automática • {getPeriodLabel().toUpperCase()}</span>
          </h4>
          <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 bg-white/10 rounded-md text-indigo-200 border border-white/10">
            {analysis.observations.length} descobertas detectadas
          </span>
        </div>

        {/* Observations with themed left-accent borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {analysis.observations.map((obs, index) => {
            const borderColors = [
              'border-indigo-500',
              'border-emerald-500',
              'border-amber-500',
              'border-rose-500',
              'border-sky-500',
            ];
            const borderColor = borderColors[index % borderColors.length];
            return (
              <div
                key={index}
                className={`border-l-4 ${borderColor} bg-white/5 backdrop-blur-xs p-4 rounded-r-xl`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                    Insight #{index + 1}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed opacity-95 text-slate-100">
                  &ldquo;{obs}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

        {/* Data Confidence Indicator */}
        <div className="mt-8 pt-4 border-t border-white/10 relative z-10">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider opacity-60">
            <span>Precisão Analítica dos Registros</span>
            <span className="font-mono">100% Amostragem Real</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 mt-2 rounded-full overflow-hidden">
            <div className="bg-indigo-400 h-full w-[98%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* QUADRO DE DESTAQUES & CAMPEÕES ESTATÍSTICOS */}
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Líderes de Performance Comercial
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Melhor Dia da Semana */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Melhor Dia da Semana
                </span>
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xl font-black text-slate-800 block mt-1">
                {analysis.summaryStats.bestWeekday}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Maior fluxo de clientes que entraram na loja
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-indigo-700">
              <Flame className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pico de Visitas</span>
            </div>
          </div>

          {/* Origem Líder de Clientes */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Origem Principal
                </span>
                <Share2 className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xl font-black text-slate-800 block mt-1">
                {analysis.summaryStats.bestOriginByVolume}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Melhor taxa: {analysis.summaryStats.bestOriginByConversion}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-indigo-700">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Canal Mais Eficaz</span>
            </div>
          </div>

          {/* Campanha Campeã */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Campanha Campeã
                </span>
                <Tag className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-base sm:text-lg font-black text-slate-800 block mt-1 leading-tight">
                {analysis.summaryStats.bestCampaignByConversion}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Maior volume bruto: {analysis.summaryStats.bestCampaignByVolume}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Maior Conversão</span>
            </div>
          </div>

          {/* Móvel / Produto em Alta */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Móvel Mais Procurado
                </span>
                <Layers className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-xl font-black text-slate-800 block mt-1">
                {analysis.summaryStats.bestProductByInterest}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Maior faturamento: {analysis.summaryStats.bestProductByRevenue}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-slate-700">
              <span>Móvel Destaque</span>
            </div>
          </div>
        </div>
      </div>

      {/* ANÁLISE DETALHADA POR CATEGORIA (Cards com Diagnóstico do Analista) */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Diagnósticos e Insights Estatísticos Detalhados
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.insights.map((item) => {
            const isHighlight = item.type === 'highlight';
            const isPositive = item.type === 'positive';
            const isWarning = item.type === 'warning';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isHighlight
                    ? 'bg-indigo-50/50 border-indigo-200'
                    : isPositive
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isWarning
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isPositive && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                    {isWarning && <TrendingDown className="w-4 h-4 text-rose-600" />}
                    {isHighlight && <Award className="w-4 h-4 text-indigo-600" />}
                    <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                  </div>
                  {item.metric && (
                    <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 shadow-2xs">
                      {item.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
