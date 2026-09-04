import React, { useState } from 'react';
import { AppSettings, CatalogItem } from '../types';
import {
  Tag,
  Layers,
  Share2,
  Users,
  Plus,
  Edit2,
  Check,
  X,
  Power,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface CatalogViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onNotify: (msg: string) => void;
}

type CatalogSection = 'campaigns' | 'products' | 'origins' | 'sellers';

export const CatalogView: React.FC<CatalogViewProps> = ({
  settings,
  onSaveSettings,
  onNotify,
}) => {
  const [activeSection, setActiveSection] = useState<CatalogSection>('campaigns');

  // Working state
  const [campaigns, setCampaigns] = useState<CatalogItem[]>(
    settings.catalogCampaigns ||
      settings.campaigns.map((c, i) => ({ id: `c-${i}`, name: c, active: true }))
  );
  const [products, setProducts] = useState<CatalogItem[]>(
    settings.catalogProducts ||
      settings.products.map((p, i) => ({ id: `p-${i}`, name: p, active: true }))
  );
  const [origins, setOrigins] = useState<CatalogItem[]>(
    settings.catalogOrigins ||
      settings.origins.map((o, i) => ({ id: `o-${i}`, name: o, active: true }))
  );
  const [sellers, setSellers] = useState<CatalogItem[]>(
    settings.catalogSellers ||
      settings.sellers.map((s, i) => ({ id: `s-${i}`, name: s, active: true }))
  );

  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;

    const newItem: CatalogItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      active: true,
    };

    let updatedCampaigns = campaigns;
    let updatedProducts = products;
    let updatedOrigins = origins;
    let updatedSellers = sellers;

    if (activeSection === 'campaigns') {
      if (campaigns.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        alert('Esta campanha já está cadastrada.');
        return;
      }
      updatedCampaigns = [...campaigns, newItem];
      setCampaigns(updatedCampaigns);
    } else if (activeSection === 'products') {
      if (products.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        alert('Este produto já está cadastrado.');
        return;
      }
      updatedProducts = [...products, newItem];
      setProducts(updatedProducts);
    } else if (activeSection === 'origins') {
      if (origins.some((o) => o.name.toLowerCase() === name.toLowerCase())) {
        alert('Esta origem já está cadastrada.');
        return;
      }
      updatedOrigins = [...origins, newItem];
      setOrigins(updatedOrigins);
    } else if (activeSection === 'sellers') {
      if (sellers.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
        alert('Esta vendedora já está cadastrada.');
        return;
      }
      updatedSellers = [...sellers, newItem];
      setSellers(updatedSellers);
    }

    setNewItemName('');
    persistSettings(updatedCampaigns, updatedProducts, updatedOrigins, updatedSellers);
    onNotify(`"${name}" adicionado com sucesso!`);
  };

  const handleToggleActive = (id: string) => {
    let updatedCampaigns = campaigns;
    let updatedProducts = products;
    let updatedOrigins = origins;
    let updatedSellers = sellers;

    if (activeSection === 'campaigns') {
      updatedCampaigns = campaigns.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      );
      setCampaigns(updatedCampaigns);
    } else if (activeSection === 'products') {
      updatedProducts = products.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      );
      setProducts(updatedProducts);
    } else if (activeSection === 'origins') {
      updatedOrigins = origins.map((o) =>
        o.id === id ? { ...o, active: !o.active } : o
      );
      setOrigins(updatedOrigins);
    } else if (activeSection === 'sellers') {
      updatedSellers = sellers.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      );
      setSellers(updatedSellers);
    }

    persistSettings(updatedCampaigns, updatedProducts, updatedOrigins, updatedSellers);
    onNotify('Status do item alterado.');
  };

  const handleStartEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    let updatedCampaigns = campaigns;
    let updatedProducts = products;
    let updatedOrigins = origins;
    let updatedSellers = sellers;

    if (activeSection === 'campaigns') {
      updatedCampaigns = campaigns.map((c) =>
        c.id === id ? { ...c, name: trimmed } : c
      );
      setCampaigns(updatedCampaigns);
    } else if (activeSection === 'products') {
      updatedProducts = products.map((p) =>
        p.id === id ? { ...p, name: trimmed } : p
      );
      setProducts(updatedProducts);
    } else if (activeSection === 'origins') {
      updatedOrigins = origins.map((o) =>
        o.id === id ? { ...o, name: trimmed } : o
      );
      setOrigins(updatedOrigins);
    } else if (activeSection === 'sellers') {
      updatedSellers = sellers.map((s) =>
        s.id === id ? { ...s, name: trimmed } : s
      );
      setSellers(updatedSellers);
    }

    setEditingId(null);
    setEditingName('');
    persistSettings(updatedCampaigns, updatedProducts, updatedOrigins, updatedSellers);
    onNotify('Nome do item atualizado com sucesso!');
  };

  const persistSettings = (
    c: CatalogItem[],
    p: CatalogItem[],
    o: CatalogItem[],
    s: CatalogItem[]
  ) => {
    onSaveSettings({
      ...settings,
      catalogCampaigns: c,
      campaigns: c.filter((i) => i.active).map((i) => i.name),
      catalogProducts: p,
      products: p.filter((i) => i.active).map((i) => i.name),
      catalogOrigins: o,
      origins: o.filter((i) => i.active).map((i) => i.name),
      catalogSellers: s,
      sellers: s.filter((i) => i.active).map((i) => i.name),
    });
  };

  const currentList =
    activeSection === 'campaigns'
      ? campaigns
      : activeSection === 'products'
      ? products
      : activeSection === 'origins'
      ? origins
      : sellers;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Cadastros e Parâmetros</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie campanhas, produtos de interesse e canais de origem da loja com ativação/desativação
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs text-indigo-900 font-medium">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Regra 21 Ativa: Nenhum registro histórico é apagado ao desativar itens</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs gap-1">
        <button
          type="button"
          onClick={() => {
            setActiveSection('campaigns');
            setEditingId(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === 'campaigns'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Campanhas ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('products');
            setEditingId(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === 'products'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Produtos / Móveis ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('origins');
            setEditingId(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === 'origins'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Origens do Cliente ({origins.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('sellers');
            setEditingId(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === 'sellers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Vendedoras ({sellers.length})</span>
        </button>
      </div>

      {/* Add New Item Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder={
              activeSection === 'campaigns'
                ? 'Nome da nova campanha (Ex: Liquidação de Inverno, Saldão de Sofás...)'
                : activeSection === 'products'
                ? 'Nome do novo produto / móvel (Ex: Cadeira Eiffel, Cabeceira Estofada...)'
                : activeSection === 'origins'
                ? 'Nome da nova origem (Ex: TikTok Ads, Rádio Local, Fachada...)'
                : 'Nome da nova vendedora / atendente'
            }
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar ao Cadastro</span>
          </button>
        </form>
      </div>

      {/* List of Items */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Lista de Itens Cadastrados ({currentList.filter((i) => i.active).length} ativos •{' '}
            {currentList.filter((i) => !i.active).length} desativados)
          </span>
          <span className="text-slate-400 text-[11px]">
            Itens desativados não aparecem em novos atendimentos, mas mantêm histórico
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {currentList.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  item.active ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/50 opacity-60'
                }`}
              >
                {/* Left: Name or Edit Input */}
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.active ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'
                    }`}
                  />
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="flex-1 px-3 py-1.5 text-xs border border-indigo-400 rounded-lg focus:outline-none ring-2 ring-indigo-200 font-bold text-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        title="Salvar alteração"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className={`text-xs font-bold ${item.active ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                        {item.name}
                      </span>
                      {!item.active && (
                        <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                          Desativado (Preservado no Histórico)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar Nome"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        item.active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={item.active ? 'Desativar este item' : 'Reativar este item'}
                    >
                      <Power className="w-3 h-3" />
                      <span>{item.active ? 'Desativar' : 'Reativar'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
