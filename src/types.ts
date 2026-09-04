export type CustomerStatus =
  | 'venda_realizada'
  | 'em_negociacao'
  | 'desistiu'
  | 'sem_interesse'
  | 'retorno_futuro';

export interface CustomerInteraction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName?: string; // Opcional (não é obrigatório)
  sellerName?: string; // Nome da vendedora/atendente
  origin: string; // Origem (Instagram, Passou em frente, etc.)
  campaign: string; // Campanha (Campanha de Sofá, etc.)
  product: string; // Produto/Móvel de interesse (Sofá, Guarda-roupa, etc.)
  status: CustomerStatus;
  saleValue?: number; // Valor da venda em R$ (quando status = 'venda_realizada')
  productSold?: string; // Produto efetivamente vendido
  notes?: string; // Observações rápidas
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface DaySummaryCalculated {
  date: string;
  totalClients: number;
  salesCount: number;
  negotiatingCount: number;
  lostCount: number; // Desistiu + Sem interesse
  futureReturnCount: number;
  totalRevenue: number;
  averageTicket: number;
  conversionRate: number; // %
  negotiatingRate: number; // %
  lostRate: number; // %
}

export interface CatalogItem {
  id: string;
  name: string;
  active: boolean;
}

export interface AppSettings {
  storeName: string;
  origins: string[];
  campaigns: string[];
  products: string[];
  sellers: string[];
  // Cadastros estruturados com suporte a Ativar/Desativar sem apagar histórico (Regra 21)
  catalogOrigins?: CatalogItem[];
  catalogCampaigns?: CatalogItem[];
  catalogProducts?: CatalogItem[];
  catalogSellers?: CatalogItem[];
  lastBackupDate?: string;
  autoBackupEnabled?: boolean;
}

export interface BackupFile {
  version: string;
  appName: string;
  exportDate: string;
  storeName: string;
  totalInteractions: number;
  interactions: CustomerInteraction[];
  settings: AppSettings;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  interactionCount: number;
  description: string;
  data: BackupFile;
}

export interface HistoryFilters {
  search: string;
  startDate: string;
  endDate: string;
  campaign: string;
  product: string;
  origin: string;
  status: string;
  seller: string;
}

export interface PeriodComparison {
  periodA: {
    label: string;
    totalClients: number;
    salesCount: number;
    conversionRate: number;
    totalRevenue: number;
    averageTicket: number;
  };
  periodB: {
    label: string;
    totalClients: number;
    salesCount: number;
    conversionRate: number;
    totalRevenue: number;
    averageTicket: number;
  };
  diff: {
    clientsDiff: number;
    clientsPercent: number;
    salesDiff: number;
    salesPercent: number;
    conversionRateDiff: number; // Pontos percentuais
    conversionRatePercent: number;
    revenueDiff: number;
    revenuePercent: number;
  };
}

export interface DataInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'highlight';
  title: string;
  description: string;
  metric?: string;
  category: 'dia' | 'campanha' | 'produto' | 'origem' | 'vendas' | 'tendencia';
}
