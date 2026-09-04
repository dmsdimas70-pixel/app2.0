import React, { useState } from 'react';
import { AppSettings } from '../types';
import { X, Plus, Trash2, RotateCcw, AlertTriangle, Check, Layers, Tag, Share2, Users } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onClearData: () => void;
}

type SettingsTab = 'origins' | 'campaigns' | 'products' | 'sellers' | 'general';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
  onClearData,
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('origins');
  const [storeName, setStoreName] = useState(settings.storeName);
  const [origins, setOrigins] = useState<string[]>([...settings.origins]);
  const [campaigns, setCampaigns] = useState<string[]>([...settings.campaigns]);
  const [products, setProducts] = useState<string[]>([...settings.products]);
  const [sellers, setSellers] = useState<string[]>([...settings.sellers]);

  const [newOrigin, setNewOrigin] = useState('');
  const [newCampaign, setNewCampaign] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newSeller, setNewSeller] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrigin.trim() && !origins.includes(newOrigin.trim())) {
      setOrigins([...origins, newOrigin.trim()]);
      setNewOrigin('');
    }
  };

  const handleRemoveOrigin = (item: string) => {
    if (origins.length <= 1) {
      alert('É necessário manter ao menos 1 opção de origem.');
      return;
    }
    setOrigins(origins.filter((o) => o !== item));
  };

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCampaign.trim() && !campaigns.includes(newCampaign.trim())) {
      setCampaigns([...campaigns, newCampaign.trim()]);
      setNewCampaign('');
    }
  };

  const handleRemoveCampaign = (item: string) => {
    if (campaigns.length <= 1) {
      alert('É necessário manter ao menos 1 opção de campanha.');
      return;
    }
    setCampaigns(campaigns.filter((c) => c !== item));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.trim() && !products.includes(newProduct.trim())) {
      setProducts([...products, newProduct.trim()]);
      setNewProduct('');
    }
  };

  const handleRemoveProduct = (item: string) => {
    if (products.length <= 1) {
      alert('É necessário manter ao menos 1 categoria de produto.');
      return;
    }
    setProducts(products.filter((p) => p !== item));
  };

  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSeller.trim() && !sellers.includes(newSeller.trim())) {
      setSellers([...sellers, newSeller.trim()]);
      setNewSeller('');
    }
  };

  const handleRemoveSeller = (item: string) => {
    if (sellers.length <= 1) {
      alert('É necessário manter ao menos 1 vendedora.');
      return;
    }
    setSellers(sellers.filter((s) => s !== item));
  };

  const handleSaveAll = () => {
    onSaveSettings({
      storeName: storeName.trim() || 'MÓVEIS PREMIUM',
      origins,
      campaigns,
      products,
      sellers,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Configurações & Cadastros</h2>
            <p className="text-xs text-slate-500">
              Personalize as listas de origens, campanhas, produtos e parâmetros da loja
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-100/60 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('origins')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'origins'
                ? 'border-indigo-600 text-indigo-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Origens ({origins.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'campaigns'
                ? 'border-indigo-600 text-indigo-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Campanhas ({campaigns.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'products'
                ? 'border-indigo-600 text-indigo-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Produtos / Móveis ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sellers')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'sellers'
                ? 'border-indigo-600 text-indigo-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Vendedoras ({sellers.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('general')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === 'general'
                ? 'border-indigo-600 text-indigo-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Geral & Dados
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB: ORIGENS */}
          {activeSubTab === 'origins' && (
            <div className="space-y-4">
              <form onSubmit={handleAddOrigin} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova origem (Ex: TikTok Ads, Fachada/Vitrine...)"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </form>

              <div className="space-y-2">
                {origins.map((orig) => (
                  <div
                    key={orig}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <span className="font-semibold text-slate-800">{orig}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOrigin(orig)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CAMPANHAS */}
          {activeSubTab === 'campaigns' && (
            <div className="space-y-4">
              <form onSubmit={handleAddCampaign} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova campanha (Ex: Mega Saldão de Mostruário...)"
                  value={newCampaign}
                  onChange={(e) => setNewCampaign(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </form>

              <div className="space-y-2">
                {campaigns.map((camp) => (
                  <div
                    key={camp}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <span className="font-semibold text-slate-800">{camp}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCampaign(camp)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PRODUTOS */}
          {activeSubTab === 'products' && (
            <div className="space-y-4">
              <form onSubmit={handleAddProduct} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Novo produto / móvel (Ex: Poltronas, Cadeiras de Jantar...)"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </form>

              <div className="space-y-2">
                {products.map((prod) => (
                  <div
                    key={prod}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <span className="font-semibold text-slate-800">{prod}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(prod)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: VENDEDORAS */}
          {activeSubTab === 'sellers' && (
            <div className="space-y-4">
              <form onSubmit={handleAddSeller} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova vendedora (Ex: Patrícia...)"
                  value={newSeller}
                  onChange={(e) => setNewSeller(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </form>

              <div className="space-y-2">
                {sellers.map((sell) => (
                  <div
                    key={sell}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <span className="font-semibold text-slate-800">{sell}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSeller(sell)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GERAL */}
          {activeSubTab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                />
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <RotateCcw className="w-4 h-4 text-indigo-700" />
                  <span>Dados de Exemplo & Demonstração</span>
                </div>
                <p className="text-xs text-indigo-800">
                  Caso deseje testar todos os gráficos e relatórios com atendimentos de exemplo de Agosto e Setembro de 2026:
                </p>
                <button
                  type="button"
                  id="btn-reset-demo-data"
                  onClick={() => {
                    if (confirm('Deseja recarregar a base de dados de demonstração?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Recarregar Dados de Demonstração
                </button>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>Limpar Todos os Atendimentos</span>
                </div>
                <p className="text-xs text-rose-800">
                  Zera todos os atendimentos cadastrados para começar uma base 100% limpa do zero na sua loja.
                </p>
                <button
                  type="button"
                  id="btn-clear-all-data"
                  onClick={() => {
                    if (confirm('Atenção: tem certeza que deseja excluir todos os atendimentos salvos?')) {
                      onClearData();
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Zerar Todos os Dados
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4" /> Alterações salvas com sucesso!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Clique para salvar as listas atualizadas</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              id="btn-save-settings"
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
