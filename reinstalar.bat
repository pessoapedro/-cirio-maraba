@echo off
REM Reinstalar app no celular com a nova versão compilada

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║        REINSTALANDO APP NO CELULAR COM MUDANÇAS              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d c:\apps\cirio

echo [1/2] Verificando conexão com o celular...
adb devices

echo.
echo [2/2] Instalando novo APK...
adb install -r app-debug.apk

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [✓] APP INSTALADO COM SUCESSO!
    echo.
    echo Iniciando aplicação...
    adb shell am start -n br.com.cirio/.MainActivity
    echo.
    echo [✓] APP INICIADO!
    echo.
    echo ✨ Verifique seu celular para as mudanças:
    echo    - Splash screen mais rápido (2 segundos)
    echo    - Tema dourado em todo o app
    echo    - Cores consistentes
    echo.
) else (
    echo.
    echo [!] ERRO ao instalar APK
    echo.
    echo Certifique-se de que:
    echo  1. Seu celular está conectado via USB
    echo  2. A Depuração USB está ativada
    echo  3. Você autorizou a depuração neste computador
    echo.
)

pause
