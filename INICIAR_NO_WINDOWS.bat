@echo off
chcp 65001 > nul
title Monitor de Atendimentos e Vendas - Loja de Móveis
color 1F

echo ===============================================================================
echo     MONITOR DE ATENDIMENTOS E VENDAS - LOJA DE MÓVEIS (PORTÁTIL)
echo ===============================================================================
echo.
echo  Verificando ambiente para inicialização imediata sem instalação...
echo.

set "SCRIPT_DIR=%~dp0"
set "JAR_FILE=%SCRIPT_DIR%MonitorLoja.jar"
set "HTML_FILE=%SCRIPT_DIR%dist\index.html"

:: 1. TENTATIVA 1: Executar diretamente via Java (JAR Executável Embutido)
where javaw >nul 2>nul
if %errorlevel% equ 0 (
    if exist "%JAR_FILE%" (
        echo [OK] Java detectado! Iniciando executável Java (%JAR_FILE%)...
        start javaw -jar "%JAR_FILE%"
        echo Aplicativo iniciado com sucesso em segundo plano!
        timeout /t 2 >nul
        exit
    )
)

where java >nul 2>nul
if %errorlevel% equ 0 (
    if exist "%JAR_FILE%" (
        echo [OK] Java detectado! Iniciando servidor Java...
        start "" java -jar "%JAR_FILE%"
        echo Aplicativo iniciado com sucesso!
        timeout /t 2 >nul
        exit
    )
)

:: 2. TENTATIVA 2: Procurar Java em pastas comuns do Windows (Program Files)
for /r "C:\Program Files\Java" %%i in (javaw.exe) do (
    if exist "%%i" if exist "%JAR_FILE%" (
        echo [OK] Java localizado em: %%i
        start "" "%%i" -jar "%JAR_FILE%"
        timeout /t 2 >nul
        exit
    )
)
for /r "C:\Program Files (x86)\Java" %%i in (javaw.exe) do (
    if exist "%%i" if exist "%JAR_FILE%" (
        echo [OK] Java localizado em: %%i
        start "" "%%i" -jar "%JAR_FILE%"
        timeout /t 2 >nul
        exit
    )
)

:: 3. TENTATIVA 3: Inicialização Nativa Sem Instalar Nada (Microsoft Edge Modo App)
:: O Microsoft Edge já vem instalado em 100% dos computadores Windows 10 e 11!
if exist "%HTML_FILE%" (
    echo [OK] Iniciando aplicativo em Modo Executável Nativo (Sem Instalar Nada)...
    start msedge --app="file:///%HTML_FILE%" 2>nul
    if %errorlevel% equ 0 (
        timeout /t 1 >nul
        exit
    )

    :: Se falhar, tenta Google Chrome no modo app
    start chrome --app="file:///%HTML_FILE%" 2>nul
    if %errorlevel% equ 0 (
        timeout /t 1 >nul
        exit
    )

    :: Se falhar, abre no navegador padrão
    start "" "%HTML_FILE%"
    timeout /t 1 >nul
    exit
)

:: 4. Se estiver em ambiente Node.js dev
if exist "%SCRIPT_DIR%package.json" (
    echo [INFO] Abrindo endereço local:
    start http://localhost:3000
    exit
)

echo [ERRO] Não foi possível localizar o arquivo executável.
echo Certifique-se de que o arquivo dist\index.html ou MonitorLoja.jar está na mesma pasta.
echo.
pause
