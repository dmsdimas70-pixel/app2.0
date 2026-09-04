import React from 'react';
import { CustomerInteraction } from '../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  interaction: CustomerInteraction | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  interaction,
}) => {
  if (!isOpen || !interaction) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-fadeIn">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-800">
              Confirmar Exclusão Definitiva
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Esta ação removerá este atendimento do banco de dados local da loja.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-400">Data e Hora:</span>
            <span className="font-semibold">{interaction.date} às {interaction.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Produto / Móvel:</span>
            <span className="font-semibold">{interaction.product}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Origem:</span>
            <span className="font-semibold">{interaction.origin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Campanha:</span>
            <span className="font-semibold">{interaction.campaign}</span>
          </div>
          {interaction.saleValue && interaction.saleValue > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Valor da Venda:</span>
              <span>R$ {interaction.saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-delete-interaction"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Definitivamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
