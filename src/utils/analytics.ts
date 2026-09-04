import { CustomerInteraction, DataInsight, PeriodComparison } from '../types';

export type PeriodFilterType =
  | 'today'
  | 'last_7_days'
  | 'this_month'
  | 'last_month'
  | 'last_30_days'
  | 'custom';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Retorna a data atual de referência do sistema: '2026-09-04'
export function getReferenceDate(): string {
  return '2026-09-04';
}

/**
 * Filtra atendimentos com base no tipo de período selecionado
 */
export function filterInteractionsByPeriod(
  interactions: CustomerInteraction[],
  period: PeriodFilterType,
  customStart?: string,
  customEnd?: string,
  refDateStr: string = getReferenceDate()
): CustomerInteraction[] {
  const ref = new Date(`${refDateStr}T23:59:59`);

  switch (period) {
    case 'today':
      return interactions.filter((i) => i.date === refDateStr);

    case 'last_7_days': {
      const past = new Date(ref);
      past.setDate(past.getDate() - 6);
      past.setHours(0, 0, 0, 0);
      return interactions.filter((i) => {
        const d = new Date(`${i.date}T12:00:00`);
        return d >= past && d <= ref;
      });
    }

    case 'this_month': {
      // Setembro 2026
      const year = ref.getFullYear();
      const month = ref.getMonth(); // 8 = setembro
      return interactions.filter((i) => {
        const d = new Date(`${i.date}T12:00:00`);
        return d.getFullYear() === year && d.getMonth() === month && d <= ref;
      });
    }

    case 'last_month': {
      // Agosto 2026
      const lastMonthDate = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
      const year = lastMonthDate.getFullYear();
      const month = lastMonthDate.getMonth();
      return interactions.filter((i) => {
        const d = new Date(`${i.date}T12:00:00`);
        return d.getFullYear() === year && d.getMonth() === month;
      });
    }

    case 'last_30_days': {
      const past30 = new Date(ref);
      past30.setDate(past30.getDate() - 29);
      past30.setHours(0, 0, 0, 0);
      return interactions.filter((i) => {
        const d = new Date(`${i.date}T12:00:00`);
        return d >= past30 && d <= ref;
      });
    }

    case 'custom': {
      if (!customStart || !customEnd) return interactions;
      const start = new Date(`${customStart}T00:00:00`);
      const end = new Date(`${customEnd}T23:59:59`);
      return interactions.filter((i) => {
        const d = new Date(`${i.date}T12:00:00`);
        return d >= start && d <= end;
      });
    }

    default:
      return interactions;
  }
}

/**
 * Métricas consolidadas
 */
export function calculateConsolidatedMetrics(interactions: CustomerInteraction[]) {
  const totalClients = interactions.length;
  const salesCount = interactions.filter((i) => i.status === 'venda_realizada').length;
  const negotiatingCount = interactions.filter((i) => i.status === 'em_negociacao').length;
  const lostCount = interactions.filter(
    (i) => i.status === 'desistiu' || i.status === 'sem_interesse'
  ).length;
  const futureReturnCount = interactions.filter((i) => i.status === 'retorno_futuro').length;

  const totalRevenue = interactions
    .filter((i) => i.status === 'venda_realizada')
    .reduce((sum, curr) => sum + (Number(curr.saleValue) || 0), 0);

  const conversionRate = totalClients > 0 ? (salesCount / totalClients) * 100 : 0;
  const negotiatingRate = totalClients > 0 ? (negotiatingCount / totalClients) * 100 : 0;
  const lostRate = totalClients > 0 ? (lostCount / totalClients) * 100 : 0;
  const averageTicket = salesCount > 0 ? totalRevenue / salesCount : 0;

  return {
    totalClients,
    salesCount,
    negotiatingCount,
    lostCount,
    futureReturnCount,
    totalRevenue,
    conversionRate,
    negotiatingRate,
    lostRate,
    averageTicket,
  };
}

/**
 * Atendimentos por dia da semana
 */
