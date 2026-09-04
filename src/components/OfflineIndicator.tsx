import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      id="badge-offline-status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/90 text-white border border-slate-700 px-3.5 py-2 text-xs font-semibold shadow-2xl backdrop-blur-md animate-fadeIn"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 text-slate-300" />
      <span>Modo Offline Ativo — Todos os registros e consultas salvos localmente</span>
    </div>
  );
};
