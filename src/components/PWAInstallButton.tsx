import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, MonitorCheck, Smartphone, X, Laptop } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed in standalone window, show subtle status badge
  if (isInstalled) {
    return (
      <div
        id="badge-pwa-installed"
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold"
        title="O aplicativo está rodando em modo nativo desktop instalado"
      >
        <MonitorCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Aplicativo Instalado</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        id="btn-install-pwa"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowGuide(true);
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-sm transition-all"
        title="Instalar no Windows ou Celular como aplicativo portátil"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App no PC</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      {/* Guide Modal if browser prompt isn't directly triggered (or for iOS / manual desktop install) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Instalar como Aplicativo Portátil
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                Este sistema pode ser instalado diretamente no seu computador Windows, Mac ou Celular
                como um <strong>aplicativo portátil nativo</strong>, funcionando 100% offline e sem
                necessidade de instalar Python, Node.js ou ferramentas de programação:
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <span>No Google Chrome ou Microsoft Edge (Windows):</span>
                </div>
                <p>
                  1. Clique no ícone de instalação <Download className="w-3 h-3 inline text-indigo-600" /> na barra de endereços do navegador (lado direito superior).
                  <br />
                  2. Ou clique nos <strong>três pontinhos (...)</strong> &gt; <strong>Salvar e Compartilhar</strong> &gt; <strong>Instalar Loja de Móveis</strong>.
                  <br />
                  3. Um atalho executável será criado na sua Área de Trabalho e no Menu Iniciar.
                </p>
              </div>

              {isIOS && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>No iPhone / iPad (Safari):</span>
                  </div>
                  <p>
                    1. Toque no botão <strong>Compartilhar</strong> (ícone de seta no Safari).
                    <br />
                    2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </p>
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic">
                * Uma vez instalado, abra diretamente pelo ícone na Área de Trabalho com 1 clique.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
