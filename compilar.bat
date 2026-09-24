@echo off
REM Compilar app com as mudanças recentes
REM Este script gera um novo APK com todas as atualizações

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              RECOMPILANDO APP - Círio de Nazaré               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d c:\apps\cirio

echo [1/3] Preparando código...
call npx cordova prepare android

if %ERRORLEVEL% NEQ 0 (
    echo [!] Erro ao preparar código
    pause
    exit /b 1
)

echo [✓] Código preparado
echo.
echo [2/3] Compilando para Android...
call npx cordova build android

if %ERRORLEVEL% NEQ 0 (
    echo [!] Erro ao compilar
    pause
    exit /b 1
)

echo [✓] Compilação concluída!
echo.
echo [3/3] Verificando APK...

if exist "c:\apps\cirio\app-debug.apk" (
    echo [✓] APK gerado com sucesso!
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║                   PRÓXIMA ETAPA                               ║
    echo ╠════════════════════════════════════════════════════════════════╣
    echo ║                                                                ║
    echo ║ Execute para instalar no celular:                             ║
    echo ║                                                                ║
    echo ║   .\InstalarNocelular.ps1                                     ║
    echo ║                                                                ║
    echo ║ Ou manualmente:                                               ║
    echo ║                                                                ║
    echo ║   adb install -r app-debug.apk                                ║
    echo ║                                                                ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
) else (
    echo [!] APK não foi gerado
    echo.
)

pause