export function getWeekdayStats(interactions: CustomerInteraction[]) {
  const weekdayNames = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];

  const map: Record<
    number,
    { day: string; dayIndex: number; total: number; vendas: number; taxa: number; faturamento: number }
  > = {};

  // Initialize all days
  for (let i = 0; i < 7; i++) {
    map[i] = {
      day: weekdayNames[i],
      dayIndex: i,
      total: 0,
      vendas: 0,
      taxa: 0,
      faturamento: 0,
    };
  }

  interactions.forEach((item) => {
    // Treat date as local date
    const parts = item.date.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayIdx = dateObj.getDay();

    map[dayIdx].total += 1;
    if (item.status === 'venda_realizada') {
      map[dayIdx].vendas += 1;
      map[dayIdx].faturamento += Number(item.saleValue) || 0;
    }
  });

  // Reorder starting from Segunda (1) to Domingo (0)
  const orderedIndices = [1, 2, 3, 4, 5, 6, 0];
  return orderedIndices.map((idx) => {
    const item = map[idx];
    item.taxa = item.total > 0 ? Number(((item.vendas / item.total) * 100).toFixed(1)) : 0;
    return item;
  });
}

/**
 * Atendimentos e Vendas por data cronológica
 */
export function getDailyTimelineStats(interactions: CustomerInteraction[]) {
  const dateMap: Record<
    string,
    { date: string; displayDate: string; total: number; vendas: number; taxa: number; faturamento: number }
  > = {};

  interactions.forEach((item) => {
    if (!dateMap[item.date]) {
      const parts = item.date.split('-');
      const displayDate = `${parts[2]}/${parts[1]}`;
      dateMap[item.date] = {
        date: item.date,
        displayDate,
        total: 0,
        vendas: 0,
        taxa: 0,
        faturamento: 0,
      };
    }
    dateMap[item.date].total += 1;
    if (item.status === 'venda_realizada') {
      dateMap[item.date].vendas += 1;
      dateMap[item.date].faturamento += Number(item.saleValue) || 0;
    }
  });

  const sortedDates = Object.keys(dateMap).sort();
  return sortedDates.map((key) => {
    const d = dateMap[key];
    d.taxa = d.total > 0 ? Number(((d.vendas / d.total) * 100).toFixed(1)) : 0;
    return d;
  });
}

/**
 * Clientes por Status
 */
export function getStatusBreakdown(interactions: CustomerInteraction[]) {
  const total = interactions.length;
  const statusLabels: Record<string, string> = {
    venda_realizada: 'Venda realizada',
    em_negociacao: 'Em negociação',
    desistiu: 'Desistiu',
    sem_interesse: 'Sem interesse',
    retorno_futuro: 'Retorno futuro',
  };

  const statusColors: Record<string, string> = {
    venda_realizada: '#10b981', // emerald-500
    em_negociacao: '#f59e0b', // amber-500
    desistiu: '#f43f5e', // rose-500
    sem_interesse: '#64748b', // slate-500
    retorno_futuro: '#6366f1', // indigo-500
  };

  const countMap: Record<string, number> = {
    venda_realizada: 0,
    em_negociacao: 0,
    desistiu: 0,
    sem_interesse: 0,
    retorno_futuro: 0,
  };

  interactions.forEach((i) => {
    if (countMap[i.status] !== undefined) {
      countMap[i.status] += 1;
    }
  });

  return Object.keys(countMap).map((key) => {
    const count = countMap[key];
    const percent = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
    return {
      statusKey: key,
      name: statusLabels[key] || key,
      count,
      percent,
      color: statusColors[key] || '#94a3b8',
    };
  });
}

/**
 * Atendimentos por Origem
 */
export function getOriginBreakdown(interactions: CustomerInteraction[]) {
  const map: Record<
    string,
    { origin: string; total: number; vendas: number; taxa: number; faturamento: number }
  > = {};

  interactions.forEach((item) => {
    const origin = item.origin || 'Outros';
    if (!map[origin]) {
      map[origin] = { origin, total: 0, vendas: 0, taxa: 0, faturamento: 0 };
    }
    map[origin].total += 1;
    if (item.status === 'venda_realizada') {
      map[origin].vendas += 1;
      map[origin].faturamento += Number(item.saleValue) || 0;
    }
  });

  const list = Object.values(map).map((item) => {
    item.taxa = item.total > 0 ? Number(((item.vendas / item.total) * 100).toFixed(1)) : 0;
    return item;
  });

  // Sort descending by total
  return list.sort((a, b) => b.total - a.total);
}

/**
 * Atendimentos por Campanha
 */
