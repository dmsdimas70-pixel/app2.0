import React, { useState } from 'react';
import { AppSettings, CatalogItem } from '../types';
import {
  Share2,
  Plus,
  Search,
  Edit2,
  Power,
  Info,
  Check,
  X,
  AlertCircle,
  Compass,
} from 'lucide-react';

interface OriginsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onNotify: (msg: string) => void;
}

export const OriginsView: React.FC<OriginsViewProps> = ({
  settings,
  onSaveSettings,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState('');

  const origins: CatalogItem[] = settings.catalogOrigins || [];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (o: CatalogItem) => {
    setEditingItem(o);
    setFormName(o.name);
    setFormActive(o.active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      setFormError('Informe o nome da origem / canal de atendimento.');
      return;
    }

    const isDuplicate = origins.some(
      (o) =>
        o.name.toLowerCase() === cleanName.toLowerCase() &&
        (!editingItem || o.id !== editingItem.id)
    );
    if (isDuplicate) {
      setFormError('Esta origem já está cadastrada no sistema.');
      return;
    }

    let updated: CatalogItem[];
    if (editingItem) {
      updated = origins.map((o) =>
        o.id === editingItem.id ? { ...o, name: cleanName, active: formActive } : o
      );
      onNotify(`Origem "${cleanName}" atualizada com sucesso.`);
    } else {
      const newOrigin: CatalogItem = {
        id: `origin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: cleanName,
        active: formActive,
      };
      updated = [newOrigin, ...origins];
      onNotify(`Nova origem "${cleanName}" cadastrada.`);
    }

    onSaveSettings({
      ...settings,
      catalogOrigins: updated,
      origins: updated.filter((o) => o.active).map((o) => o.name),
    });

    setIsModalOpen(false);
  };

  const handleToggleActive = (o: CatalogItem) => {
    const updated = origins.map((item) =>
      item.id === o.id ? { ...item, active: !item.active } : item
    );
    onSaveSettings({
      ...settings,
      catalogOrigins: updated,
      origins: updated.filter((item) => item.active).map((item) => item.name),
    });
    onNotify(
      o.active
        ? `Origem "${o.name}" foi desativada. Atendimentos passados permanecem intactos.`
        : `Origem "${o.name}" foi reativada.`
    );
  };

  const filteredOrigins = origins.filter((o) => {
    if (statusFilter === 'active' && !o.active) return false;
    if (statusFilter === 'inactive' && o.active) return false;
    if (searchTerm.trim() && !o.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const activeCount = origins.filter((o) => o.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Origens de Clientes
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
              {activeCount} ativas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Canais de atração de clientes (Instagram, Google, Passou em frente, Indicação, etc.)
          </p>
        </div>

        <button
          id="btn-add-origin"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Origem</span>
        </button>
      </div>

      {/* Regra de Preservação */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">Preservação Histórica das Origens</p>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            Desativar uma origem nunca apaga registros históricos de clientes que chegaram por aquele canal. Relatórios comparativos passados continuam íntegros.
          </p>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtro */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar canal de origem (ex: Instagram, Google, Indicação)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
          />
        </div>

        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-2 font-semibold transition-colors ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ativas
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-2 font-semibold transition-colors ${
              statusFilter === 'inactive' ? 'bg-slate-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Desativadas
          </button>
        </div>
      </div>

      {/* Grid de Origens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredOrigins.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            Nenhuma origem encontrada com o termo pesquisado.
          </div>
        ) : (
          filteredOrigins.map((o) => (
            <div
              key={o.id}
              className={`p-4 bg-white rounded-2xl border transition-all ${
                o.active ? 'border-slate-200 shadow-xs' : 'border-slate-200 bg-slate-50/60 opacity-65'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`p-2 rounded-xl mt-0.5 ${o.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 leading-snug">{o.name}</h3>
                    <div className="mt-1">
                      {o.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ativa no Atendimento
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold text-[10px] border border-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Desativada
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(o)}
                    title="Editar Origem"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(o)}
                    title={o.active ? 'Desativar Origem' : 'Ativar Origem'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      o.active ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Adição/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-800">
                {editingItem ? 'Editar Origem' : 'Nova Origem de Cliente'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Canal / Origem *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rádio Local, Outdoor Entrada da Cidade, TikTok..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700">
                    Origem Ativa (disponível para seleção no atendimento)
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  {editingItem ? 'Salvar Alterações' : 'Cadastrar Origem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
