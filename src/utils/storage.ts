import {
  AppSettings,
  CustomerInteraction,
  DaySummaryCalculated,
  BackupFile,
  BackupSnapshot,
} from '../types';
import { DEFAULT_SETTINGS, stringsToCatalog } from './defaults';
import { generateInitialInteractions } from './initialData';

const INTERACTIONS_KEY = 'moveis_monitor_interactions_v1';
const SETTINGS_KEY = 'moveis_monitor_settings_v1';
const SNAPSHOTS_KEY = 'moveis_backup_snapshots_v1';
const LAST_BACKUP_KEY = 'moveis_last_backup_timestamp';

// IndexedDB configuration
const DB_NAME = 'MoveisStoreLocalDB';
const DB_VERSION = 1;
const STORE_INTERACTIONS = 'interactions';
const STORE_SETTINGS = 'settings';
const STORE_SNAPSHOTS = 'snapshots';

function openIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => {
        console.warn('Falha ao abrir IndexedDB, usando fallback localStorage.');
        resolve(null);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_INTERACTIONS)) {
          db.createObjectStore(STORE_INTERACTIONS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
          db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' });
        }
      };
    } catch {
      resolve(null);
    }
  });
}

// Background sync to IndexedDB
async function syncToIndexedDB(interactions: CustomerInteraction[], settings: AppSettings) {
  try {
    const db = await openIndexedDB();
    if (!db) return;

    // Transaction for interactions
    const tx = db.transaction([STORE_INTERACTIONS, STORE_SETTINGS], 'readwrite');
    const storeInteractions = tx.objectStore(STORE_INTERACTIONS);
    storeInteractions.clear();
    for (const item of interactions) {
      storeInteractions.put(item);
    }

    const storeSettings = tx.objectStore(STORE_SETTINGS);
    storeSettings.put({ key: 'current_settings', value: settings });
  } catch (err) {
    console.warn('Aviso ao sincronizar IndexedDB:', err);
  }
}

/**
 * Normaliza configurações garantindo campos de cadastros estruturados
 */
function normalizeSettings(loaded: Partial<AppSettings>): AppSettings {
  const base = { ...DEFAULT_SETTINGS, ...loaded };
  if (!base.catalogOrigins || base.catalogOrigins.length === 0) {
    base.catalogOrigins = stringsToCatalog(base.origins || DEFAULT_SETTINGS.origins);
  }
  if (!base.catalogCampaigns || base.catalogCampaigns.length === 0) {
    base.catalogCampaigns = stringsToCatalog(base.campaigns || DEFAULT_SETTINGS.campaigns);
  }
  if (!base.catalogProducts || base.catalogProducts.length === 0) {
    base.catalogProducts = stringsToCatalog(base.products || DEFAULT_SETTINGS.products);
  }
  if (!base.catalogSellers || base.catalogSellers.length === 0) {
    base.catalogSellers = stringsToCatalog(base.sellers || DEFAULT_SETTINGS.sellers);
  }
  return base as AppSettings;
}

export function getStoredInteractions(): CustomerInteraction[] {
  try {
    const raw = localStorage.getItem(INTERACTIONS_KEY);
    if (!raw) {
      const initial = generateInitialInteractions();
      localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(initial));
      syncToIndexedDB(initial, getStoredSettings());
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return generateInitialInteractions();
    }
    return parsed;
  } catch (err) {
    console.error('Erro ao ler atendimentos do localStorage:', err);
    return generateInitialInteractions();
  }
}

export function saveStoredInteractions(interactions: CustomerInteraction[]): void {
  try {
    localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
    const settings = getStoredSettings();
    syncToIndexedDB(interactions, settings);
  } catch (err) {
    console.error('Erro ao salvar atendimentos no localStorage:', err);
  }
}

export function addInteraction(
  item: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt'>
): CustomerInteraction {
  const interactions = getStoredInteractions();
  const now = new Date().toISOString();
  const newItem: CustomerInteraction = {
    ...item,
    id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newItem, ...interactions];
  saveStoredInteractions(updated);
  return newItem;
}

export function updateInteraction(item: CustomerInteraction): CustomerInteraction[] {
  const interactions = getStoredInteractions();
  const updated = interactions.map((i) =>
    i.id === item.id
      ? {
          ...item,
          updatedAt: new Date().toISOString(),
        }
      : i
  );
  saveStoredInteractions(updated);
  return updated;
}

export function deleteInteraction(id: string): CustomerInteraction[] {
  const interactions = getStoredInteractions();
  const updated = interactions.filter((i) => i.id !== id);
  saveStoredInteractions(updated);
  return updated;
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return normalizeSettings(JSON.parse(raw));
  } catch (err) {
    console.error('Erro ao ler configurações do localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    const normalized = normalizeSettings(settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
    const interactions = getStoredInteractions();
    syncToIndexedDB(interactions, normalized);
  } catch (err) {
    console.error('Erro ao salvar configurações:', err);
  }
}

