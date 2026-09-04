import React, { useState, useRef } from 'react';
import { CustomerInteraction, AppSettings, BackupFile, BackupSnapshot } from '../types';
import {
  exportManualBackup,
  restoreBackupData,
  getLocalSnapshots,
  getLastBackupTimestamp,
  createLocalSnapshot,
} from '../utils/storage';
import { downloadSQLiteDump } from '../utils/sqliteExport';
import {
  ShieldCheck,
  Download,
  Upload,
  HardDrive,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Calendar,
  Layers,
  FileCheck,
  RefreshCw,
  FolderDown,
} from 'lucide-react';

interface BackupSecurityViewProps {
  interactions: CustomerInteraction[];
  settings: AppSettings;
  onDataRestored: (newInteractions: CustomerInteraction[], newSettings?: AppSettings) => void;
  onNotify: (msg: string) => void;
}

export const BackupSecurityView: React.FC<BackupSecurityViewProps> = ({
  interactions,
  settings,
  onDataRestored,
  onNotify,
}) => {
  const [lastBackup, setLastBackup] = useState<string | null>(getLastBackupTimestamp());
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(getLocalSnapshots());
  const [restoreFile, setRestoreFile] = useState<BackupFile | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string>('');
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualBackup = () => {
    setIsProcessing(true);
    try {
      const res = exportManualBackup(interactions, settings);
      const now = new Date().toISOString();
      setLastBackup(now);
      setSnapshots(getLocalSnapshots());
      setStatusMessage({
        type: 'success',
        text: `Backup gerado com sucesso! Arquivo "${res.filename}" salvo com ${res.count} atendimentos.`,
      });
      onNotify('Backup manual baixado com sucesso!');
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Erro ao gerar arquivo de backup. Verifique as permissões de download.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed: BackupFile = JSON.parse(content);
        if (!parsed || !Array.isArray(parsed.interactions)) {
          throw new Error('Formato de arquivo inválido. Faltando lista de atendimentos.');
        }
        setRestoreFile(parsed);
        setStatusMessage({
          type: 'info',
          text: `Arquivo "${file.name}" lido com sucesso! Contém ${parsed.interactions.length} atendimentos registrados. Escolha a forma de restauração abaixo.`,
        });
      } catch (err: unknown) {
        setRestoreFile(null);
        setStatusMessage({
          type: 'error',
          text: `Falha ao validar arquivo: ${err instanceof Error ? err.message : 'Arquivo corrompido ou formato não suportado'}.`,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!restoreFile) return;

    const confirmMsg =
      restoreMode === 'replace'
        ? `Atenção: A opção "Substituir" irá sobrescrever todos os dados atuais pelos ${restoreFile.interactions.length} registros do backup. Deseja continuar?`
        : `A opção "Mesclar" irá adicionar os registros do backup aos dados atuais sem duplicar. Deseja continuar?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const result = restoreBackupData(restoreFile, restoreMode);
      onDataRestored(
        restoreMode === 'replace'
          ? restoreFile.interactions
          : // For merge, the storage module already merged and saved
            restoreFile.interactions,
        restoreFile.settings
      );
      setLastBackup(new Date().toISOString());
      setSnapshots(getLocalSnapshots());
      setRestoreFile(null);
      setRestoreFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setStatusMessage({
        type: 'success',
        text: result.message,
      });
      onNotify('Dados restaurados com sucesso!');
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: `Erro na restauração: ${err instanceof Error ? err.message : 'Falha desconhecida'}`,
      });
    }
  };

  const handleRestoreSnapshot = (snap: BackupSnapshot) => {
    if (
      !window.confirm(
        `Deseja restaurar o snapshot local de ${new Date(snap.timestamp).toLocaleString('pt-BR')} com ${snap.interactionCount} registros?`
      )
    ) {
      return;
    }

    try {
      restoreBackupData(snap.data, 'replace');
      onDataRestored(snap.data.interactions, snap.data.settings);
      setStatusMessage({
        type: 'success',
        text: `Snapshot local restaurado com sucesso! ${snap.interactionCount} atendimentos carregados.`,
      });
      onNotify('Snapshot restaurado com sucesso!');
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: `Erro ao restaurar snapshot: ${err instanceof Error ? err.message : 'Falha'}`,
      });
    }
  };

  const formatDateTime = (isoStr: string | null) => {
    if (!isoStr) return 'Nenhum backup realizado ainda';
    try {
      const d = new Date(isoStr);
      return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Backup e Segurança dos Dados</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Proteção contra perda de dados, salvamento local contínuo e recuperação portátil
            </p>
          </div>
        </div>

        {/* Status do Último Backup */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Último Backup Registrado
            </span>
            <span className="font-bold text-slate-800">{formatDateTime(lastBackup)}</span>
          </div>
        </div>
      </div>

      {/* Alerta de Status / Notificação */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <FileCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{statusMessage.text}</div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Backup Manual + Restauração */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: EXPORTAR BACKUP MANUAL */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <FolderDown className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Criar Backup Manual</h2>
                <p className="text-[11px] text-slate-500">
                  Gere um arquivo de segurança para salvar em um pendrive ou pasta do Windows
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Atendimentos no banco de dados:</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">
                    {interactions.length} registros
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Nome da loja vinculada:</span>
                  <span className="font-semibold text-slate-800">{settings.storeName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Cadastros configurados:</span>
                  <span className="font-semibold text-slate-800">
                    {settings.campaigns.length} campanhas • {settings.products.length} produtos
                  </span>
                </div>
              </div>

              <p className="text-slate-500 text-[11px] leading-relaxed">
                O arquivo de backup gerado é 100% autônomo e legível em formato JSON. Você pode
                salvá-lo na sua pasta de Documentos, Nuvem (Google Drive, OneDrive) ou Pendrive
                para garantir segurança total.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              type="button"
              id="btn-generate-manual-backup"
              onClick={handleManualBackup}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo de Backup Completo (.json)</span>
            </button>

            <button
              type="button"
              id="btn-export-sqlite-sql"
              onClick={() => {
                downloadSQLiteDump(interactions, settings);
                onNotify('Script DDL/DML SQLite (.sql) exportado com sucesso!');
              }}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 active:bg-black text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Exportar Banco de Dados SQLite (.sql)</span>
            </button>
          </div>
        </div>

        {/* CARD 2: RESTAURAR BACKUP */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Upload className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Restaurar Backup</h2>
                <p className="text-[11px] text-slate-500">
                  Carregue um arquivo de backup para recuperar atendimentos e cadastros
                </p>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-600">
              {/* Input de arquivo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Selecione o arquivo de backup (.json):
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-xl p-1 bg-slate-50"
                />
              </div>

              {/* Informações do arquivo carregado */}
              {restoreFile && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 animate-fadeIn text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>{restoreFileName}</span>
                    <span className="font-mono text-xs bg-emerald-200/60 px-2 py-0.5 rounded-md">
                      {restoreFile.interactions.length} registros
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Exportado em: {new Date(restoreFile.exportDate).toLocaleString('pt-BR')} • Loja:{' '}
                    <strong>{restoreFile.storeName}</strong>
                  </p>

                  {/* Modo de restauração */}
                  <div className="pt-2 border-t border-emerald-200/60">
                    <label className="block text-[11px] font-bold text-emerald-950 mb-1.5">
                      Método de Restauração:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRestoreMode('replace')}
                        className={`p-2 rounded-lg border text-left text-[11px] transition-all ${
                          restoreMode === 'replace'
                            ? 'bg-white border-emerald-600 font-bold text-emerald-950 shadow-xs'
                            : 'bg-emerald-100/50 border-transparent text-emerald-800'
                        }`}
                      >
                        <strong>Substituir Tudo</strong>
                        <p className="text-[10px] opacity-80 mt-0.5">Sobrescreve a base atual</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestoreMode('merge')}
                        className={`p-2 rounded-lg border text-left text-[11px] transition-all ${
                          restoreMode === 'merge'
                            ? 'bg-white border-emerald-600 font-bold text-emerald-950 shadow-xs'
                            : 'bg-emerald-100/50 border-transparent text-emerald-800'
                        }`}
                      >
                        <strong>Mesclar Dados</strong>
                        <p className="text-[10px] opacity-80 mt-0.5">Junta sem duplicar registros</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              id="btn-confirm-restore-backup"
              onClick={handleExecuteRestore}
              disabled={!restoreFile}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Registros Selecionados</span>
            </button>
          </div>
        </div>
      </div>

      {/* SNAPSHOTS LOCAIS AUTOMÁTICOS (PONTOS DE RESTAURAÇÃO) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Snapshots Locais Automáticos (Pontos de Restauração)
              </h2>
              <p className="text-[11px] text-slate-500">
                Cópias de segurança mantidas internamente no navegador e no banco local para recuperação imediata
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              createLocalSnapshot(
                {
                  version: '1.0.0',
                  appName: 'Monitor de Atendimentos e Vendas',
                  exportDate: new Date().toISOString(),
                  storeName: settings.storeName,
                  totalInteractions: interactions.length,
                  interactions,
                  settings,
                },
                'Snapshot manual criado na aba de segurança'
              );
              setSnapshots(getLocalSnapshots());
              onNotify('Novo snapshot local criado com sucesso!');
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Criar Snapshot Agora</span>
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Nenhum snapshot automático gerado ainda. O sistema cria automaticamente a cada operação de backup ou alteração significativa.
          </div>
        ) : (
          <div className="space-y-2">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 font-mono">
                      {new Date(snap.timestamp).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(snap.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[10px]">
                      {snap.interactionCount} registros
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{snap.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestoreSnapshot(snap)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 self-end sm:self-auto shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Restaurar Este Ponto</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODO EXECUTÁVEL PORTÁTIL (JAVA .JAR / WINDOWS) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <span>Executável Portátil (Java .JAR / Windows .BAT / .EXE)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inicie o programa diretamente em qualquer computador sem precisar instalar ferramentas de desenvolvimento.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Executável Pronto: MonitorLoja.jar</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">1</span>
              <span className="font-bold text-xs text-slate-800">MonitorLoja.jar (Java)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Arquivo executável em Java de 380 KB com servidor HTTP local embutido. Basta dar um <strong>duplo clique</strong> para rodar e abrir o navegador automaticamente.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">2</span>
              <span className="font-bold text-xs text-slate-800">INICIAR_NO_WINDOWS.bat</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Detecta se o Java existe. Se não tiver Java instalado, abre instantaneamente em <strong>Modo App no Edge</strong> sem instalar absolutamente nada!
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">3</span>
              <span className="font-bold text-xs text-slate-800">Atalho na Área de Trabalho</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dê um duplo clique no arquivo <strong>Criar_Atalho_Area_de_Trabalho.bat</strong> para gerar o ícone na sua Área de Trabalho com 1 toque.
            </p>
          </div>
        </div>
      </div>

      {/* INSTRUÇÕES TÉCNICAS E ARQUITETURA OFFLINE */}
      <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 text-xs space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <span>Arquitetura de Persistência e Portabilidade</span>
        </h3>
        <p className="leading-relaxed text-slate-400">
          • <strong>IndexedDB + LocalStorage Dual-Mirroring</strong>: O sistema grava de forma síncrona no LocalStorage e assíncrona no banco de dados local IndexedDB do navegador. Isso impede perda de dados em caso de fechamento acidental da janela ou reinicialização do computador.
        </p>
        <p className="leading-relaxed text-slate-400">
          • <strong>Independência de Internet</strong>: O Service Worker armazena em cache todos os arquivos estáticos (HTML, JS, CSS, fontes e ícones). Você pode desligar o Wi-Fi e utilizar o sistema normalmente.
        </p>
        <p className="leading-relaxed text-slate-400">
          • <strong>Preservação Histórica (Regra 21)</strong>: Desativar qualquer campanha, produto ou origem nunca apaga registros históricos. Os relatórios anteriores continuam exibindo dados normalmente.
        </p>
      </div>
    </div>
  );
};
