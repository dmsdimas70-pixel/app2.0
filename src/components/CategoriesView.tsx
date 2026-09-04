import React, { useState } from 'react';
import { AppSettings, CategoryItem } from '../types';
import {
  FolderTree,
  Plus,
  Edit2,
  Power,
  Info,
  Check,
  X,
  AlertCircle,
  Package,
} from 'lucide-react';

interface CategoriesViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onNotify: (msg: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  settings,
  onSaveSettings,
  onNotify,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState('');

  const categories: CategoryItem[] = settings.catalogCategories || [];
  const products = settings.catalogProducts || [];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingItem(cat);
    setFormName(cat.name);
    setFormActive(cat.active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      setFormError('Informe o nome da categoria.');
      return;
    }

    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === cleanName.toLowerCase() &&
        (!editingItem || c.id !== editingItem.id)
    );
    if (isDuplicate) {
      setFormError('Já existe uma categoria com este nome cadastrada.');
      return;
    }

    let updated: CategoryItem[];
    if (editingItem) {
      updated = categories.map((c) =>
        c.id === editingItem.id ? { ...c, name: cleanName, active: formActive } : c
      );
      onNotify(`Categoria "${cleanName}" atualizada.`);
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: cleanName,
        active: formActive,
      };
      updated = [...categories, newCat];
      onNotify(`Categoria "${cleanName}" criada com sucesso.`);
    }

    onSaveSettings({
      ...settings,
      catalogCategories: updated,
      categories: updated.filter((c) => c.active).map((c) => c.name),
    });

    setIsModalOpen(false);
  };

  const handleToggleActive = (cat: CategoryItem) => {
    const updated = categories.map((item) =>
      item.id === cat.id ? { ...item, active: !item.active } : item
    );
    onSaveSettings({
      ...settings,
      catalogCategories: updated,
      categories: updated.filter((item) => item.active).map((item) => item.name),
    });
    onNotify(
      cat.active
        ? `Categoria "${cat.name}" foi desativada.`
        : `Categoria "${cat.name}" foi reativada.`
    );
  };

  const activeCount = categories.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Categorias de Móveis
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
              {activeCount} ativas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Classificação estruturada para filtragem rápida no cadastro de produtos e atendimento
          </p>
        </div>

        <button
          id="btn-add-category"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Categoria</span>
        </button>
      </div>

      {/* Regra de Preservação */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">Preservação do Histórico e Categorização</p>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            A desativação de uma categoria não apaga produtos vinculados a ela nem altera os registros passados de atendimento da loja.
          </p>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const countProducts = products.filter((p) => p.category === cat.name).length;
          return (
            <div
              key={cat.id}
              className={`p-4 bg-white rounded-2xl border transition-all ${
                cat.active ? 'border-slate-200 shadow-xs' : 'border-slate-200 bg-slate-50/60 opacity-65'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`p-2 rounded-xl mt-0.5 ${cat.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 leading-snug">{cat.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span>{countProducts} produto{countProducts === 1 ? '' : 's'}</span>
                      </span>
                      {cat.active ? (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] border border-emerald-200">
                          Ativa
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold text-[10px] border border-slate-300">
                          Inativa
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    title="Editar Categoria"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(cat)}
                    title={cat.active ? 'Desativar Categoria' : 'Ativar Categoria'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      cat.active ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Adição/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-800">
                {editingItem ? 'Editar Categoria' : 'Nova Categoria de Móveis'}
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
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sofás & Estofados, Quartos & Roupeiros..."
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
                    Categoria Ativa (disponível para novos produtos)
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
                  {editingItem ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