export function resetAllData(): CustomerInteraction[] {
  const initial = generateInitialInteractions();
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(initial));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  syncToIndexedDB(initial, DEFAULT_SETTINGS);
  return initial;
}

export function clearAllData(): CustomerInteraction[] {
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify([]));
  const settings = getStoredSettings();
  syncToIndexedDB([], settings);
  return [];
}

// ---------------- BACKUP & SEGURANÇA ---------------- //

export function getLastBackupTimestamp(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

export function setLastBackupTimestamp(dateStr: string): void {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, dateStr);
  } catch {
    // Ignore
  }
}

/**
 * Cria e descarrega um arquivo de backup JSON no computador do usuário
 */
export function exportManualBackup(
  interactions: CustomerInteraction[],
  settings: AppSettings
): { filename: string; count: number } {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `backup_loja_moveis_${dateStr}_${timeStr}.json`;

  const backupData: BackupFile = {
    version: '1.0.0',
    appName: 'Monitor de Atendimentos e Vendas - Loja de Móveis',
    exportDate: now.toISOString(),
    storeName: settings.storeName || 'Loja de Móveis',
    totalInteractions: interactions.length,
    interactions,
    settings,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Atualiza data do último backup
  const isoDate = now.toISOString();
  setLastBackupTimestamp(isoDate);
  createLocalSnapshot(backupData, 'Backup Manual baixado pelo usuário');

  return { filename, count: interactions.length };
}

/**
 * Registra um snapshot automático de segurança
 */
export function createLocalSnapshot(
  backupData: BackupFile,
  description: string = 'Snapshot Automático'
): void {
  try {
    const existingSnapshots = getLocalSnapshots();
    const newSnapshot: BackupSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      interactionCount: backupData.interactions.length,
      description,
      data: backupData,
    };
    // Mantém os 10 snapshots mais recentes
    const updated = [newSnapshot, ...existingSnapshots.slice(0, 9)];
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar snapshot local:', err);
  }
}

export function getLocalSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Restaura dados a partir de um objeto de backup
 */
export function restoreBackupData(
  backupData: BackupFile,
  mode: 'replace' | 'merge' = 'replace'
): { success: boolean; message: string; count: number } {
  if (!backupData || !Array.isArray(backupData.interactions)) {
    throw new Error('Arquivo de backup inválido ou corrompido.');
  }

  const currentInteractions = getStoredInteractions();
  let finalInteractions: CustomerInteraction[] = [];

  if (mode === 'replace') {
    finalInteractions = backupData.interactions;
  } else {
    // Merge: mantém os existentes e adiciona os que não existem
    const existingIds = new Set(currentInteractions.map((i) => i.id));
    const toAdd = backupData.interactions.filter((i) => !existingIds.has(i.id));
    finalInteractions = [...currentInteractions, ...toAdd];
  }

  saveStoredInteractions(finalInteractions);

  if (backupData.settings) {
    saveStoredSettings(backupData.settings);
  }

  setLastBackupTimestamp(new Date().toISOString());

  return {
    success: true,
    message:
      mode === 'replace'
        ? `Restauração concluída: ${finalInteractions.length} atendimentos carregados.`
        : `Mesclagem concluída: total de ${finalInteractions.length} atendimentos na base.`,
    count: finalInteractions.length,
  };
}

/**
 * Calcula o resumo consolidado de um dia ou conjunto de atendimentos
 */
export function calculateDaySummary(
  date: string,
  interactions: CustomerInteraction[]
): DaySummaryCalculated {
  const dayItems = interactions.filter((i) => i.date === date);
  const totalClients = dayItems.length;

  const salesCount = dayItems.filter((i) => i.status === 'venda_realizada').length;
  const negotiatingCount = dayItems.filter((i) => i.status === 'em_negociacao').length;
  const lostCount = dayItems.filter(
    (i) => i.status === 'desistiu' || i.status === 'sem_interesse'
  ).length;
  const futureReturnCount = dayItems.filter((i) => i.status === 'retorno_futuro').length;

  const totalRevenue = dayItems
    .filter((i) => i.status === 'venda_realizada')
    .reduce((acc, curr) => acc + (Number(curr.saleValue) || 0), 0);

  const conversionRate = totalClients > 0 ? (salesCount / totalClients) * 100 : 0;
  const negotiatingRate = totalClients > 0 ? (negotiatingCount / totalClients) * 100 : 0;
  const lostRate = totalClients > 0 ? (lostCount / totalClients) * 100 : 0;
  const averageTicket = salesCount > 0 ? totalRevenue / salesCount : 0;

  return {
    date,
    totalClients,
    salesCount,
    negotiatingCount,
    lostCount,
    futureReturnCount,
    totalRevenue,
    averageTicket,
    conversionRate: Number(conversionRate.toFixed(1)),
    negotiatingRate: Number(negotiatingRate.toFixed(1)),
    lostRate: Number(lostRate.toFixed(1)),
  };
}
