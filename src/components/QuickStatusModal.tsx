import React, { useState } from 'react';
import { CustomerInteraction, CustomerStatus } from '../types';
import { STATUS_CONFIG } from '../utils/defaults';
import { X, Check, DollarSign, ShoppingBag } from 'lucide-react';

interface QuickStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  interaction: CustomerInteraction | null;
  onUpdateStatus: (
    id: string,
    newStatus: CustomerStatus,
    saleValue?: number,
    productSold?: string
  ) => void;
}

export const QuickStatusModal: React.FC<QuickStatusModalProps> = ({
  isOpen,
  onClose,
  interaction,
  onUpdateStatus,
}) => {
  if (!isOpen || !interaction) return null;

  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus>(interaction.status);
  const [saleValue, setSaleValue] = useState<string>(
    interaction.saleValue !== undefined ? String(interaction.saleValue) : ''
  );
  const [productSold, setProductSold] = useState<string>(
    interaction.productSold || interaction.product || ''
  );
  const [error, setError] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let numSaleValue: number | undefined = undefined;
    if (selectedStatus === 'venda_realizada') {
      const parsed = parseFloat(saleValue.replace(/\./g, '').replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0) {
        setError('Por favor informe o valor da venda em R$');
        return;
      }
      numSaleValue = parsed;
    }

    onUpdateStatus(
      interaction.id,
      selectedStatus,
      numSaleValue,
      selectedStatus === 'venda_realizada' ? productSold : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Alterar Status do Atendimento</h3>
            <p className="text-xs text-slate-500">
              {interaction.customerName || 'Cliente Balcão'} • {interaction.product}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Selecione o novo status:
            </label>
            <div className="space-y-1.5">
              {(Object.keys(STATUS_CONFIG) as CustomerStatus[]).map((st) => {
                const conf = STATUS_CONFIG[st];
                const isSelected = selectedStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? `${conf.bgClass} border-indigo-600 ring-2 ring-indigo-500/20 font-bold`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{conf.label}</span>
                      <p className="text-[11px] opacity-80 mt-0.5">{conf.description}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Se mudou para Venda realizada, pede o valor da venda */}
          {selectedStatus === 'venda_realizada' && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <span>Registrar Faturamento da Venda</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Valor Fechado (R$) *</span>
                </label>
                <input
                  id="input-quick-sale-value"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 5800.00"
                  value={saleValue}
                  onChange={(e) => setSaleValue(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-emerald-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Produto Vendido
                </label>
                <input
                  id="input-quick-product-sold"
                  type="text"
                  placeholder="Ex: Sofá Retrátil 3 Lugares"
                  value={productSold}
                  onChange={(e) => setProductSold(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-confirm-status-update"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              Confirmar Alteração
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
