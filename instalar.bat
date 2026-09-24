@echo off
REM Localiza a Berlinda - Script para rodar no celular
REM Execute como Administrador

cd c:\apps\cirio

echo.
echo =====================================
echo Localiza a Berlinda - Instalador
echo =====================================
echo.

REM Verificar dispositivos conectados
echo [1/3] Verificando dispositivos conectados...
adb devices

echo.
echo [2/3] Instalando APK no celular...
echo Certifique-se de que seu celular esta conectado via USB!
echo.

REM Tentar instalar o APK
adb install -r app-debug.apk

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ APK instalado com sucesso!
    echo.
    echo [3/3] Iniciando aplicacao...
    adb shell am start -n br.com.cirio/.MainActivity
    echo.
    echo ✓ Aplicacao iniciada!
    echo Verifique seu celular...
    echo.
) else (
    echo.
    echo X Erro ao instalar APK
    echo.
    echo SOLUCOES:
    echo 1. Conecte o celular via USB
    echo 2. Ative Depuracao USB em Configuracoes ^> Opcos do Desenvolvedor
    echo 3. Execute este script como Administrador
    echo 4. Desconecte e reconecte o celular
    echo.
)

pause
