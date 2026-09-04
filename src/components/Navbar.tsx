import React from 'react';
import {
  CalendarDays,
  History,
  LayoutDashboard,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Sparkles,
  Settings,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab =
  | 'daily'
  | 'history'
  | 'dashboard'
  | 'reports'
  | 'catalog'
  | 'backup'
  | 'analysis';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  storeName: string;
  currentDate: string;
  onOpenSettings: () => void;
  onNewInteraction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  storeName,
  currentDate,
  onOpenSettings,
  onNewInteraction,
}) => {
  // Format date display (ex: Sexta-feira, 04/09/2026)
  const formatHeaderDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const weekday = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ][d.getDay()];
    return `${weekday}, ${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'daily', label: 'Atendimentos do Dia', icon: CalendarDays },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Relatórios', icon: FileSpreadsheet },
    { id: 'catalog', label: 'Cadastros', icon: Layers },
    { id: 'backup', label: 'Backup & Segurança', icon: ShieldCheck },
    { id: 'analysis', label: 'Análise & Comparativo', icon: Sparkles },
  ];

  return (
    <header className="print:hidden sticky top-0 z-30 shadow-sm">
      {/* Top Main Dark Slate Bar (#0F172A with #334155 border) */}
      <div className="bg-[#0F172A] text-white border-b border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-indigo-400 leading-tight">
                  {storeName.toUpperCase().includes('MÓVEIS') ? (
                    <>
                      MÓVEIS<span className="text-white font-black">PREMIUM</span>
                    </>
                  ) : (
                    <>
                      <span className="text-indigo-400 font-bold">{storeName}</span>
                    </>
                  )}
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                  Controle Portátil • 100% Offline
                </p>
              </div>
            </div>

            {/* Nav Tabs (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500 shadow-xs font-bold'
                        : 'text-slate-300 opacity-70 hover:opacity-100 hover:bg-slate-800/80 cursor-pointer'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Tools: PWA Install Button, Settings */}
            <div className="flex items-center space-x-2.5">
              <PWAInstallButton />

              <button
                id="btn-open-settings"
                onClick={onOpenSettings}
                title="Configurações Gerais da Loja"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Tabs */}
        <div className="lg:hidden flex space-x-1 px-4 py-2 overflow-x-auto scrollbar-none border-t border-[#334155] bg-[#0F172A]/95">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 font-bold border-l-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Header (White bar with metadata and quick action button) */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs">
          <span className="font-semibold text-slate-600">Fluxo e Conversão de Loja</span>
          <span className="h-3.5 w-[1px] bg-slate-300 hidden xs:inline-block"></span>
          <span className="font-bold text-slate-800 uppercase tracking-tight text-[11px] sm:text-xs">
            {formatHeaderDate(currentDate)}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-quick-new-interaction"
            onClick={onNewInteraction}
            className="bg-indigo-600 text-white px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>+ NOVO ATENDIMENTO</span>
          </button>
        </div>
      </div>
    </header>
  );
};
