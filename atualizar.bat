@echo off
REM Atualizar app com as mudanças recentes

cd /d c:\apps\cirio

echo.
echo [*] Preparando mudancas para Android...
echo.

call npm run prepare-android 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [✓] App preparado com sucesso!
    echo.
    echo [*] Execute para reinstalar:
    echo     adb install -r app-debug.apk
    echo.
) else (
    echo.
    echo [!] Erro na preparacao
    echo.
)

pause
