import React, { useState, useEffect } from 'react';
import { CustomerInteraction, CustomerStatus, AppSettings } from '../types';
import { STATUS_CONFIG } from '../utils/defaults';
import { X, Check, ShoppingBag, User, Tag, Layers, Share2, DollarSign } from 'lucide-react';

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: CustomerInteraction | null;
  defaultDate: string;
  settings: AppSettings;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
  settings,
}) => {
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('10:00');
  const [customerName, setCustomerName] = useState('');
  const [sellerName, setSellerName] = useState(settings.sellers[0] || 'Vendedora 1');
  const [origin, setOrigin] = useState(settings.origins[0] || 'Instagram');
  const [campaign, setCampaign] = useState(settings.campaigns[0] || 'Campanha de Sofá');
  const [product, setProduct] = useState(settings.products[0] || 'Sofá');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [status, setStatus] = useState<CustomerStatus>('em_negociacao');
  const [saleValue, setSaleValue] = useState<string>('');
  const [productSold, setProductSold] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Active products in catalog
  const catalogProducts = settings.catalogProducts && settings.catalogProducts.length > 0
    ? settings.catalogProducts.filter((p) => p.active)
    : settings.products.map((p, i) => ({ id: `p-${i}`, name: p, category: 'Móveis Gerais', active: true }));

  const filteredCatalogProducts = catalogProducts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (productSearch.trim()) {
      const term = productSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchBrand = (p as any).brand?.toLowerCase().includes(term);
      const matchCat = p.category?.toLowerCase().includes(term);
      if (!matchName && !matchBrand && !matchCat) return false;
    }
    return true;
  });

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setTime(initialData.time);
      setCustomerName(initialData.customerName || '');
      setSellerName(initialData.sellerName || settings.sellers[0] || '');
      setOrigin(initialData.origin || settings.origins[0]);
      setCampaign(initialData.campaign || settings.campaigns[0]);
      setProduct(initialData.product || settings.products[0]);
      setStatus(initialData.status);
      setSaleValue(initialData.saleValue !== undefined ? String(initialData.saleValue) : '');
      setProductSold(initialData.productSold || initialData.product || '');
      setNotes(initialData.notes || '');
    } else {
      // Default new interaction
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setDate(defaultDate);
      setTime(`${hh}:${mm}`);
      setCustomerName('');
      setSellerName(settings.sellers[0] || 'Vendedora 1');
      setOrigin(settings.origins[0] || 'Instagram');
      setCampaign(settings.campaigns[0] || 'Campanha de Sofá');
      setProduct(settings.products[0] || 'Sofá');
      setStatus('em_negociacao');
      setSaleValue('');
      setProductSold('');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen, defaultDate, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!origin) newErrors.origin = 'Selecione a origem do cliente';
    if (!campaign) newErrors.campaign = 'Selecione a campanha';
    if (!product) newErrors.product = 'Selecione o produto de interesse';

    let numericSaleValue: number | undefined = undefined;
    if (status === 'venda_realizada') {
      const val = parseFloat(saleValue.replace(/\./g, '').replace(',', '.'));
      if (isNaN(val) || val <= 0) {
        newErrors.saleValue = 'Informe um valor de venda válido em R$';
      } else {
        numericSaleValue = val;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      date,
      time,
      customerName: customerName.trim() || undefined,
      sellerName: sellerName.trim() || undefined,
      origin,
      campaign,
      product,
      status,
      saleValue: numericSaleValue,
      productSold: status === 'venda_realizada' ? (productSold.trim() || product) : undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialData ? 'Editar Atendimento' : 'Registrar Atendimento'}
            </h2>
            <p className="text-xs text-slate-500">
              Controle rápido de fluxo e conversão da loja de móveis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Data e Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data do Atendimento *
              </label>
              <input
                id="input-interaction-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horário da Chegada
              </label>
              <input
                id="input-interaction-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          {/* Vendedora Responsável & Referência Opcional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendedora Responsável
              </label>
              <select
                id="select-interaction-seller"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {settings.sellers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Identificador / Ref. (Opcional)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Não obrigatório</span>
              </label>
              <input
                id="input-interaction-customer"
                type="text"
                placeholder="Opcional (Ex: Balcão 1, Casal Sala...)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 bg-slate-50/60"
              />
            </div>
          </div>

          {/* Origem do Cliente (Subdivisão requerida no prompt) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Origem dos Atendimentos * (De onde o cliente veio?)</span>
            </label>
            <select
              id="select-interaction-origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              {settings.origins.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {errors.origin && <p className="text-xs text-rose-600 mt-1">{errors.origin}</p>}
          </div>

          {/* Origem e Campanha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Origem do Cliente *</span>
              </label>
              <select
                id="select-interaction-origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-800"
              >
                {(settings.catalogOrigins && settings.catalogOrigins.length > 0
                  ? settings.catalogOrigins.filter((o) => o.active)
                  : settings.origins.map((o) => ({ id: o, name: o }))
                ).map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </select>
              {errors.origin && <p className="text-xs text-rose-600 mt-1">{errors.origin}</p>}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Campanha Relacionada *</span>
              </label>
              <select
                id="select-interaction-campaign"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-800"
              >
                {(settings.catalogCampaigns && settings.catalogCampaigns.length > 0
                  ? settings.catalogCampaigns.filter((c) => c.active)
                  : settings.campaigns.map((c) => ({ id: c, name: c }))
                ).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.campaign && <p className="text-xs text-rose-600 mt-1">{errors.campaign}</p>}
            </div>
          </div>

          {/* Seleção do Produto / Móvel com Pesquisa Instantânea e Filtro por Categoria (Seção 7) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Produto / Móvel de Interesse * (Nome Próprio / Comercial)</span>
              </label>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 truncate max-w-[200px]">
                {product || 'Nenhum selecionado'}
              </span>
            </div>

            {/* Campo de pesquisa por parte do nome */}
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar por parte do nome (ex: Imperial, Montreal, Luna, Cozinha)..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white placeholder-slate-400"
              />
            </div>

            {/* Filtro rápido de categoria */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todas
              </button>
              {(settings.catalogCategories || []).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Lista com scroll de produtos ativos filtrados */}
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
              {filteredCatalogProducts.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  Nenhum móvel cadastrado encontrado. Você pode digitar abaixo.
                </div>
              ) : (
                filteredCatalogProducts.map((p) => {
                  const isChosen = product === p.name;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProduct(p.name);
                        if (!productSold) setProductSold(p.name);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors ${
                        isChosen
                          ? 'bg-indigo-50 font-bold text-indigo-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isChosen ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                        <span>{p.name}</span>
                        {p.brand && (
                          <span className="text-[10px] text-slate-400 font-normal">({p.brand})</span>
                        )}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">
                        {p.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Fallback de digitação livre se não estiver na lista */}
            <div className="pt-1">
              <input
                type="text"
                placeholder="Ou digite outro produto/móvel sob medida aqui..."
                value={product}
                onChange={(e) => {
                  setProduct(e.target.value);
                  if (!productSold) setProductSold(e.target.value);
                }}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            {errors.product && <p className="text-xs text-rose-600 mt-1">{errors.product}</p>}
          </div>

          {/* Status do Atendimento (Obrigatório - 5 status essenciais) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Status do Atendimento * (Como terminou ou está o cliente?)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(STATUS_CONFIG) as CustomerStatus[]).map((st) => {
                const conf = STATUS_CONFIG[st];
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${conf.borderClass} ${conf.bgClass} ring-2 ring-indigo-500/20 shadow-xs font-bold`
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">{conf.label}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{conf.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campo Condicional: Se venda realizada, solicitar Valor da Venda e Produto Vendido */}
          {status === 'venda_realizada' && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Dados do Fechamento da Venda</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    Valor da Venda (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                      R$
                    </span>
                    <input
                      id="input-interaction-sale-value"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 4800,00"
                      value={saleValue}
                      onChange={(e) => setSaleValue(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono font-bold text-emerald-950"
                      required
                    />
                  </div>
                  {errors.saleValue && (
                    <p className="text-xs text-rose-600 mt-1">{errors.saleValue}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    Produto Vendido (Descrição)
                  </label>
                  <input
                    id="input-interaction-product-sold"
                    type="text"
                    placeholder="Ex: Sofá Retrátil 3 Lugares Suede"
                    value={productSold}
                    onChange={(e) => setProductSold(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
              <p className="text-xs text-emerald-800">
                Origem vinculada: <strong className="font-semibold">{origin}</strong> | Campanha:{' '}
                <strong className="font-semibold">{campaign}</strong>
              </p>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações / Detalhes da Negociação
            </label>
            <textarea
              id="textarea-interaction-notes"
              rows={2}
              placeholder="Ex: Cliente tem sala de 3x4m, pediu desconto à vista no Pix, retorna na terça."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-interaction"
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm"
            >
              {initialData ? 'Atualizar Atendimento' : 'Salvar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
