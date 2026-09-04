# Guia de Portabilidade, Executável Java (.jar), Windows e GitHub

Este aplicativo foi desenvolvido para atender com excelência aos requisitos de **funcionamento 100% offline**, **iniciar facilmente com arquivo executável tipo EXE/Java sem precisar instalar nada**, **segurança contra perda de dados** e **fácil publicação no GitHub**.

---

## 1. Como Iniciar no Windows (Sem Precisar Instalar Nada)

Você tem 4 opções extremamente simples para inicializar o programa em qualquer computador:

### Opção 1: Executável Java (`MonitorLoja.jar`) - O Mais Completo
- **O que é**: Um arquivo JAR auto-contido de apenas ~380 KB que já traz todo o aplicativo compilado e um servidor HTTP local de alta performance embutido (desenvolvido em Java padrão com zero dependências externas).
- **Como usar**:
  - Dê **duplo clique** no arquivo `MonitorLoja.jar`.
  - Ou clique com o botão direito e selecione **"Abrir com Java"**.
  - O aplicativo inicia o servidor local e abre automaticamente o navegador no modo aplicativo.
  - Uma janela compacta de controle em Java permite reabrir no navegador ou encerrar o programa a qualquer momento.

### Opção 2: Inicializador Inteligente (`INICIAR_NO_WINDOWS.bat`)
- Dê **duplo clique** no arquivo `INICIAR_NO_WINDOWS.bat`.
- O script detecta automaticamente se o Java está instalado:
  1. Se tiver Java: executa diretamente o `MonitorLoja.jar` em segundo plano com `javaw` (sem tela preta de terminal).
  2. Se **NÃO** tiver Java: inicializa instantaneamente em **Modo Aplicativo Nativo** usando o Microsoft Edge (`msedge --app`), que já vem pré-instalado em 100% dos computadores Windows 10 e 11.
  - **Resultado**: Abre como um programa `.exe` normal, sem barra de navegação, 100% offline e sem precisar instalar absolutamente nada!

### Opção 3: Executável Silencioso sem Prompt (`MonitorLoja.vbs`)
- Dê **duplo clique** no arquivo `MonitorLoja.vbs`.
- Executa o aplicativo de forma silenciosa, sem abrir janelas pretas de prompt de comando do Windows.

### Opção 4: Instalar como Aplicativo Nativo no Windows (PWA com 1 Clique)
- Ao abrir o aplicativo, clique no botão **"Instalar App no PC"** na barra superior (ou no ícone de instalação na barra de endereços do Chrome/Edge).
- Um atalho oficial será criado na sua **Área de Trabalho** e no **Menu Iniciar** do Windows, funcionando exatamente como um programa `.exe`.

---

## 2. Criar Atalho na Área de Trabalho

Para que as vendedoras abram o programa direto da Área de Trabalho:
1. Dê um duplo clique no arquivo `Criar_Atalho_Area_de_Trabalho.bat`.
2. Um atalho intitulado **"Monitor de Atendimentos"** será criado instantaneamente na sua Área de Trabalho.

---

## 3. Como Transformar o JAR em um Arquivo `.exe` Físico (Opcional)

Se você preferir um arquivo estritamente com a extensão `.exe`:
- O arquivo `MonitorLoja.jar` pode ser transformado diretamente em `.exe` através de ferramentas gratuitas como:
  - **Launch4j** (Gera `.exe` leve encapsulando o `.jar` com ícone personalizado).
  - **Inno Setup** (Gera instalador executável `.exe` completo para Windows).
  - **IExpress** (Nativo do próprio Windows: pressione `Win + R`, digite `iexpress` e crie um pacote executável apontando para `INICIAR_NO_WINDOWS.bat`).

---

## 4. Estrutura de Arquivos para o GitHub

O repositório já está pronto para publicação no GitHub:

```text
├── MonitorLoja.jar             # Executável Java portátil (servidor + web app embutido)
├── INICIAR_NO_WINDOWS.bat      # Inicializador universal com auto-detecção de Java
├── INICIAR_COM_JAVA.bat        # Inicializador direto para Java
├── MonitorLoja.vbs             # Inicializador silencioso sem janela preta
├── Criar_Atalho_Area_de_Trabalho.bat # Cria atalho na Área de Trabalho do Windows
├── launcher/                   # Código-fonte do Launcher Java
│   └── MonitorLojaLauncher.java
├── dist/                       # Arquivos estáticos compilados (HTML/CSS/JS)
├── public/                     # Ícones, manifest e assets do PWA
├── src/                        # Código-fonte React/TypeScript do sistema
│   ├── components/             # Telas e modais modulares
│   ├── utils/                  # Banco IndexedDB e lógica de negócio
│   └── types.ts                # Definições de tipos
├── package.json
└── README.md
```

### Como Subir para o GitHub:
```bash
git add .
git commit -m "Adiciona launcher executável Java (.jar) e scripts para Windows sem instalação"
git push origin main
```

---

## 5. Como Recompilar o Executável Java

Se fizer alterações no código React do sistema, para atualizar o arquivo `MonitorLoja.jar`:
```bash
npm run build:jar
```
Esse comando compila o projeto web com o Vite, compila a classe Java `MonitorLojaLauncher.java` e empacota tudo novamente dentro do `MonitorLoja.jar`.
