import { AppSettings, CustomerStatus, CatalogItem } from '../types';

export const DEFAULT_ORIGINS: string[] = [
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Google',
  'Meta Ads',
  'Google Ads',
  'Indicação',
  'Passou em frente à loja',
  'Cliente antigo',
  'Marketplace',
  'Outros',
];

export const DEFAULT_CAMPAIGNS: string[] = [
  'Campanha de Sofá',
  'Campanha de Guarda-Roupa',
  'Campanha de Cozinha',
  'Campanha de Quarto',
  'Campanha de Mesas & Jantar',
  'Black Friday',
  'Saldão de Mostruário',
  'Campanha de Primavera',
  'Nenhuma / Orgânico',
  'Outros',
];

export const DEFAULT_PRODUCTS: string[] = [
  'Sofá',
  'Guarda-roupa',
  'Cozinha Completa',
  'Mesa de Jantar',
  'Cama & Cabeceira',
  'Colchão Especial',
  'Rack & Painel',
  'Poltrona Decorativa',
  'Aparador & Buffet',
  'Outros',
];

export const DEFAULT_SELLERS: string[] = [
  'Camila Vendas',
  'Juliana Móveis',
  'Renata Consultora',
  'Patrícia Design',
];

export function stringsToCatalog(items: string[]): CatalogItem[] {
  return items.map((name, idx) => ({
    id: `cat-${idx}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    active: true,
  }));
}

export const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'MÓVEIS PREMIUM',
  origins: DEFAULT_ORIGINS,
  campaigns: DEFAULT_CAMPAIGNS,
  products: DEFAULT_PRODUCTS,
  sellers: DEFAULT_SELLERS,
  catalogOrigins: stringsToCatalog(DEFAULT_ORIGINS),
  catalogCampaigns: stringsToCatalog(DEFAULT_CAMPAIGNS),
  catalogProducts: stringsToCatalog(DEFAULT_PRODUCTS),
  catalogSellers: stringsToCatalog(DEFAULT_SELLERS),
  autoBackupEnabled: true,
  lastBackupDate: new Date().toISOString(),
};

export const STATUS_CONFIG: Record<
  CustomerStatus,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    badgeClass: string;
    description: string;
  }
> = {
  venda_realizada: {
    label: 'Venda realizada',
    bgClass: 'bg-emerald-50 text-emerald-700',
    textClass: 'text-emerald-600',
    borderClass: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    description: 'Atendimento finalizado com compra efetuada',
  },
  em_negociacao: {
    label: 'Em negociação',
    bgClass: 'bg-amber-50 text-amber-700',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
    description: 'Cliente aguardando orçamento, medidas ou decisão',
  },
  desistiu: {
    label: 'Desistiu',
    bgClass: 'bg-rose-50 text-rose-700',
    textClass: 'text-rose-600',
    borderClass: 'border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-700 border border-rose-200',
    description: 'Cliente optou por concorrente ou desistiu da compra',
  },
  sem_interesse: {
    label: 'Sem interesse',
    bgClass: 'bg-slate-100 text-slate-700',
    textClass: 'text-slate-600',
    borderClass: 'border-slate-300',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    description: 'Apenas olhando, não encontrou o perfil desejado',
  },
  retorno_futuro: {
    label: 'Retorno futuro',
    bgClass: 'bg-blue-50 text-blue-700',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
    description: 'Imóvel em reforma, visita programada para retorno',
  },
};
