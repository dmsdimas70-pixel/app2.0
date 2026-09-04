import React, { useState } from 'react';
import { AppSettings, ProductItem } from '../types';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Edit2,
  Power,
  Info,
  Check,
  X,
  Tag,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface ProductsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onNotify: (msg: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  settings,
  onSaveSettings,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal de Adicionar / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const products: ProductItem[] = settings.catalogProducts || [];
  const categories = settings.catalogCategories || [];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Sofás & Estofados');
    setFormBrand('');
    setFormActive(true);
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category || categories[0]?.name || 'Sofás & Estofados');
    setFormBrand(p.brand || '');
    setFormActive(p.active);
    setFormNotes(p.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      setFormError('Informe o nome próprio/comercial do produto.');
      return;
    }

    // Check duplicate name on other products
    const isDuplicate = products.some(
      (p) =>
        p.name.toLowerCase() === cleanName.toLowerCase() &&
        (!editingProduct || p.id !== editingProduct.id)
    );
    if (isDuplicate) {
      setFormError('Já existe um produto com este nome cadastrado.');
      return;
    }

    let updatedProducts: ProductItem[];
    if (editingProduct) {
      // Edit existing
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: cleanName,
              category: formCategory,
              brand: formBrand.trim() || undefined,
              active: formActive,
              notes: formNotes.trim() || undefined,
            }
          : p
      );
      onNotify(`Produto "${cleanName}" atualizado com sucesso.`);
    } else {
      // Create new
      const newProd: ProductItem = {
        id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: cleanName,
        category: formCategory,
        brand: formBrand.trim() || undefined,
        active: formActive,
        notes: formNotes.trim() || undefined,
      };
      updatedProducts = [newProd, ...products];
      onNotify(`Novo produto "${cleanName}" cadastrado com sucesso.`);
    }

    onSaveSettings({
      ...settings,
      catalogProducts: updatedProducts,
      products: updatedProducts.filter((p) => p.active).map((p) => p.name),
    });

    setIsModalOpen(false);
  };

  const handleToggleActive = (p: ProductItem) => {
    const updated = products.map((item) =>
      item.id === p.id ? { ...item, active: !item.active } : item
    );
    onSaveSettings({
      ...settings,
      catalogProducts: updated,
      products: updated.filter((item) => item.active).map((item) => item.name),
    });
    onNotify(
      p.active
        ? `Produto "${p.name}" foi desativado. Histórico antigo permanece intacto.`
        : `Produto "${p.name}" foi reativado para novos atendimentos.`
    );
  };

  // Filtragem
  const filteredProducts = products.filter((p) => {
    if (statusFilter === 'active' && !p.active) return false;
    if (statusFilter === 'inactive' && p.active) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchBrand = p.brand?.toLowerCase().includes(term);
      const matchCategory = p.category?.toLowerCase().includes(term);
      if (!matchName && !matchBrand && !matchCategory) return false;
    }
    return true;
  });

  const activeCount = products.filter((p) => p.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Produtos & Móveis
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
              {activeCount} ativos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastro de móveis com nomes comerciais, categorias, fabricantes e controle ativo/inativo
          </p>
        </div>

        <button
          id="btn-add-product"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Produto</span>
        </button>
      </div>

      {/* Regra de Preservação do Histórico (Banner Informativo Obrigatório) */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">Regra de Ouro: Preservação Irrestrita do Histórico</p>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            Se você renomear, editar ou desativar qualquer produto, os atendimentos e vendas já registrados no passado <strong>NUNCA</strong> serão modificados. O histórico permanece fiel ao momento do atendimento original.
          </p>
        </div>
      </div>

      {/* Filtros e Barra de Pesquisa */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por parte do nome (ex: Imperial, Luna, Florença)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Categoria */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 font-semibold transition-colors ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-2 font-semibold transition-colors ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-2 font-semibold transition-colors ${
                statusFilter === 'inactive' ? 'bg-slate-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      {/* Lista / Tabela de Produtos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nome Próprio / Comercial</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Fabricante / Marca</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Observações</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !p.active ? 'opacity-60 bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px] border border-slate-200">
                        {p.category || 'Móveis Gerais'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {p.brand ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.brand}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px] border border-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {p.notes || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Editar Produto"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(p)}
                          title={p.active ? 'Desativar Produto' : 'Ativar Produto'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.active
                              ? 'text-rose-500 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro / Edição de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-800">
                {editingProduct ? 'Editar Produto / Móvel' : 'Novo Produto / Móvel'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nome do Produto */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome Próprio / Comercial do Produto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sofá Imperial 3 Lugares, Mesa Luna 6 Cadeiras..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium text-slate-800"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Categoria do Móvel *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabricante / Marca */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fabricante / Marca (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Estofados Real, Kappesberg, DJ Móveis..."
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 text-slate-800"
                />
              </div>

              {/* Status Ativo/Inativo */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Disponibilidade para Atendimentos
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700">
                    Produto Ativo (disponível para vendedoras selecionarem no atendimento)
                  </span>
                </label>
              </div>

              {/* Observações */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observações Técnicas / Medidas (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tecido linho, medidas 2,20m x 0,95m..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 text-slate-800"
                />
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
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
