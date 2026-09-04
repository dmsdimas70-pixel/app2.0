@echo off
chcp 65001 > nul
title Criar Atalho na Área de Trabalho - Monitor Loja de Móveis

echo Criando atalho na Área de Trabalho...

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'Monitor de Atendimentos.lnk')); $s.TargetPath = '%~dp0INICIAR_NO_WINDOWS.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Monitor de Atendimentos e Vendas - Loja de Móveis'; $s.Save()"

if %errorlevel% equ 0 (
    echo [SUCESSO] Atalho criado na sua Área de Trabalho com sucesso!
) else (
    echo [AVISO] Não foi possível criar o atalho automaticamente via PowerShell.
)

echo.
timeout /t 3
