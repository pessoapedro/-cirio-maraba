#!/usr/bin/env pwsh
# Rodar App no Celular - Círio de Nazaré
# Execute como Administrador

Write-Host "`n`n" -ForegroundColor Yellow
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CÍRIO DE NAZARÉ - Instalador para Celular Android        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Verificar se é Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Este script requer privilégios de Administrador!" -ForegroundColor Red
    Write-Host "Por favor, execute PowerShell como Administrador e tente novamente." -ForegroundColor Red
    exit
}

$projectPath = "c:\apps\cirio"
Set-Location $projectPath

# ========================================
# STEP 1: Verificar Dispositivos
# ========================================
Write-Host "[1/4] Verificando dispositivos conectados..." -ForegroundColor Yellow
Write-Host "Executando: adb devices`n" -ForegroundColor Gray

$devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -and $_ -notmatch "List of" }

if (-not $devices -or $devices.Count -eq 0 -or $devices -eq "") {
    Write-Host "❌ Nenhum dispositivo encontrado!" -ForegroundColor Red
    Write-Host "`n📱 SOLUÇÃO RÁPIDA:" -ForegroundColor Yellow
    Write-Host "1. Conecte seu celular via USB" -ForegroundColor White
    Write-Host "2. Abra Configurações > Opções do Desenvolvedor > Ative 'Depuração USB'" -ForegroundColor White
    Write-Host "3. No seu celular, clique 'Permitir' quando for solicitada autorização" -ForegroundColor White
    Write-Host "4. Tente novamente`n" -ForegroundColor White
    
    Read-Host "Pressione Enter para tentar novamente"
    exit
}

Write-Host "✅ Dispositivo(s) encontrado(s):" -ForegroundColor Green
$devices | ForEach-Object {
    Write-Host "   → $_" -ForegroundColor Green
}

# ========================================
# STEP 2: Verificar APK
# ========================================
Write-Host "`n[2/4] Verificando arquivo APK..." -ForegroundColor Yellow

$apkPath = "$projectPath\app-debug.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "❌ Arquivo APK não encontrado em: $apkPath" -ForegroundColor Red
    Write-Host "`n🔨 Compilando APK..." -ForegroundColor Yellow
    
    try {
        npx cordova build android
        if (-not (Test-Path $apkPath)) {
            Write-Host "❌ Erro ao compilar APK. Tente manualmente:" -ForegroundColor Red
            Write-Host "   cordova build android" -ForegroundColor Gray
            exit
        }
    } catch {
        Write-Host "❌ Erro na compilação: $_" -ForegroundColor Red
        exit
    }
}

Write-Host "✅ APK encontrado: $apkPath" -ForegroundColor Green

# ========================================
# STEP 3: Instalar APK
# ========================================
Write-Host "`n[3/4] Instalando APK no celular..." -ForegroundColor Yellow
Write-Host "Executando: adb install -r app-debug.apk`n" -ForegroundColor Gray

$installOutput = adb install -r $apkPath 2>&1
Write-Host $installOutput -ForegroundColor Gray

if ($installOutput -match "Success" -or $LASTEXITCODE -eq 0) {
    Write-Host "`n✅ APK instalado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Erro ao instalar APK" -ForegroundColor Red
    Write-Host $installOutput -ForegroundColor Red
    exit
}

# ========================================
# STEP 4: Iniciar Aplicação
# ========================================
Write-Host "`n[4/4] Iniciando aplicação..." -ForegroundColor Yellow

Start-Sleep -Seconds 2

$startOutput = adb shell am start -n "br.com.cirio/.MainActivity" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Aplicação iniciada com sucesso!" -ForegroundColor Green
    Write-Host "`n🎉 Tudo pronto! Verifique seu celular..." -ForegroundColor Green
} else {
    Write-Host "⚠️  Possível erro ao iniciar" -ForegroundColor Yellow
    Write-Host $startOutput -ForegroundColor Gray
    Write-Host "`n💡 Dica: Procure 'Círio de Nazaré' em Meus Apps e abra manualmente" -ForegroundColor Yellow
}

# ========================================
# Informações Úteis
# ========================================
Write-Host "`n`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      PRÓXIMAS ETAPAS                           ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║ 1. Verifique seu celular para o app 'Círio de Nazaré'        ║" -ForegroundColor Cyan
Write-Host "║ 2. Abra o app                                                  ║" -ForegroundColor Cyan
Write-Host "║ 3. Permita acesso à Localização (GPS) quando solicitado        ║" -ForegroundColor Cyan
Write-Host "║ 4. Clique em 'Mapa' para visualizar                           ║" -ForegroundColor Cyan
Write-Host "║ 5. Clique em 'Iniciar Rastreamento' para começar             ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📝 Informações da Aplicação:" -ForegroundColor Yellow
Write-Host "   Pacote: br.com.cirio" -ForegroundColor White
Write-Host "   Versão: Debug (Desenvolvimento)" -ForegroundColor White
Write-Host "   Plataforma: Android 6.0+" -ForegroundColor White

Write-Host "`n💛 Desenvolvido para o Círio de Nazaré`n" -ForegroundColor Yellow

Read-Host "Pressione Enter para finalizar"
