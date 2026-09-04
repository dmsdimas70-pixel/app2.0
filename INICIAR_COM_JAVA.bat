@echo off
chcp 65001 > nul
title Iniciar com Java - Monitor Loja de Móveis
color 0A

echo ===============================================================
echo     INICIALIZADOR JAVA: MONITOR DE ATENDIMENTOS E VENDAS
echo ===============================================================
echo.

set "JAR_FILE=%~dp0MonitorLoja.jar"

if not exist "%JAR_FILE%" (
    echo [ERRO] O arquivo MonitorLoja.jar não foi encontrado nesta pasta.
    echo Caminho esperado: %JAR_FILE%
    echo.
    pause
    exit /b 1
)

where javaw >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Executando com javaw (sem janela de terminal)...
    start javaw -jar "%JAR_FILE%"
    exit
)

where java >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Executando com java...
    java -jar "%JAR_FILE%"
    pause
    exit
)

echo [AVISO] Java não foi encontrado no PATH do Windows.
echo Procurando em pastas de instalação padrão...

for /r "C:\Program Files\Java" %%i in (javaw.exe) do (
    if exist "%%i" (
        echo [OK] Encontrado: %%i
        start "" "%%i" -jar "%JAR_FILE%"
        exit
    )
)
for /r "C:\Program Files (x86)\Java" %%i in (javaw.exe) do (
    if exist "%%i" (
        echo [OK] Encontrado: %%i
        start "" "%%i" -jar "%JAR_FILE%"
        exit
    )
)

echo.
echo [INFO] Java não está instalado neste computador.
echo Você pode executar o arquivo INICIAR_NO_WINDOWS.bat para abrir diretamente
echo sem precisar instalar o Java!
echo.
pause
