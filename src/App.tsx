import React, { useState, useEffect } from 'react';
import { CustomerInteraction, CustomerStatus, AppSettings, UserRole } from './types';
import {
  getStoredInteractions,
  saveStoredInteractions,
  addInteraction,
  updateInteraction,
  deleteInteraction,
  getStoredSettings,
  saveStoredSettings,
  calculateDaySummary,
  resetAllData,
  clearAllData,
  createLocalSnapshot,
} from './utils/storage';
import { getReferenceDate } from './utils/analytics';
import { Navbar, ActiveTab } from './components/Navbar';
import { DailyView } from './components/DailyView';
import { HistoryView } from './components/HistoryView';
import { DashboardView } from './components/DashboardView';
import { ReportsView } from './components/ReportsView';
import { CatalogView } from './components/CatalogView';
import { ProductsView } from './components/ProductsView';
import { CampaignsView } from './components/CampaignsView';
import { CategoriesView } from './components/CategoriesView';
import { OriginsView } from './components/OriginsView';
import { BackupSecurityView } from './components/BackupSecurityView';
import { AutomatedAnalysisView } from './components/AutomatedAnalysisView';
import { InteractionModal } from './components/InteractionModal';
import { QuickStatusModal } from './components/QuickStatusModal';
import { SettingsModal } from './components/SettingsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { STATUS_CONFIG } from './utils/defaults';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(getReferenceDate());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerInteraction | null>(null);

  const [isQuickStatusOpen, setIsQuickStatusOpen] = useState(false);
  const [statusTargetItem, setStatusTargetItem] = useState<CustomerInteraction | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<CustomerInteraction | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Load data on mount
  useEffect(() => {
    const loaded = getStoredInteractions();
    setInteractions(loaded);
    const loadedSettings = getStoredSettings();
    setSettings(loadedSettings);
  }, []);

  // Periodic Auto-Snapshot (every 30 mins)
  useEffect(() => {
    const interval = setInterval(() => {
      if (interactions.length > 0) {
        createLocalSnapshot(
          {
            version: '1.0.0',
            appName: 'Monitor de Atendimentos e Vendas',
            exportDate: new Date().toISOString(),
            storeName: settings.storeName,
            totalInteractions: interactions.length,
            interactions,
            settings,
          },
          'Snapshot Periódico Automático de 30min'
        );
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [interactions, settings]);

  // Recalculate day summary in real time for selectedDate
  const daySummary = calculateDaySummary(selectedDate, interactions);

  // Handlers
  const handleSaveInteraction = (
    data: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingItem) {
      // Edit
      const updatedItem: CustomerInteraction = {
        ...editingItem,
        ...data,
      };
      const updatedList = updateInteraction(updatedItem);
      setInteractions(updatedList);
      showToast('Atendimento atualizado com sucesso!');
    } else {
      // Add
      const created = addInteraction(data);
      const updatedList = [created, ...interactions];
      setInteractions(updatedList);
      showToast('Novo atendimento registrado no banco local!');
    }
  };

  const handleQuickStatusUpdate = (
    id: string,
    newStatus: CustomerStatus,
    saleValue?: number,
    productSold?: string
  ) => {
    const target = interactions.find((i) => i.id === id);
    if (!target) return;

    const updated: CustomerInteraction = {
      ...target,
      status: newStatus,
      saleValue: newStatus === 'venda_realizada' ? saleValue : target.saleValue,
      productSold:
        newStatus === 'venda_realizada' && productSold ? productSold : target.productSold,
    };

    const updatedList = updateInteraction(updated);
    setInteractions(updatedList);
    showToast(`Status atualizado para "${STATUS_CONFIG[newStatus].label}"!`);
  };

  const handleRequestDelete = (item: CustomerInteraction) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    const updated = deleteInteraction(deletingItem.id);
    setInteractions(updated);
    setDeletingItem(null);
    showToast('Atendimento excluído com segurança.');
  };

  const handleQuickAdd = (origin: string, campaign: string, product: string) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const created = addInteraction({
      date: selectedDate,
      time: `${hh}:${mm}`,
      sellerName: settings.sellers[0] || 'Vendedora 1',
      origin,
      campaign,
      product,
      status: 'em_negociacao',
    });

    setInteractions([created, ...interactions]);
    showToast('Chegada registrada instantaneamente!');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleResetData = () => {
    const fresh = resetAllData();
    setInteractions(fresh);
    const defSettings = getStoredSettings();
    setSettings(defSettings);
    showToast('Base de demonstração recarregada com sucesso!');
  };

  const handleClearData = () => {
    const cleared = clearAllData();
    setInteractions(cleared);
    showToast('Todos os atendimentos foram excluídos.');
  };

  const handleDataRestored = (
    restoredInteractions: CustomerInteraction[],
    restoredSettings?: AppSettings
  ) => {
    setInteractions(restoredInteractions);
    if (restoredSettings) {
      setSettings(restoredSettings);
    }
  };

  const handleToggleUserRole = () => {
    const nextRole: UserRole = settings.userRole === 'administrador' ? 'vendedora' : 'administrador';
    const updated: AppSettings = { ...settings, userRole: nextRole };
    setSettings(updated);
    saveStoredSettings(updated);
    showToast(`Perfil alterado para: ${nextRole.toUpperCase()}`);
    if (nextRole === 'vendedora') {
      const adminTabs: ActiveTab[] = ['reports', 'campaigns', 'products', 'categories', 'origins', 'backup', 'settings', 'analysis'];
      if (adminTabs.includes(activeTab)) {
        setActiveTab('daily');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] text-[#1E293B] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        storeName={settings.storeName}
        currentDate={selectedDate}
        userRole={settings.userRole || 'administrador'}
        onToggleUserRole={handleToggleUserRole}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewInteraction={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Dashboard Geral (Seção 2) */}
        {activeTab === 'dashboard' && <DashboardView interactions={interactions} />}

        {/* Tab 2: Atendimentos do Dia (Seções 3, 4, 10) */}
        {activeTab === 'daily' && (
          <DailyView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            interactions={interactions}
            daySummary={daySummary}
            onNewInteraction={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            onEditInteraction={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            onQuickChangeStatus={(item) => {
              setStatusTargetItem(item);
              setIsQuickStatusOpen(true);
            }}
            onDeleteRequest={handleRequestDelete}
            settings={settings}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {/* Tab 3: Histórico Completo com Filtros (Seção 15) */}
        {activeTab === 'history' && (
          <HistoryView
            interactions={interactions}
            settings={settings}
            onEditInteraction={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            onQuickChangeStatus={(item) => {
              setStatusTargetItem(item);
              setIsQuickStatusOpen(true);
            }}
            onDeleteRequest={handleRequestDelete}
          />
        )}

        {/* Tab 4: Relatórios Estatísticos e Exportação (Seção 11) */}
        {activeTab === 'reports' && (
          <ReportsView interactions={interactions} storeName={settings.storeName} />
        )}

        {/* Tab 5: Campanhas Promocionais (Seção 6) */}
        {activeTab === 'campaigns' && (
          <CampaignsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onNotify={showToast}
          />
        )}

        {/* Tab 6: Produtos / Móveis (Seção 7) */}
        {activeTab === 'products' && (
          <ProductsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onNotify={showToast}
          />
        )}

        {/* Tab 7: Categorias de Móveis (Seção 7) */}
        {activeTab === 'categories' && (
          <CategoriesView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onNotify={showToast}
          />
        )}

        {/* Tab 8: Origens de Clientes (Seção 5) */}
        {activeTab === 'origins' && (
          <OriginsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onNotify={showToast}
          />
        )}

        {/* Tab 9: Backup & Segurança Local (Seções 1, 16) */}
        {activeTab === 'backup' && (
          <BackupSecurityView
            interactions={interactions}
            settings={settings}
            onDataRestored={handleDataRestored}
            onNotify={showToast}
          />
        )}

        {/* Tab 10: Análise Automática Inteligente & Comparativo (Seções 12, 13, 14) */}
        {activeTab === 'analysis' && <AutomatedAnalysisView interactions={interactions} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 print:hidden text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{settings.storeName}</span>
            <span>•</span>
            <span>Monitoramento de Chegadas e Conversão de Clientes</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
            <span className="text-emerald-600 font-bold">● Modo Portátil Offline Ativo</span>
            <span>•</span>
            <span>{interactions.length} atendimentos registrados</span>
            <span>•</span>
            <span>Banco IndexedDB Seguro</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-[#334155]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Novo / Editar Atendimento */}
      <InteractionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveInteraction}
        initialData={editingItem}
        defaultDate={selectedDate}
        settings={settings}
      />

      {/* Modal: Alteração Rápida de Status */}
      <QuickStatusModal
        isOpen={isQuickStatusOpen}
        onClose={() => {
          setIsQuickStatusOpen(false);
          setStatusTargetItem(null);
        }}
        interaction={statusTargetItem}
        onUpdateStatus={handleQuickStatusUpdate}
      />

      {/* Modal: Confirmação de Exclusão Definitiva */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
        interaction={deletingItem}
      />

      {/* Modal: Configurações Gerais */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetData}
        onClearData={handleClearData}
      />
    </div>
  );
}