export function getCampaignBreakdown(interactions: CustomerInteraction[]) {
  const map: Record<
    string,
    { campaign: string; total: number; vendas: number; taxa: number; faturamento: number }
  > = {};

  interactions.forEach((item) => {
    const campaign = item.campaign || 'Nenhuma / Orgânico';
    if (!map[campaign]) {
      map[campaign] = { campaign, total: 0, vendas: 0, taxa: 0, faturamento: 0 };
    }
    map[campaign].total += 1;
    if (item.status === 'venda_realizada') {
      map[campaign].vendas += 1;
      map[campaign].faturamento += Number(item.saleValue) || 0;
    }
  });

  const list = Object.values(map).map((item) => {
    item.taxa = item.total > 0 ? Number(((item.vendas / item.total) * 100).toFixed(1)) : 0;
    return item;
  });

  return list.sort((a, b) => b.total - a.total);
}

/**
 * Atendimentos por Produto / Categoria de Móvel
 */
export function getProductBreakdown(interactions: CustomerInteraction[]) {
  const map: Record<
    string,
    { product: string; total: number; vendas: number; taxa: number; faturamento: number }
  > = {};

  interactions.forEach((item) => {
    const product = item.product || 'Outros';
    if (!map[product]) {
      map[product] = { product, total: 0, vendas: 0, taxa: 0, faturamento: 0 };
    }
    map[product].total += 1;
    if (item.status === 'venda_realizada') {
      map[product].vendas += 1;
      map[product].faturamento += Number(item.saleValue) || 0;
    }
  });

  const list = Object.values(map).map((item) => {
    item.taxa = item.total > 0 ? Number(((item.vendas / item.total) * 100).toFixed(1)) : 0;
    return item;
  });

  return list.sort((a, b) => b.total - a.total);
}

/**
 * Comparação de dois períodos
 */
export function comparePeriods(
  interactionsA: CustomerInteraction[],
  labelA: string,
  interactionsB: CustomerInteraction[],
  labelB: string
): PeriodComparison {
  const metricsA = calculateConsolidatedMetrics(interactionsA);
  const metricsB = calculateConsolidatedMetrics(interactionsB);

  const clientsDiff = metricsA.totalClients - metricsB.totalClients;
  const clientsPercent =
    metricsB.totalClients > 0 ? (clientsDiff / metricsB.totalClients) * 100 : 0;

  const salesDiff = metricsA.salesCount - metricsB.salesCount;
  const salesPercent =
    metricsB.salesCount > 0 ? (salesDiff / metricsB.salesCount) * 100 : 0;

  const conversionRateDiff = metricsA.conversionRate - metricsB.conversionRate;
  const conversionRatePercent =
    metricsB.conversionRate > 0 ? (conversionRateDiff / metricsB.conversionRate) * 100 : 0;

  const revenueDiff = metricsA.totalRevenue - metricsB.totalRevenue;
  const revenuePercent =
    metricsB.totalRevenue > 0 ? (revenueDiff / metricsB.totalRevenue) * 100 : 0;

  return {
    periodA: {
      label: labelA,
      totalClients: metricsA.totalClients,
      salesCount: metricsA.salesCount,
      conversionRate: metricsA.conversionRate,
      totalRevenue: metricsA.totalRevenue,
      averageTicket: metricsA.averageTicket,
    },
    periodB: {
      label: labelB,
      totalClients: metricsB.totalClients,
      salesCount: metricsB.salesCount,
      conversionRate: metricsB.conversionRate,
      totalRevenue: metricsB.totalRevenue,
      averageTicket: metricsB.averageTicket,
    },
    diff: {
      clientsDiff,
      clientsPercent: Number(clientsPercent.toFixed(1)),
      salesDiff,
      salesPercent: Number(salesPercent.toFixed(1)),
      conversionRateDiff: Number(conversionRateDiff.toFixed(1)),
      conversionRatePercent: Number(conversionRatePercent.toFixed(1)),
      revenueDiff,
      revenuePercent: Number(revenuePercent.toFixed(1)),
    },
  };
}

/**
 * Motor de Análise Automática de Dados ("Análise dos Resultados")
 * Gera insights estatísticos rigorosos e observações em linguagem natural
 */
