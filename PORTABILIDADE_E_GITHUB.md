# Guia de Portabilidade, Instalação no Windows e GitHub

Este aplicativo foi desenvolvido para atender com excelência aos requisitos de **funcionamento 100% offline**, **portabilidade em qualquer computador Windows sem ferramentas de programação**, **segurança contra perda de dados** e **fácil publicação no GitHub**.

---

## 1. Como Usar no Windows Sem Instalar Node.js ou Python

Existem duas formas ultra-simples para o usuário final abrir o sistema diretamente:

### Método A: Instalação com 1 Clique (PWA Portátil - Recomendado)
1. Abra o aplicativo no **Google Chrome** ou **Microsoft Edge** (já vem instalado em qualquer Windows).
2. Clique no botão **"Instalar App no PC"** na barra superior do sistema (ou no ícone de computador/instalação na barra de endereços do navegador).
3. Pronto! Um atalho oficial será adicionado à sua **Área de Trabalho** e ao **Menu Iniciar** do Windows.
4. Ao clicar no ícone, ele abre em uma janela própria de aplicativo independente (sem barra de navegação), funcionando exatamente como um executável tradicional (`.exe`) e **100% offline**, sem precisar de conexão com a internet.

### Método B: Arquivo Executável em Lote (`INICIAR_NO_WINDOWS.bat`)
- Foi incluído o arquivo `INICIAR_NO_WINDOWS.bat` na raiz do projeto.
- Dê um duplo clique nele para abrir o sistema diretamente em modo aplicativo nativo no Edge ou Chrome.

---

## 2. Estrutura de Pastas para Enviar ao GitHub

Ao transferir o projeto para o seu GitHub, a organização é limpa e padronizada:

```text
├── public/                     # Ícones PWA, logos e manifest
│   ├── icon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── pwa-maskable-512x512.png
├── src/                        # Código fonte do sistema
│   ├── components/             # Telas e modais modulares
│   │   ├── BackupSecurityView.tsx  # Área de Backup e Segurança
│   │   ├── CatalogView.tsx         # Gestão de Campanhas, Produtos e Origens
│   │   ├── HistoryView.tsx         # Pesquisa e Filtros de Histórico
│   │   ├── DailyView.tsx           # Visão Diária da Vendedora
│   │   ├── DashboardView.tsx       # Gráficos e Indicadores Consolidados
│   │   ├── ReportsView.tsx         # Relatórios e Exportação CSV/Impressão
│   │   ├── AutomatedAnalysisView.tsx # Diagnóstico Inteligente & Comparativo
│   │   ├── InteractionModal.tsx    # Modal de Cadastro/Edição
│   │   ├── DeleteConfirmModal.tsx  # Confirmação de Exclusão Definitiva
│   │   ├── QuickStatusModal.tsx    # Mudança Rápida de Status
│   │   └── PWAInstallButton.tsx    # Botão de Instalação no Windows
│   ├── hooks/                  # Hooks PWA e Status Offline
│   │   ├── usePWAInstall.ts
│   │   └── useOnlineStatus.ts
│   ├── types.ts                # Definições de Tipos TypeScript
│   ├── utils/
│   │   ├── storage.ts          # Banco de Dados Local (IndexedDB + Mirror)
│   │   ├── defaults.ts         # Itens padrão de campanhas e origens
│   │   └── analytics.ts        # Cálculo de conversão e ticket médio
│   ├── App.tsx                 # Ponto de entrada do sistema
│   └── main.tsx
├── INICIAR_NO_WINDOWS.bat      # Arquivo para inicialização rápida no Windows
├── vite.config.ts              # Configuração Vite e Service Worker PWA
├── package.json
└── README.md
```

### Como Subir para o GitHub:
```bash
git init
git add .
git commit -m "Versão portátil completa do Monitor de Atendimentos e Vendas"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

---

## 3. Segurança e Persistência dos Dados (Sem Perda de Informações)

- **Dual-Storage (IndexedDB + LocalStorage)**: Qualquer atendimento salvo, editado ou excluído é gravado simultaneamente no banco transacional IndexedDB e no armazenamento local síncrono.
- **Proteção contra quedas**: Se o computador for reiniciado ou o programa for fechado repentinamente, nenhuma informação é perdida.
- **Área de Backup e Segurança**:
  - **Backup Manual**: 1-clique para gerar e baixar um arquivo `.json` carimbado com data e hora.
  - **Snapshots Automáticos**: O sistema salva internamente snapshots a cada 30 minutos e a cada alteração crítica, permitindo restauração imediata.
  - **Restauração Segura**: Suporte a *Substituir Tudo* ou *Mesclar Dados* (para somar atendimentos sem duplicar registros).
- **Regra 21 (Preservação Histórica)**: Campanhas, produtos ou origens desativadas na aba de Cadastros continuam perfeitamente visíveis em todos os relatórios e atendimentos do passado.
