' Inicializador Silencioso do Monitor de Atendimentos e Vendas
' Executa o aplicativo sem abrir tela preta de prompt de comando

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
JarPath = ScriptDir & "\MonitorLoja.jar"
HtmlPath = ScriptDir & "\dist\index.html"

' Verifica se o JAR existe e tenta iniciar com javaw
If FSO.FileExists(JarPath) Then
    On Error Resume Next
    WshShell.Run "javaw -jar """ & JarPath & """", 0, False
    If Err.Number = 0 Then
        WScript.Quit
    End If
    On Error GoTo 0
End If

' Se o Java falhar ou não existir, abre em modo App no Edge sem instalar nada
If FSO.FileExists(HtmlPath) Then
    On Error Resume Next
    WshShell.Run "msedge --app=""file:///" & HtmlPath & """", 1, False
    If Err.Number = 0 Then
        WScript.Quit
    End If
    
    ' Se falhar o Edge, tenta o Chrome
    WshShell.Run "chrome --app=""file:///" & HtmlPath & """", 1, False
    If Err.Number = 0 Then
        WScript.Quit
    End If

    ' Fallback final: abrir o arquivo html
    WshShell.Run """" & HtmlPath & """", 1, False
    On Error GoTo 0
End If