export function generateAutomatedAnalysis(
  interactions: CustomerInteraction[],
  periodLabel: string = 'período analisado'
): {
  insights: DataInsight[];
  observations: string[];
  summaryStats: {
    bestWeekday: string;
    bestCampaignByVolume: string;
    bestCampaignByConversion: string;
    bestProductByInterest: string;
    bestProductByRevenue: string;
    bestOriginByVolume: string;
    bestOriginByConversion: string;
    peakSalesDate: string;
    trendAnalysis: string;
  };
} {
  if (interactions.length === 0) {
    return {
      insights: [
        {
          id: 'no-data',
          type: 'info',
          title: 'Aguardando Atendimentos',
          description: 'Cadastre atendimentos diários para que o sistema gere análises estatísticas automáticas.',
          category: 'tendencia',
        },
      ],
      observations: ['Nenhum atendimento registrado no período selecionado.'],
      summaryStats: {
        bestWeekday: 'N/A',
        bestCampaignByVolume: 'N/A',
        bestCampaignByConversion: 'N/A',
        bestProductByInterest: 'N/A',
        bestProductByRevenue: 'N/A',
        bestOriginByVolume: 'N/A',
        bestOriginByConversion: 'N/A',
        peakSalesDate: 'N/A',
        trendAnalysis: 'Sem dados suficientes.',
      },
    };
  }

  const observations: string[] = [];
  const insights: DataInsight[] = [];

  // 1. Melhor dia da semana
  const weekdayStats = getWeekdayStats(interactions);
  const validWeekdays = weekdayStats.filter((d) => d.total > 0);
  const bestDayByVolume = [...validWeekdays].sort((a, b) => b.total - a.total)[0];
  const bestDayByConversion = [...validWeekdays]
    .filter((d) => d.total >= 2)
    .sort((a, b) => b.taxa - a.taxa)[0] || bestDayByVolume;

  if (bestDayByVolume) {
    const obs = `${bestDayByVolume.day}-feira apresentou o maior número de atendimentos no ${periodLabel} (${bestDayByVolume.total} clientes).`;
    observations.push(obs);
    insights.push({
      id: 'insight-weekday',
      type: 'highlight',
      title: 'Dia de Maior Fluxo na Loja',
      description: `${bestDayByVolume.day}-feira é o dia com maior movimento físico de clientes (${bestDayByVolume.total} atendimentos, ${bestDayByVolume.vendas} vendas concluídas).`,
      metric: `${bestDayByVolume.total} clientes`,
      category: 'dia',
    });
  }

  // 2. Origem
  const origins = getOriginBreakdown(interactions);
  const bestOriginVolume = origins[0];
  const bestOriginConv = [...origins]
    .filter((o) => o.total >= 2)
    .sort((a, b) => b.taxa - a.taxa)[0] || origins[0];

  if (bestOriginVolume) {
    const share = ((bestOriginVolume.total / interactions.length) * 100).toFixed(1);
    const obs = `${bestOriginVolume.origin} foi responsável pelo maior número de atendimentos (${share}% do total registrado).`;
    observations.push(obs);
    insights.push({
      id: 'insight-origin-vol',
      type: 'positive',
      title: 'Principal Canal de Atração',
      description: `O canal ${bestOriginVolume.origin} lidera a entrada de novos clientes com ${bestOriginVolume.total} atendimentos e ${bestOriginVolume.vendas} vendas.`,
      metric: `${share}% do fluxo`,
      category: 'origem',
    });
  }

  if (bestOriginConv && bestOriginConv.origin !== bestOriginVolume?.origin && bestOriginConv.taxa > 0) {
    observations.push(
      `O canal ${bestOriginConv.origin} apresentou a maior taxa de conversão entre as origens (${bestOriginConv.taxa}% de conversão em vendas).`
    );
  }

  // 3. Campanhas
  const campaigns = getCampaignBreakdown(interactions);
  const bestCampVolume = campaigns[0];
  const bestCampConv = [...campaigns]
    .filter((c) => c.total >= 2)
    .sort((a, b) => b.taxa - a.taxa)[0] || campaigns[0];

  if (bestCampConv && bestCampConv.taxa > 0) {
    const obs = `A ${bestCampConv.campaign} apresentou a maior taxa de conversão (${bestCampConv.taxa}% com ${bestCampConv.vendas} vendas fechadas).`;
    observations.push(obs);
    insights.push({
      id: 'insight-campaign-conv',
      type: 'positive',
      title: 'Campanha Mais Eficiente',
      description: `A ${bestCampConv.campaign} obteve a melhor taxa de conversão em fechamentos (${bestCampConv.taxa}%), gerando ${formatCurrency(bestCampConv.faturamento)} em faturamento.`,
      metric: `${bestCampConv.taxa}% conversão`,
      category: 'campanha',
    });
  }

  if (bestCampVolume && bestCampVolume.campaign !== bestCampConv?.campaign) {
    observations.push(
      `A ${bestCampVolume.campaign} foi a campanha que atraiu o maior volume bruto de atendimentos (${bestCampVolume.total} clientes).`
    );
  }

  // 4. Produtos / Móveis
  const products = getProductBreakdown(interactions);
  const bestProdInterest = products[0];
  const bestProdRevenue = [...products].sort((a, b) => b.faturamento - a.faturamento)[0];

  if (bestProdInterest) {
    const obs = `O móvel com maior procura pelos clientes foi "${bestProdInterest.product}" com ${bestProdInterest.total} atendimentos registrados.`;
    observations.push(obs);
    insights.push({
      id: 'insight-product-interest',
      type: 'info',
      title: 'Móvel / Categoria Mais Procurada',
      description: `A categoria "${bestProdInterest.product}" concentrou a maior demanda de visitas e orçamentos na loja.`,
      metric: `${bestProdInterest.total} visitas`,
      category: 'produto',
    });
  }

  if (bestProdRevenue && bestProdRevenue.faturamento > 0) {
    const obs = `A categoria "${bestProdRevenue.product}" liderou o faturamento total da loja no período, somando ${formatCurrency(bestProdRevenue.faturamento)}.`;
    observations.push(obs);
  }

  // 5. Pico de vendas por data
  const timeline = getDailyTimelineStats(interactions);
  const peakSales = [...timeline].sort((a, b) => b.vendas - a.vendas)[0];
  if (peakSales && peakSales.vendas > 0) {
    const parts = peakSales.date.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    observations.push(
      `O dia com maior número de vendas realizadas foi ${formattedDate}, com ${peakSales.vendas} vendas fechadas e R$ ${peakSales.faturamento.toLocaleString('pt-BR')} em faturamento.`
    );
  }

  // 6. Tendência / Queda e Crescimento
  let trendText = 'Fluxo estável de atendimentos.';
  if (timeline.length >= 3) {
    const firstHalf = timeline.slice(0, Math.floor(timeline.length / 2));
    const secondHalf = timeline.slice(Math.floor(timeline.length / 2));
    const avg1 = firstHalf.reduce((s, i) => s + i.total, 0) / (firstHalf.length || 1);
    const avg2 = secondHalf.reduce((s, i) => s + i.total, 0) / (secondHalf.length || 1);

    if (avg2 > avg1 * 1.15) {
      const growthPct = Math.round(((avg2 - avg1) / avg1) * 100);
      trendText = `Crescimento de aproximadamente ${growthPct}% na média diária de atendimentos na segunda metade do período analisado.`;
      observations.push(trendText);
      insights.push({
        id: 'insight-growth',
        type: 'positive',
        title: 'Tendência de Crescimento no Fluxo',
        description: `Observou-se uma aceleração no volume de visitas à loja nos dias mais recentes, impulsionada pelas campanhas ativas.`,
        metric: `+${growthPct}% média diária`,
        category: 'tendencia',
      });
    } else if (avg2 < avg1 * 0.85) {
      const dropPct = Math.round(((avg1 - avg2) / avg1) * 100);
      trendText = `Identificada retração de ${dropPct}% nos atendimentos recentes; recomenda-se intensificar ações no WhatsApp e Instagram.`;
      observations.push(trendText);
      insights.push({
        id: 'insight-drop',
        type: 'warning',
        title: 'Ponto de Atenção: Desaceleração',
        description: `Queda no volume de entradas recentes na loja física. Sugestão: reforçar o follow-up de clientes em negociação e ofertas de pronta-entrega.`,
        metric: `-${dropPct}% atendimentos`,
        category: 'tendencia',
      });
    }
  }

  return {
    insights,
    observations,
    summaryStats: {
      bestWeekday: bestDayByVolume ? `${bestDayByVolume.day}-feira` : 'N/A',
      bestCampaignByVolume: bestCampVolume ? bestCampVolume.campaign : 'N/A',
      bestCampaignByConversion: bestCampConv ? `${bestCampConv.campaign} (${bestCampConv.taxa}%)` : 'N/A',
      bestProductByInterest: bestProdInterest ? bestProdInterest.product : 'N/A',
      bestProductByRevenue: bestProdRevenue ? `${bestProdRevenue.product} (${formatCurrency(bestProdRevenue.faturamento)})` : 'N/A',
      bestOriginByVolume: bestOriginVolume ? `${bestOriginVolume.origin} (${bestOriginVolume.total})` : 'N/A',
      bestOriginByConversion: bestOriginConv ? `${bestOriginConv.origin} (${bestOriginConv.taxa}%)` : 'N/A',
      peakSalesDate: peakSales ? peakSales.date : 'N/A',
      trendAnalysis: trendText,
    },
  };
}
