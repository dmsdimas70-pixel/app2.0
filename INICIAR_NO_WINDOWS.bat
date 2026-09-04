@echo off
chcp 65001 > nul
title Monitor de Atendimentos e Vendas - Loja de Móveis
color 1F

echo ===============================================================================
echo     MONITOR DE ATENDIMENTOS E VENDAS - LOJA DE MÓVEIS (VERSÃO PORTÁTIL)
echo ===============================================================================
echo.
echo  Iniciando aplicativo no modo portátil 100%% offline...
echo.

:: Se a pasta dist existir, abre diretamente o aplicativo no navegador nativo do Windows (Chrome ou Edge)
if exist "%~dp0dist\index.html" (
    echo [OK] Arquivo compilado encontrado em dist\index.html.
    echo Abrindo no Microsoft Edge ou Google Chrome...
    start msedge --app="file:///%~dp0dist\index.html" 2>nul || start chrome --app="file:///%~dp0dist\index.html" 2>nul || start "" "%~dp0dist\index.html"
    exit
)

:: Se estiver rodando o servidor de desenvolvimento
if exist "%~dp0package.json" (
    echo [INFO] Abrindo no navegador local:
    start http://localhost:3000
    exit
)

echo [ERRO] Não foi possível localizar os arquivos do aplicativo.
pause
