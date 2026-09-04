import { AppSettings, CustomerStatus, CatalogItem, CategoryItem, ProductItem } from '../types';

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

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-sofas', name: 'Sofás & Estofados', active: true },
  { id: 'cat-quartos', name: 'Quartos & Roupeiros', active: true },
  { id: 'cat-cozinhas', name: 'Cozinhas & Modulados', active: true },
  { id: 'cat-mesas', name: 'Mesas & Cadeiras', active: true },
  { id: 'cat-salas', name: 'Salas & Painéis', active: true },
  { id: 'cat-colchoes', name: 'Colchões & Camas', active: true },
  { id: 'cat-decor', name: 'Poltronas & Decoração', active: true },
];

export const DEFAULT_DETAILED_PRODUCTS: ProductItem[] = [
  { id: 'prod-1', name: 'Sofá Imperial 3 Lugares', category: 'Sofás & Estofados', brand: 'Estofados Real', active: true, notes: 'Tecido linho rústico, pés de madeira' },
  { id: 'prod-2', name: 'Guarda-Roupa Montreal 6 Portas', category: 'Quartos & Roupeiros', brand: 'Móveis Sul', active: true, notes: '100% MDF com espelho central' },
  { id: 'prod-3', name: 'Cozinha Florença 7 Peças', category: 'Cozinhas & Modulados', brand: 'Itatiaia Premium', active: true, notes: 'Amortecimento slow motion' },
  { id: 'prod-4', name: 'Mesa Luna 6 Cadeiras', category: 'Mesas & Cadeiras', brand: 'Kappesberg', active: true, notes: 'Tampo de vidro temperado e laca' },
  { id: 'prod-5', name: 'Painel Elegance com LED', category: 'Salas & Painéis', brand: 'DJ Móveis', active: true, notes: 'Suporta TV até 75 polegadas' },
  { id: 'prod-6', name: 'Sofá Retrátil Madri 2.50m', category: 'Sofás & Estofados', brand: 'Estofados Real', active: true, notes: 'Molas ensacadas e veludo suede' },
  { id: 'prod-7', name: 'Roupeiro Sevilha Casal', category: 'Quartos & Roupeiros', brand: 'Móveis Sul', active: true, notes: 'Portas de correr com trilho de alumínio' },
  { id: 'prod-8', name: 'Cozinha Modulada Lisboa', category: 'Cozinhas & Modulados', brand: 'Casttini', active: true, notes: 'Puxadores em perfil gola' },
  { id: 'prod-9', name: 'Mesa Veneza 8 Lugares', category: 'Mesas & Cadeiras', brand: 'Kappesberg', active: true, notes: 'Base em madeira maciça' },
  { id: 'prod-10', name: 'Cama Box Queen Atenas', category: 'Colchões & Camas', brand: 'Castor', active: true, notes: 'Molas Pocket e pillow top' },
  { id: 'prod-11', name: 'Colchão Ortopédico Titanium', category: 'Colchões & Camas', brand: 'Ortobom', active: true, notes: 'Espuma D45 certificada' },
  { id: 'prod-12', name: 'Poltrona Reclinável Roma', category: 'Poltronas & Decoração', brand: 'Herval', active: true, notes: 'Couro ecológico e mecanismo zero wall' },
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
  userRole: 'administrador',
  activeSeller: 'Camila Vendas',
  origins: DEFAULT_ORIGINS,
  campaigns: DEFAULT_CAMPAIGNS,
  products: DEFAULT_DETAILED_PRODUCTS.map((p) => p.name),
  sellers: DEFAULT_SELLERS,
  categories: DEFAULT_CATEGORIES.map((c) => c.name),
  catalogOrigins: stringsToCatalog(DEFAULT_ORIGINS),
  catalogCampaigns: stringsToCatalog(DEFAULT_CAMPAIGNS),
  catalogProducts: DEFAULT_DETAILED_PRODUCTS,
  catalogCategories: DEFAULT_CATEGORIES,
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
